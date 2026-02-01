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
    
    // Tracking for update notifications
    this.lastUpdateTime = new Map()
    this.updateSequence = new Map()
    this.sequenceCounter = 0
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
   */
  deriveStatus(repoName) {
    const runs = this.getRuns(repoName)
    const latestRun = runs.length > 0 ? runs[0] : null

    if (!latestRun) {
      return {
        status: 'no_runs',
        conclusion: null,
        workflow: 'N/A',
        branch: 'N/A',
        commitMessage: 'N/A',
        url: null,
        updatedAt: null,
        runId: null
      }
    }

    return {
      status: latestRun.status,
      conclusion: latestRun.conclusion,
      workflow: latestRun.name,
      branch: latestRun.head_branch,
      commitMessage: latestRun.head_commit?.message?.split('\n')[0] || 'No message',
      url: latestRun.html_url,
      updatedAt: latestRun.created_at,
      runId: latestRun.id
    }
  }

  /**
   * Get complete repository data (metadata + derived status)
   * This is what should be passed to components
   */
  getRepoData(repoName) {
    const metadata = this.repoMetadata.get(repoName) || {}
    const status = this.deriveStatus(repoName)

    return {
      ...metadata,
      ...status,
      updateSequence: this.updateSequence.get(repoName) || 0
    }
  }

  /**
   * Get all repository names
   */
  getAllRepoNames() {
    return Array.from(this.repoMetadata.keys())
  }

  /**
   * Clear all data for a repository
   */
  clearRepo(repoName) {
    this.runsStorage.delete(repoName)
    this.lastUpdateTime.delete(repoName)
    this.updateSequence.delete(repoName)
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.runsStorage.clear()
    this.repoMetadata.clear()
    this.lastUpdateTime.clear()
    this.updateSequence.clear()
    this.sequenceCounter = 0
  }
}

/**
 * Create singleton instance for the app
 */
export const repoDataService = new RepoDataService()
