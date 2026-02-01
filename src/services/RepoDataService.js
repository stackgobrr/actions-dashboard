/**
 * Unified Repository Data Service
 * 
 * Single source of truth for repository data management.
 * Eliminates duplication between repo status and workflow runs.
 * 
 * Key principles:
 * - Runs are the source of truth
 * - Status is derived from runs (not stored separately)
 * - Consistent interface for both mock and real data
 * - Separation between static repo metadata and dynamic run data
 */

export class RepoDataService {
  constructor() {
    // Static repository metadata (doesn't change frequently)
    this.repoMetadata = new Map()
    
    // Dynamic workflow runs (updated frequently)
    this.runsStorage = new Map()
    
    // Lightweight status from GraphQL (for repos not yet expanded)
    this.lightweightStatus = new Map()
    
    // Tracking for update notifications
    this.lastUpdateTime = new Map()
    this.updateSequence = new Map()
    this.sequenceCounter = 0
    
    // Data freshness tracking - when was this data last fetched from GitHub?
    this.lastFetchTime = new Map() // When did we last fetch this repo's data?
    this.dataSource = new Map() // Which API was used: 'graphql', 'rest_api', or 'none'
  }

  /**
   * Set static repository metadata
   */
  setRepoMetadata(repoName, metadata) {
    this.repoMetadata.set(repoName, {
      category: metadata.category || 'custom',
      description: metadata.description || '',
      url: metadata.url || null,
      openPRCount: metadata.openPRCount || 0,
      topics: metadata.topics || []
    })
  }

  /**
   * Set lightweight status from GraphQL (when we don't have full runs yet)
   */
  setLightweightStatus(repoName, status) {
    this.lightweightStatus.set(repoName, {
      status: status.status,
      conclusion: status.conclusion,
      workflow: status.workflow,
      branch: status.branch,
      commitMessage: status.commitMessage,
      url: status.url,
      updatedAt: status.updatedAt,
      runId: status.runId
    })
    this.lastUpdateTime.set(repoName, new Date().toISOString())
    this.updateSequence.set(repoName, ++this.sequenceCounter)    
    // Track when this data was fetched (only if we don't already have REST API data)
    if (!this.runsStorage.has(repoName) || this.runsStorage.get(repoName).length === 0) {
      this.lastFetchTime.set(repoName, Date.now())
      this.dataSource.set(repoName, 'graphql')
    }  }

  /**
   * Add or update workflow runs for a repository
   */
  setRuns(repoName, runs) {
    if (!Array.isArray(runs) || runs.length === 0) {
      this.runsStorage.set(repoName, [])
      return
    }

    // Ensure runs are sorted by creation time (newest first)
    const sortedRuns = [...runs].sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return dateB - dateA
    })

    this.runsStorage.set(repoName, sortedRuns)
    this.lastUpdateTime.set(repoName, new Date().toISOString())
    this.updateSequence.set(repoName, ++this.sequenceCounter)
    
    // Track when this data was fetched
    this.lastFetchTime.set(repoName, Date.now())
    this.dataSource.set(repoName, 'rest_api')
  }

  /**
   * Add a single new run to the beginning of the runs list
   */
  addRun(repoName, run) {
    const existingRuns = this.runsStorage.get(repoName) || []
    const newRuns = [run, ...existingRuns].slice(0, 50) // Keep max 50 runs
    this.setRuns(repoName, newRuns)
  }

  /**
   * Update a specific run in place (for status transitions)
   */
  updateRun(repoName, runId, updates) {
    const runs = this.runsStorage.get(repoName) || []
    const runIndex = runs.findIndex(r => r.id === runId)
    
    if (runIndex !== -1) {
      runs[runIndex] = { ...runs[runIndex], ...updates }
      this.lastUpdateTime.set(repoName, new Date().toISOString())
      this.updateSequence.set(repoName, ++this.sequenceCounter)
    }
  }

  /**
   * Get all runs for a repository
   */
  getRuns(repoName) {
    return this.runsStorage.get(repoName) || []
  }

  /**
   * Get the latest run for a repository
   */
  getLatestRun(repoName) {
    const runs = this.getRuns(repoName)
    return runs.length > 0 ? runs[0] : null
  }

  /**
   * Derive status from the latest run
   * This is the SINGLE source of truth for repo status
   * 
   * Priority order (most trusted first):
   * 1. Full runs from REST API (most accurate, detailed)
   * 2. Lightweight status from GraphQL (fast but less detail)
   * 3. No data available
   */
  deriveStatus(repoName) {
    const runs = this.getRuns(repoName)
    const latestRun = runs.length > 0 ? runs[0] : null
    const lightStatus = this.lightweightStatus.get(repoName)

    // ALWAYS prefer full runs when available - they're the most accurate source
    // Full runs come from REST API with complete details
    if (latestRun) {
      return {
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        workflow: latestRun.name,
        branch: latestRun.head_branch,
        commitMessage: latestRun.head_commit?.message?.split('\n')[0] || 'No message',
        url: latestRun.html_url,
        updatedAt: latestRun.created_at,
        runId: latestRun.id,
        dataSource: 'rest_api' // Indicator of data source
      }
    }

    // Fall back to lightweight status from GraphQL if no full runs
    if (lightStatus) {
      return {
        ...lightStatus,
        dataSource: 'graphql' // Indicator of data source
      }
    }
    
    // No data available
    return {
      status: 'no_runs',
      conclusion: null,
      workflow: 'N/A',
      branch: 'N/A',
      commitMessage: 'N/A',
      url: null,
      updatedAt: null,
      runId: null,
      dataSource: 'none'
    }
  }

  /**
   * Check if data for a repo is stale
   * @param {string} repoName 
   * @param {number} staleThresholdMs - Milliseconds after which data is considered stale
   * @returns {boolean}
   */
  isDataStale(repoName, staleThresholdMs = 60000) { // Default 60 seconds
    const lastFetch = this.lastFetchTime.get(repoName)
    if (!lastFetch) return true // No fetch time = stale
    return (Date.now() - lastFetch) > staleThresholdMs
  }

  /**
   * Get data age in seconds
   */
  getDataAge(repoName) {
    const lastFetch = this.lastFetchTime.get(repoName)
    if (!lastFetch) return null
    return Math.floor((Date.now() - lastFetch) / 1000)
  }

  /**
   * Get complete repository data (metadata + derived status)
   * This is what should be passed to components
   */
  getRepoData(repoName) {
    const metadata = this.repoMetadata.get(repoName) || {}
    const status = this.deriveStatus(repoName)
    const dataAge = this.getDataAge(repoName)
    const dataSource = this.dataSource.get(repoName) || 'none'

    return {
      ...metadata,
      ...status,
      updateSequence: this.updateSequence.get(repoName) || 0,
      // Data freshness information
      dataAge, // Age in seconds
      dataSource, // 'rest_api', 'graphql', or 'none'
      isStale: this.isDataStale(repoName, 60000) // Stale after 60 seconds
    }
  }

  /**
   * Get all repository names
   */
  getAllRepoNames() {
    return Array.from(this.repoMetadata.keys())
  }

  /**
   * Remove data for a specific repository
   */
  removeRepo(repoName) {
    this.runsStorage.delete(repoName)
    this.repoMetadata.delete(repoName)
    this.lightweightStatus.delete(repoName)
    this.lastUpdateTime.delete(repoName)
    this.updateSequence.delete(repoName)
    this.lastFetchTime.delete(repoName)
    this.dataSource.delete(repoName)
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.runsStorage.clear()
    this.repoMetadata.clear()
    this.lightweightStatus.clear()
    this.lastUpdateTime.clear()
    this.updateSequence.clear()
    this.lastFetchTime.clear()
    this.dataSource.clear()
    this.sequenceCounter = 0
  }
}

/**
 * Create singleton instance for the app
 */
export const repoDataService = new RepoDataService()
