import { useState, useEffect } from 'react'
import { MOCK_REPO_STATUSES } from '../data/mockRepoStatuses'
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

  const fetchAllStatuses = async () => {
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

    // Use GraphQL batch fetching - fetches all repos in 1-2 API calls
    const results = await fetchFunction(allRepos, token)
    
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
          ...serviceData, // Override with service data (fresher if runs were fetched)
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
  }

  // Update demo mode when authMethod changes
  useEffect(() => {
    setIsDemoMode(isDemoModeEnabled(authMethod))
  }, [authMethod])

  useEffect(() => {
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
    // Demo mode can only be selected from the auth page, not toggled from dashboard
    canToggleDemoMode: false
  }
}
