import { useState, useEffect } from 'react'
import { MOCK_REPO_STATUSES } from '../data/mockRepoStatuses'

/**
 * Check if we're in a demo-capable environment
 * (localhost or Vercel preview deployments)
 */
const isDemoCapableEnvironment = () => {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('-git-') || // Vercel preview URLs contain -git-
    hostname.includes('.vercel.app') // All Vercel preview deployments
  )
}

/**
 * Check if demo mode is currently enabled
 * Demo mode is only enabled when explicitly selected as auth method
 */
const isDemoModeEnabled = (authMethod) => {
  // Demo mode only enabled when explicitly selected as authentication method
  return authMethod === 'demo'
}

export function useGitHubStatus(repositories, getActiveToken, authMethod, showAuthSetup, autoRefresh, refreshInterval) {
  const [repoStatuses, setRepoStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeEnabled(authMethod))

  // Create a stable key from repositories to detect real changes
  const reposKey = JSON.stringify(
    Object.values(repositories)
      .flat()
      .map(r => r.name)
      .sort()
  )

  // Function to toggle demo mode (deprecated - demo mode now only accessible via auth page)
  const toggleDemoMode = () => {
    // No-op: Demo mode can only be selected from auth page
    return
  }

  const fetchRepoStatus = async (repo, token) => {
    try {
      const headers = token ? { 'Authorization': `token ${token}` } : {}
      const owner = repo.owner || 'h3ow3d' // Fallback to h3ow3d for backwards compatibility
      
      // Fetch repository info, latest workflow runs, and open PRs in parallel
      const [repoResponse, runsResponse, prsResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo.name}`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo.name}/actions/runs?per_page=1`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo.name}/pulls?state=open&per_page=100`, { headers })
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
        openPRCount: Array.isArray(prsData) ? prsData.length : 0,
        topics: repoData.topics || []
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
      const status = await fetchRepoStatus(repo, token)
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

  // Update demo mode when authMethod changes
  useEffect(() => {
    setIsDemoMode(isDemoModeEnabled(authMethod))
  }, [authMethod])

  useEffect(() => {
    // Use demo data when in demo mode (selected as auth or environment-based)
    if (isDemoMode) {
      setRepoStatuses(MOCK_REPO_STATUSES)
      setLastUpdate(new Date())
      setLoading(false)
      
      // Cycle the animation demo card through different statuses to showcase pulse effect
      const statusCycle = [
        { status: 'completed', conclusion: 'success' },
        { status: 'completed', conclusion: 'failure' },
        { status: 'in_progress', conclusion: null },
        { status: 'completed', conclusion: 'cancelled' }
      ]
      let cycleIndex = 0
      
      const cycleInterval = setInterval(() => {
        cycleIndex = (cycleIndex + 1) % statusCycle.length
        const nextStatus = statusCycle[cycleIndex]
        
        setRepoStatuses(prev => ({
          ...prev,
          'demo-pulse-animation': {
            ...prev['demo-pulse-animation'],
            ...nextStatus,
            updatedAt: new Date().toISOString()
          }
        }))
      }, 5000) // Change status every 5 seconds
      
      return () => clearInterval(cycleInterval)
    }
    
    // Normal production flow
    if (!showAuthSetup && authMethod !== 'none' && authMethod !== 'demo') {
      fetchAllStatuses()
      
      if (autoRefresh) {
        const interval = setInterval(fetchAllStatuses, refreshInterval * 1000)
        return () => clearInterval(interval)
      }
    }
  }, [showAuthSetup, authMethod, autoRefresh, refreshInterval, reposKey, isDemoMode])

  return {
    repoStatuses,
    loading,
    lastUpdate,
    fetchAllStatuses,
    isDemoMode,
    toggleDemoMode,
    // Demo mode can only be selected from the auth page, not toggled from dashboard
    canToggleDemoMode: false
  }
}
