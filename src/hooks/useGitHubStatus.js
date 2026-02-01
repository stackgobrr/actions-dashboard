import { useState, useEffect, useCallback } from 'react'
import { MOCK_REPO_STATUSES, MOCK_WORKFLOW_RUNS } from '../data/mockRepoStatuses'
import { getGitHubAppCredentials } from '../services/githubAppAuth'
import { fetchMultipleRepoStatuses as fetchRealRepoStatuses } from '../services/githubGraphQL'
import { fetchMultipleRepoStatuses as fetchMockRepoStatuses } from '../services/mockGraphQL'
import { repoDataService } from '../services/RepoDataService'

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

  const fetchAllStatuses = useCallback(async () => {
    setLoading(true)
    
    // Choose the appropriate fetch function based on demo mode
    const fetchFunction = isDemoMode ? fetchMockRepoStatuses : fetchRealRepoStatuses
    const token = isDemoMode ? null : await getActiveToken()
    
    const allRepos = [
      ...repositories.common.map(r => ({ ...r, category: 'common' })),
      ...repositories.modules.map(r => ({ ...r, category: 'modules' })),
      ...repositories.infra.map(r => ({ ...r, category: 'infra' })),
      ...repositories.services.map(r => ({ ...r, category: 'services' })),
      ...repositories.utils.map(r => ({ ...r, category: 'utils' })),
      ...repositories.custom.map(r => ({ ...r, category: 'custom' })),
      ...repositories.demo.map(r => ({ ...r, category: 'demo' })),
    ]

    // Use GraphQL batch fetching - fetches all repos in 1-2 API calls for metadata
    const results = await fetchFunction(allRepos, token)
    
    // In demo mode, preload all mock runs
    if (isDemoMode) {
      allRepos.forEach(repo => {
        const mockRuns = MOCK_WORKFLOW_RUNS[repo.name] || []
        if (mockRuns.length > 0) {
          repoDataService.setRuns(repo.name, mockRuns)
        }
      })
    }
    // In real mode, runs are fetched lazily when cards are expanded (see RepoCard component)
    
    // Only update repos whose data actually changed
    setRepoStatuses(prevStatuses => {
      const statuses = { ...prevStatuses }
      let hasChanges = false
      
      results.forEach(({ name, status }) => {
        const repo = allRepos.find(r => r.name === name)
        
        // Get status from unified service (uses runs if available, otherwise lightweight status)
        const serviceData = repoDataService.getRepoData(name)
        
        const newStatus = {
          ...status,
          ...serviceData, // Override with service data (now has full runs!)
          category: repo?.category || 'custom',
          labels: repo?.labels || [],
        }
        
        // Check if this repo's data actually changed
        const prevStatus = prevStatuses[name]
        const hasChanged = !prevStatus || 
          prevStatus.updatedAt !== newStatus.updatedAt ||
          prevStatus.status !== newStatus.status ||
          prevStatus.conclusion !== newStatus.conclusion
        
        if (hasChanged) {
          statuses[name] = newStatus
          hasChanges = true
        }
      })
      
      return hasChanges ? statuses : prevStatuses
    })
    
    setLastUpdate(new Date())
    setLoading(false)
  }, [isDemoMode, repositories, getActiveToken])

  // Update demo mode when authMethod changes
  useEffect(() => {
    setIsDemoMode(isDemoModeEnabled(authMethod))
  }, [authMethod])

  // Calculate dynamic refresh interval based on repo statuses
  const getDynamicRefreshInterval = () => {
    // Check if any repos have in_progress runs
    const hasInProgressRuns = Object.values(repoStatuses).some(
      status => status.status === 'in_progress' || status.status === 'queued'
    )
    
    // If there are in-progress runs, poll more frequently (use half the normal interval, min 1 second)
    if (hasInProgressRuns) {
      return Math.max(1, Math.floor(refreshInterval / 2))
    }
    
    return refreshInterval
  }

  useEffect(() => {
    if (!showAuthSetup && authMethod !== 'none') {
      fetchAllStatuses()
      
      if (autoRefresh) {
        const dynamicInterval = getDynamicRefreshInterval()
        const interval = setInterval(fetchAllStatuses, dynamicInterval * 1000)
        return () => clearInterval(interval)
      }
    }
  }, [showAuthSetup, authMethod, autoRefresh, refreshInterval, reposKey, isDemoMode, fetchAllStatuses])

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
