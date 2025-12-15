import { useState, useEffect } from 'react'
import { MOCK_REPO_STATUSES } from '../data/mockRepoStatuses'

const GITHUB_OWNER = 'h3ow3d'

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
 * Demo mode is enabled by default in demo-capable environments,
 * but can be disabled by the user (stored in localStorage)
 */
const isDemoModeEnabled = () => {
  if (!isDemoCapableEnvironment()) return false
  
  // Check if user has explicitly disabled demo mode
  const demoModeDisabled = localStorage.getItem('demoModeDisabled') === 'true'
  return !demoModeDisabled
}

export function useGitHubStatus(repositories, getActiveToken, authMethod, showAuthSetup, autoRefresh, refreshInterval) {
  const [repoStatuses, setRepoStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeEnabled())

  // Create a stable key from repositories to detect real changes
  const reposKey = JSON.stringify(
    Object.values(repositories)
      .flat()
      .map(r => r.name)
      .sort()
  )

  // Function to toggle demo mode
  const toggleDemoMode = () => {
    const newDemoMode = !isDemoMode
    setIsDemoMode(newDemoMode)
    
    // Store preference in localStorage
    if (isDemoCapableEnvironment()) {
      localStorage.setItem('demoModeDisabled', String(!newDemoMode))
    }
    
    // Clear statuses to force re-fetch
    setRepoStatuses({})
    setLoading(true)
  }

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
    // Use demo data for local development and Vercel previews
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
    if (!showAuthSetup && authMethod !== 'none') {
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
    canToggleDemoMode: isDemoCapableEnvironment()
  }
}
