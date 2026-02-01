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
                checkSuites(first: 1) {
                  nodes {
                    workflowRun {
                      workflow {
                        name
                      }
                      event
                      databaseId
                      url
                      updatedAt
                      createdAt
                      status
                      conclusion
                      headBranch: headRefName
                      headCommit {
                        message
                        committedDate
                      }
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

      // Extract workflow run from checkSuites
      const workflowRun = repoData.defaultBranchRef?.target?.checkSuites?.nodes?.[0]?.workflowRun

      const status = {
        description: repoData.description || null,
        openPRCount: repoData.pullRequests?.totalCount || 0,
        topics: repoData.repositoryTopics?.nodes?.map(n => n.topic.name) || [],
      }

      if (workflowRun) {
        status.status = workflowRun.status?.toLowerCase() || 'unknown'
        status.conclusion = workflowRun.conclusion?.toLowerCase() || null
        status.workflow = workflowRun.workflow?.name || 'Unknown Workflow'
        status.branch = workflowRun.headBranch || 'unknown'
        status.commitMessage = workflowRun.headCommit?.message?.split('\n')[0] || 'No message'
        status.url = workflowRun.url || `https://github.com/${repo.owner}/${repo.name}/actions`
        status.updatedAt = workflowRun.updatedAt || workflowRun.createdAt
      } else {
        status.status = 'no_runs'
        status.conclusion = null
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
