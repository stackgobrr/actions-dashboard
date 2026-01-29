import { DashboardHeader } from './DashboardHeader'
import { DashboardGrid } from './DashboardGrid'
import { FullscreenToggle } from '../UI/FullscreenToggle'
import { sortRepositories } from '../../utils/gridHelpers'
import './Dashboard.css'

/**
 * Main dashboard container component
 */
export function Dashboard({
  repoStatuses,
  loading,
  lastUpdate,
  fetchAllStatuses,
  isFullscreen,
  toggleFullscreen,
  authMethod,
  appInfo,
  handleLogout,
  clearToken,
  theme,
  setTheme,
  sortBy,
  setSortBy,
  autoRefresh,
  setAutoRefresh,
  onOpenSettings,
  filterByLabels,
  setFilterByLabels,
  filterByOwners,
  setFilterByOwners,
  selectedRepos,
  isDemoMode,
  toggleDemoMode,
  canToggleDemoMode,
  onToggleHotkeyHelper,
  showRateLimit,
  rateLimit,
  rateLimitLoading,
  rateLimitError
}) {
  // Collect all unique topics from all repositories
  const allTopics = [...new Set(
    Object.values(repoStatuses)
      .flatMap(status => status.topics || [])
  )].sort()
  
  // Extract all unique owners from repo statuses
  const allOwners = [...new Set(
    Object.entries(repoStatuses)
      .map(([repoName, _]) => {
        // Find the owner from selectedRepos
        const repo = selectedRepos?.find(r => r.name === repoName)
        return repo?.owner
      })
      .filter(Boolean)
  )].sort()
  
  // Filter repositories by labels (topics) and owners, then sort
  let filteredRepos = repoStatuses
  
  // Apply label filter
  if (filterByLabels.length > 0) {
    filteredRepos = Object.fromEntries(
      Object.entries(filteredRepos).filter(([_, status]) => 
        status.topics && status.topics.some(topic => filterByLabels.includes(topic))
      )
    )
  }
  
  // Apply owner filter
  if (filterByOwners.length > 0) {
    filteredRepos = Object.fromEntries(
      Object.entries(filteredRepos).filter(([repoName, _]) => {
        const repo = selectedRepos?.find(r => r.name === repoName)
        return repo && filterByOwners.includes(repo.owner)
      })
    )
  }
  
  const sortedRepos = sortRepositories(filteredRepos, sortBy)

  return (
    <div className="dashboard-wrapper">
      <div className={`dashboard-content ${isFullscreen ? 'fullscreen' : ''}`}>
        {!isFullscreen && (
          <DashboardHeader
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            authMethod={authMethod}
            appInfo={appInfo}
            handleLogout={handleLogout}
            clearToken={clearToken}
            theme={theme}
            setTheme={setTheme}
            sortBy={sortBy}
            setSortBy={setSortBy}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            lastUpdate={lastUpdate}
            fetchAllStatuses={fetchAllStatuses}
            loading={loading}
            onOpenSettings={onOpenSettings}
            filterByLabels={filterByLabels}
            setFilterByLabels={setFilterByLabels}
            filterByOwners={filterByOwners}
            setFilterByOwners={setFilterByOwners}
            allTopics={allTopics}
            allOwners={allOwners}
            isDemoMode={isDemoMode}
            toggleDemoMode={toggleDemoMode}
            canToggleDemoMode={canToggleDemoMode}
            onToggleHotkeyHelper={onToggleHotkeyHelper}
            showRateLimit={showRateLimit}
            rateLimit={rateLimit}
            rateLimitLoading={rateLimitLoading}
            rateLimitError={rateLimitError}
          />
        )}

        {loading && Object.keys(repoStatuses).length === 0 ? (
          <div className="text-center p-6 color-fg-muted">
            <div className="mb-2">Loading repository statuses...</div>
          </div>
        ) : (
          <DashboardGrid repositories={sortedRepos} />
        )}
        
        {isFullscreen && (
          <div className="position-fixed top-0 right-0 m-3" style={{ zIndex: 1000 }}>
            <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          </div>
        )}
      </div>
    </div>
  )
}
