/**
 * GitHub GraphQL API client for batch fetching repository data
 * Replaces multiple REST API calls with a single GraphQL query
 */

/**
 * Fetch status for multiple repositories in a single GraphQL query
 * @param {Array} repos - Array of repo objects with {name, owner} properties
 * @param {string} token - GitHub authentication token
 * @returns {Promise<Array>} Array of {name, status} objects
 */
export async function fetchMultipleRepoStatuses(repos, token) {
  if (!repos || repos.length === 0) {
    return []
  }

  // GitHub limits GraphQL aliases to ~50 per query
  const batchSize = 50
  const batches = []
  
  for (let i = 0; i < repos.length; i += batchSize) {
    batches.push(repos.slice(i, i + batchSize))
  }

  // Process all batches in parallel
  const results = await Promise.all(
    batches.map(batch => fetchBatch(batch, token))
  )

  return results.flat()
}

/**
 * Fetch a single batch of up to 50 repositories
 */
async function fetchBatch(repos, token) {
  // Build GraphQL query with aliases for each repo
  const query = `
    query FetchRepoStatuses {
      ${repos.map((repo, i) => `
        repo${i}: repository(owner: "${repo.owner}", name: "${repo.name}") {
          description
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          pullRequests(states: OPEN, first: 100) {
            totalCount
          }
          defaultBranchRef {
            target {
              ... on Commit {
                statusCheckRollup {
                  contexts(first: 1) {
                    nodes {
                      ... on CheckRun {
                        status
                        conclusion
                        name
                        detailsUrl
                      }
                    }
                  }
                }
                checkSuites(first: 5) {
                  nodes {
                    status
                    conclusion
                    updatedAt
                    createdAt
                    workflowRun {
                      workflow {
                        name
                      }
                      event
                      databaseId
                      url
                      updatedAt
                      createdAt
                    }
                    headBranch: branch {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `).join('\n')}
    }
  `

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      // Still try to process partial data if available
    }

    // Transform GraphQL response to match REST API format
    return repos.map((repo, i) => {
      const repoData = data.data?.[`repo${i}`]
      
      if (!repoData) {
        return {
          name: repo.name,
          owner: repo.owner,
          status: { error: 'Repository not found or inaccessible' }
        }
      }

      // Extract workflow run from checkSuites - get the most recent one
      const checkSuites = repoData.defaultBranchRef?.target?.checkSuites?.nodes || []
      
      // Find the most recently updated checkSuite with a workflow run
      // Prioritize workflow run timestamps over checkSuite timestamps for accuracy
      const checkSuite = checkSuites
        .filter(cs => cs.workflowRun)
        .sort((a, b) => {
          // Use workflow run's updatedAt/createdAt for more accurate recency
          const dateA = new Date(a.workflowRun?.updatedAt || a.workflowRun?.createdAt || a.updatedAt || a.createdAt)
          const dateB = new Date(b.workflowRun?.updatedAt || b.workflowRun?.createdAt || b.updatedAt || b.createdAt)
          return dateB - dateA // Most recent first
        })[0]
      
      const workflowRun = checkSuite?.workflowRun

      const status = {
        description: repoData.description || null,
        openPRCount: repoData.pullRequests?.totalCount || 0,
        topics: repoData.repositoryTopics?.nodes?.map(n => n.topic.name) || [],
      }

      if (checkSuite && workflowRun) {
        // Get commit message from the commit (need to fetch separately or use CheckSuite data)
        const commitMessage = `Workflow: ${workflowRun.workflow?.name || 'Unknown'}`
        
        status.status = checkSuite.status?.toLowerCase() || 'unknown'
        status.conclusion = checkSuite.conclusion?.toLowerCase() || null
        status.workflow = workflowRun.workflow?.name || 'Unknown Workflow'
        status.branch = checkSuite.headBranch?.name || 'unknown'
        status.commitMessage = commitMessage
        status.url = workflowRun.url || `https://github.com/${repo.owner}/${repo.name}/actions`
        // Prioritize workflow run timestamps for accuracy - they're more reliable than checkSuite timestamps
        status.updatedAt = workflowRun.updatedAt || workflowRun.createdAt || checkSuite.updatedAt || checkSuite.createdAt
        status.runId = workflowRun.databaseId || null
      } else {
        status.status = 'no_runs'
        status.conclusion = null
        // Set updatedAt to null so repos without runs sort to the end
        status.updatedAt = null
      }

      return {
        name: repo.name,
        owner: repo.owner,
        status
      }
    })
  } catch (error) {
    console.error('GraphQL batch fetch failed:', error)
    // Return error status for all repos in this batch
    return repos.map(repo => ({
      name: repo.name,
      owner: repo.owner,
      status: { error: error.message }
    }))
  }
}
