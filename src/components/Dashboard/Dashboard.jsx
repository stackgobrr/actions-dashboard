import { DashboardHeader } from './DashboardHeader'
import { DashboardGrid } from './DashboardGrid'
import { FullscreenToggle } from '../UI/FullscreenToggle'
import { sortRepositories } from '../../utils/gridHelpers'

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
  refreshInterval,
  setRefreshInterval,
  onOpenSettings,
  filterByLabels,
  setFilterByLabels,
  isDemoMode,
  toggleDemoMode,
  canToggleDemoMode,
  onToggleHotkeyHelper
}) {
  // Collect all unique topics from all repositories
  const allTopics = [...new Set(
    Object.values(repoStatuses)
      .flatMap(status => status.topics || [])
  )].sort()
  
  // Filter repositories by labels (topics) first, then sort
  const filteredRepos = filterByLabels.length > 0
    ? Object.fromEntries(
        Object.entries(repoStatuses).filter(([_, status]) => 
          status.topics && status.topics.some(topic => filterByLabels.includes(topic))
        )
      )
    : repoStatuses
  
  const sortedRepos = sortRepositories(filteredRepos, sortBy)

  return (
    <div 
      className="p-4 height-full d-flex flex-column overflow-hidden"
      style={{
        maxWidth: isFullscreen ? 'none' : '1600px',
        margin: '0 auto'
      }}
    >
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
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          lastUpdate={lastUpdate}
          fetchAllStatuses={fetchAllStatuses}
          loading={loading}
          onOpenSettings={onOpenSettings}
          filterByLabels={filterByLabels}
          setFilterByLabels={setFilterByLabels}
          allTopics={allTopics}
          isDemoMode={isDemoMode}
          toggleDemoMode={toggleDemoMode}
          canToggleDemoMode={canToggleDemoMode}
          onToggleHotkeyHelper={onToggleHotkeyHelper}
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
  )
}
