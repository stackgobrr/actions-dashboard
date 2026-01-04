import { useState, useEffect } from 'react'
import { MOCK_REPO_STATUSES } from '../data/mockRepoStatuses'
import { useSSE } from './useSSE'
import { getGitHubAppCredentials } from '../services/githubAppAuth'

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

/**
 * Custom hook to fetch and manage GitHub Actions workflow statuses
 * @param {Object} repositories - Repository configuration object
 * @param {Function} getActiveToken - Function to retrieve active auth token
 * @param {string} authMethod - Current authentication method ('pat', 'github-app', 'demo', 'none')
 * @param {boolean} showAuthSetup - Whether auth setup is visible
 * @param {boolean} autoRefresh - Whether to auto-refresh statuses
 * @param {number} refreshInterval - Interval in seconds for auto-refresh
 * @returns {Object} Status data and control functions
 */
export function useGitHubStatus(repositories, getActiveToken, authMethod, showAuthSetup, autoRefresh, refreshInterval) {
  const [repoStatuses, setRepoStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeEnabled(authMethod))

  // Get installation ID for SSE connection (only for GitHub App auth)
  const installationId = authMethod === 'github-app'
    ? getGitHubAppCredentials().installationId
    : null

  // Setup SSE connection for real-time updates (only for GitHub App)
  const sseEnabled = authMethod === 'github-app' && !showAuthSetup && !isDemoMode
  const sse = useSSE(installationId, sseEnabled)

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
    // Don't fetch if in demo mode
    if (authMethod === 'demo') {
      return
    }
    
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

  // Subscribe to SSE events for real-time updates
  useEffect(() => {
    if (!sse.isConnected) {
      return
    }

    const unsubscribe = sse.subscribe((event) => {
      // Update status for the repository that received an event
      setRepoStatuses(prev => {
        const repoName = event.repository

        // Find the repository in our list to preserve category/labels
        const allRepos = [
          ...repositories.common,
          ...repositories.modules,
          ...repositories.infra,
          ...repositories.services,
          ...repositories.utils,
          ...repositories.custom,
        ]

        const repo = allRepos.find(r => r.name === repoName)

        if (!repo) {
          // Repository not in our list, ignore the event
          return prev
        }

        // Update the repository status with the event data
        return {
          ...prev,
          [repoName]: {
            ...prev[repoName],
            status: event.status,
            conclusion: event.conclusion,
            workflow: event.workflow,
            branch: event.branch,
            commitMessage: event.commitMessage || event.commitSha?.substring(0, 7) || 'No message',
            url: event.url,
            updatedAt: event.timestamp,
            category: repo.category || prev[repoName]?.category,
            labels: repo.labels || prev[repoName]?.labels || []
          }
        }
      })

      setLastUpdate(new Date())
    })

    return unsubscribe
  }, [sse.isConnected, sse.subscribe, repositories])

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
    canToggleDemoMode: false,
    // SSE connection status
    sseStatus: sse.status,
    sseConnected: sse.isConnected,
    sseError: sse.error
  }
}
