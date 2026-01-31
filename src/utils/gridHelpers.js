/**
 * Calculate optimal number of columns to minimize empty space in grid
 * @param {number} itemCount - Number of items to display
 * @param {boolean} isFullscreen - Whether the app is in fullscreen mode
 * @returns {number} Optimal number of columns
 */
export function getOptimalColumns(itemCount, isFullscreen = false) {
  // In normal mode (with header), use more columns to reduce number of rows
  // This makes cards taller so content fits better
  let bestCols = 4
  let minEmpty = itemCount
  
  const maxCols = isFullscreen ? 6 : 5  // Normal mode: up to 5 columns
  const minCols = isFullscreen ? 3 : 4  // Normal mode: minimum 4 columns
  
  for (let cols = minCols; cols <= maxCols; cols++) {
    const rows = Math.ceil(itemCount / cols)
    const empty = (rows * cols) - itemCount
    if (empty < minEmpty) {
      minEmpty = empty
      bestCols = cols
    }
  }
  
  return bestCols
}

/**
 * Sort repository entries by specified criteria
 * @param {Object} repos - Repository status object
 * @param {string} sortBy - Sort method: 'last-run-desc', 'last-run-asc', 'pr-count', 'status'
 * @returns {Array} Sorted array of [name, status] tuples
 */
export function sortRepositories(repos, sortBy) {
  const entries = Object.entries(repos)
  
  switch(sortBy) {
    case 'last-run-desc':
      return entries.sort((a, b) => {
        // Sort purely by update sequence (higher = more recent = position 0)
        const seqA = a[1].updateSequence ?? -Infinity
        const seqB = b[1].updateSequence ?? -Infinity
        return seqB - seqA  // Highest sequence first
      })
    case 'last-run-asc':
      return entries.sort((a, b) => {
        const dateA = a[1].updatedAt ? new Date(a[1].updatedAt) : new Date(0)
        const dateB = b[1].updatedAt ? new Date(b[1].updatedAt) : new Date(0)
        return dateA - dateB
      })
    case 'pr-count':
      return entries.sort((a, b) => {
        const prCountA = a[1].openPRCount || 0
        const prCountB = b[1].openPRCount || 0
        if (prCountB === prCountA) {
          return a[0].localeCompare(b[0])
        }
        return prCountB - prCountA // Descending order (most PRs first)
      })
    case 'status':
      return entries.sort((a, b) => {
        const statusOrder = { 'completed': 1, 'in_progress': 2, 'error': 3, 'no_runs': 4 }
        const statusA = a[1].error ? 'error' : (a[1].status || 'no_runs')
        const statusB = b[1].error ? 'error' : (b[1].status || 'no_runs')
        
        const orderA = statusOrder[statusA] || 5
        const orderB = statusOrder[statusB] || 5
        
        if (orderA === orderB) {
          if (statusA === 'completed' && statusB === 'completed') {
            return (a[1].conclusion === 'success' ? 1 : 0) - (b[1].conclusion === 'success' ? 1 : 0)
          }
          return a[0].localeCompare(b[0])
        }
        return orderA - orderB
      })
    default:
      return entries
  }
}
