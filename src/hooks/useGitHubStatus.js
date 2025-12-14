import { useState, useEffect } from 'react'

const GITHUB_OWNER = 'h3ow3d'

export function useGitHubStatus(repositories, getActiveToken, authMethod, showAuthSetup, autoRefresh, refreshInterval) {
  const [repoStatuses, setRepoStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Create a stable key from repositories to detect real changes
  const reposKey = JSON.stringify(
    Object.values(repositories)
      .flat()
      .map(r => r.name)
      .sort()
  )

  const fetchRepoStatus = async (repoName, token) => {
    try {
      const headers = token ? { 'Authorization': `token ${token}` } : {}
      
      // Fetch repository info, latest workflow runs, and open PRs in parallel
      const [repoResponse, runsResponse, prsResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}`, { headers }),
        fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/actions/runs?per_page=1`, { headers }),
        fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/pulls?state=open&per_page=100`, { headers })
      ])
      
      if (!repoResponse.ok || !runsResponse.ok || !prsResponse.ok) {
        if (repoResponse.status === 401 || runsResponse.status === 401 || prsResponse.status === 401) {
          return { error: 'Authentication required' }
        }
        return { error: `HTTP ${repoResponse.status || runsResponse.status || prsResponse.status}` }
      }

      const repoData = await repoResponse.json()
      const runsData = await runsResponse.json()
      const prsData = await prsResponse.json()
      
      const result = {
        description: repoData.description || null,
        openPRCount: Array.isArray(prsData) ? prsData.length : 0
      }
      
      if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
        const run = runsData.workflow_runs[0]
        return {
          ...result,
          status: run.status,
          conclusion: run.conclusion,
          workflow: run.name,
          branch: run.head_branch,
          commitMessage: run.head_commit?.message?.split('\n')[0] || 'No message',
          url: run.html_url,
          updatedAt: run.updated_at,
        }
      }
      
      return { ...result, status: 'no_runs', conclusion: null }
    } catch (error) {
      return { error: error.message }
    }
  }

  const fetchAllStatuses = async () => {
    setLoading(true)
    const token = await getActiveToken()
    
    const allRepos = [
      ...repositories.common.map(r => ({ ...r, category: 'common' })),
      ...repositories.modules.map(r => ({ ...r, category: 'modules' })),
      ...repositories.infra.map(r => ({ ...r, category: 'infra' })),
      ...repositories.services.map(r => ({ ...r, category: 'services' })),
      ...repositories.utils.map(r => ({ ...r, category: 'utils' })),
      ...repositories.custom.map(r => ({ ...r, category: 'custom' })),
    ]

    // Fetch all repos in parallel for much faster loading
    const statusPromises = allRepos.map(async (repo) => {
      const status = await fetchRepoStatus(repo.name, token)
      return { 
        name: repo.name, 
        status: { 
          ...status, 
          category: repo.category,
          labels: repo.labels || []
        } 
      }
    })

    const results = await Promise.all(statusPromises)
    
    const statuses = {}
    results.forEach(({ name, status }) => {
      statuses[name] = status
    })

    setRepoStatuses(statuses)
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (!showAuthSetup && authMethod !== 'none') {
      fetchAllStatuses()
      
      if (autoRefresh) {
        const interval = setInterval(fetchAllStatuses, refreshInterval * 1000)
        return () => clearInterval(interval)
      }
    }
  }, [showAuthSetup, authMethod, autoRefresh, refreshInterval, reposKey])

  return {
    repoStatuses,
    loading,
    lastUpdate,
    fetchAllStatuses
  }
}
