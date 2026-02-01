/**
 * Mock GraphQL service that mimics the real GitHub GraphQL API
 * Returns data in the exact same shape as githubGraphQL.js for demo mode
 */

import { MOCK_WORKFLOW_RUNS, MOCK_REPO_STATUSES } from '../data/mockRepoStatuses'

/**
 * Mock version of fetchMultipleRepoStatuses that returns GraphQL-shaped data
 * @param {Array} repos - Array of {name, owner} objects
 * @param {string} token - Ignored in mock mode
 * @returns {Promise<Array>} Array of {name, owner, status} objects matching real GraphQL shape
 */
export async function fetchMultipleRepoStatuses(repos, token) {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200))

  return repos.map(repo => {
    const mockStatus = MOCK_REPO_STATUSES[repo.name]
    const mockRuns = MOCK_WORKFLOW_RUNS[repo.name] || []

    if (!mockStatus) {
      return {
        name: repo.name,
        owner: repo.owner,
        status: { error: 'Repository not found in demo data' }
      }
    }

    // Get the most recent run to match real GraphQL behavior
    const latestRun = mockRuns[0]

    // Return data in the exact same shape as real GraphQL
    const status = {
      description: mockStatus.description || null,
      openPRCount: mockStatus.openPRCount || 0,
      topics: mockStatus.topics || [],
    }

    if (latestRun) {
      status.status = latestRun.status
      status.conclusion = latestRun.conclusion
      status.workflow = latestRun.name
      status.branch = latestRun.head_branch
      status.commitMessage = latestRun.head_commit.message.split('\n')[0]
      status.url = latestRun.html_url
      status.updatedAt = latestRun.created_at
      status.runId = latestRun.id
      // Add updateSequence for demo change detection
      status.updateSequence = mockStatus.updateSequence
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
}
