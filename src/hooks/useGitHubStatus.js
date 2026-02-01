import { useState, useEffect, useRef } from 'react'
import { MOCK_REPO_STATUSES } from '../data/mockRepoStatuses'
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
  
  // Track update sequence for sorting - only increment when updatedAt changes
  const updateSequenceRef = useRef(0)
  const lastUpdatedAtRef = useRef({}) // Store last updatedAt for each repo

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
        const repoKey = `${owner}/${repo.name}`
        const currentUpdatedAt = run.updated_at
        
        // Only increment sequence if this is a new/changed workflow run
        let updateSequence
        if (lastUpdatedAtRef.current[repoKey] !== currentUpdatedAt) {
          updateSequence = ++updateSequenceRef.current
          lastUpdatedAtRef.current[repoKey] = currentUpdatedAt
        } else {
          // Keep existing sequence number if nothing changed
          updateSequence = repoStatuses[repo.name]?.updateSequence || updateSequenceRef.current
        }
        
        return {
          ...result,
          status: run.status,
          conclusion: run.conclusion,
          workflow: run.name,
          branch: run.head_branch,
          commitMessage: run.head_commit?.message?.split('\n')[0] || 'No message',
          url: run.html_url,
          updatedAt: currentUpdatedAt,
          updateSequence,
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
      ...repositories.demo.map(r => ({ ...r, category: 'demo' })),
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
      // Get list of selected repo names from the repositories object
      const selectedRepoNames = [
        ...repositories.common.map(r => r.name),
        ...repositories.modules.map(r => r.name),
        ...repositories.infra.map(r => r.name),
        ...repositories.services.map(r => r.name),
        ...repositories.utils.map(r => r.name),
        ...repositories.custom.map(r => r.name),
        ...repositories.demo.map(r => r.name),
      ]
      
      // Filter MOCK_REPO_STATUSES to only include selected repos
      const filteredMockStatuses = Object.keys(MOCK_REPO_STATUSES)
        .filter(repoName => selectedRepoNames.includes(repoName))
        .reduce((acc, repoName) => {
          // Create new object reference to force React to detect changes
          acc[repoName] = { ...MOCK_REPO_STATUSES[repoName] }
          return acc
        }, {})
      
      setRepoStatuses(filteredMockStatuses)
      setLastUpdate(new Date())
      setLoading(false)
      
      // Poll for updates every 5 seconds to pick up new workflow runs
      const updateInterval = setInterval(() => {
        const updatedStatuses = Object.keys(MOCK_REPO_STATUSES)
          .filter(repoName => selectedRepoNames.includes(repoName))
          .reduce((acc, repoName) => {
            // Create new object reference to force React to detect changes
            acc[repoName] = { ...MOCK_REPO_STATUSES[repoName] }
            return acc
          }, {})
        
        setRepoStatuses(updatedStatuses)
        setLastUpdate(new Date())
      }, 5000) // Check for updates every 5 seconds
      
      return () => clearInterval(updateInterval)
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
