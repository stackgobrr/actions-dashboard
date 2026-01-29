import {
  MarkGithubIcon,
  SignOutIcon,
  FilterIcon,
  ClockIcon,
  TagIcon,
  XIcon,
  ChevronDownIcon,
  BugIcon,
  QuestionIcon,
  HeartIcon,
  RepoIcon,
  GearIcon
} from '@primer/octicons-react'
import { Button, IconButton, Select, Checkbox, Label, ActionMenu, ActionList } from '@primer/react'
import { ThemeToggle } from '../UI/ThemeToggle'
import { RefreshButton } from '../UI/RefreshButton'
import { FullscreenToggle } from '../UI/FullscreenToggle'
import { RateLimitDisplay } from './RateLimitDisplay'
import { getTopicColor } from '../../utils/statusHelpers'
import { trackEvent } from '../../utils/analytics'
import './DashboardHeader.css'

export function DashboardHeader({
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
  lastUpdate,
  fetchAllStatuses,
  loading,
  onOpenSettings,
  filterByLabels,
  setFilterByLabels,
  filterByOwners,
  setFilterByOwners,
  allTopics,
  allOwners,
  isDemoMode,
  toggleDemoMode,
  canToggleDemoMode,
  onToggleHotkeyHelper,
  showRateLimit,
  rateLimit,
  rateLimitLoading,
  rateLimitError
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }
  
  const toggleLabelFilter = (topicName) => {
    if (filterByLabels.includes(topicName)) {
      setFilterByLabels(filterByLabels.filter(l => l !== topicName))
      trackEvent('Filter Changed', { 
        filterType: 'topic',
        action: 'removed',
        value: topicName
      })
    } else {
      setFilterByLabels([...filterByLabels, topicName])
      trackEvent('Filter Changed', { 
        filterType: 'topic',
        action: 'added',
        value: topicName
      })
    }
  }

  const toggleOwnerFilter = (ownerName) => {
    if (filterByOwners.includes(ownerName)) {
      setFilterByOwners(filterByOwners.filter(o => o !== ownerName))
      trackEvent('Filter Changed', { 
        filterType: 'owner',
        action: 'removed',
        value: ownerName
      })
    } else {
      setFilterByOwners([...filterByOwners, ownerName])
      trackEvent('Filter Changed', { 
        filterType: 'owner',
        action: 'added',
        value: ownerName
      })
    }
  }

  const clearLabelFilters = () => {
    setFilterByLabels([])
    trackEvent('Filter Cleared', { filterType: 'topics' })
  }

  const clearOwnerFilters = () => {
    setFilterByOwners([])
    trackEvent('Filter Cleared', { filterType: 'owners' })
  }

  return (
    <header className="pt-3 pb-3 mb-3 border-bottom">
      <div className="d-flex flex-justify-between flex-items-center mb-2">
        <div>
          <h1 className="f3 text-normal mb-1 d-flex flex-items-center" style={{ gap: '8px' }}>
            <MarkGithubIcon size={24} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
            Actions Dashboard
            {(isDemoMode || canToggleDemoMode) && (
              <Label 
                variant={isDemoMode ? "attention" : "success"}
                size="small"
                sx={{ cursor: canToggleDemoMode ? 'pointer' : 'default' }}
                onClick={canToggleDemoMode ? toggleDemoMode : undefined}
                title={
                  !canToggleDemoMode && isDemoMode 
                    ? "Demo Mode (selected as authentication method)"
                    : isDemoMode 
                      ? "Click to disable demo mode and use real data" 
                      : "Click to enable demo mode"
                }
              >
                {isDemoMode ? "Demo Mode" : "Live Mode"}
              </Label>
            )}
          </h1>
          <div className="d-flex flex-items-center" style={{ gap: '12px' }}>
            <p className="f6 color-fg-muted mb-0">
              {isDemoMode 
                ? canToggleDemoMode
                  ? "Showing demo data - click badge to connect to real repositories"
                  : "Showing demo data - logout to connect to real repositories"
                : "Live GitHub Actions status for all repositories"}
            </p>
            {showRateLimit && (
              <RateLimitDisplay 
                rateLimit={rateLimit}
                loading={rateLimitLoading}
                error={rateLimitError}
              />
            )}
          </div>
        </div>
        
        <div className="dashboard-header-actions">
          <IconButton
            icon={QuestionIcon}
            onClick={onToggleHotkeyHelper}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (H)"
            size="medium"
            className="color-fg-muted"
          />
          <IconButton
            icon={HeartIcon}
            as="a"
            href="https://github.com/sponsors/h3ow3d"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support this project"
            title="Support this project ❤️"
            size="medium"
            className="color-fg-muted"
          />
          <IconButton
            icon={BugIcon}
            as="a"
            href="https://github.com/h3ow3d/h3ow3d-actions-dashboard/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Report an issue"
            title="Report an issue"
            size="medium"
            className="color-fg-muted"
          />
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {authMethod === 'github-app' && appInfo ? (
            <div className="d-flex flex-items-center gap-2 border rounded-2 px-3 py-1">
              <GearIcon size={16} className="color-fg-muted" />
              <span className="f6">{appInfo.appName} ({appInfo.account})</span>
              <IconButton
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                icon={SignOutIcon}
                size="medium"
                className="color-fg-muted"
              />
            </div>
          ) : authMethod === 'pat' || authMethod === 'oauth' ? (
            <IconButton
              icon={SignOutIcon}
              onClick={clearToken}
              aria-label="Sign out"
              title="Sign out"
              size="medium"
              className="color-fg-muted"
            />
          ) : authMethod === 'demo' ? (
            <IconButton
              icon={SignOutIcon}
              onClick={handleLogout}
              aria-label="Sign out of demo mode"
              title="Sign out of demo mode"
              size="medium"
              className="color-fg-muted"
            />
          ) : null}
        </div>
      </div>
      
      <div className="dashboard-filters">
        <Button
          leadingVisual={RepoIcon}
          onClick={onOpenSettings}
          aria-label="Configure Repositories"
          title="Configure Repositories"
          size="small"
        >
          Configure Repositories
        </Button>
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button 
              size="small" 
              leadingVisual={FilterIcon} 
              trailingAction={ChevronDownIcon}
            >
              {sortBy === 'last-run-desc' ? 'Last Run (Newest)' : 
               sortBy === 'last-run-asc' ? 'Last Run (Oldest)' :
               sortBy === 'pr-count' ? 'PR Count' : 'Status'}
            </Button>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item selected={sortBy === 'last-run-desc'} onSelect={() => {
                setSortBy('last-run-desc')
                trackEvent('Sort Changed', { sortBy: 'last-run-desc' })
              }}>
                Last Run (Newest)
              </ActionList.Item>
              <ActionList.Item selected={sortBy === 'last-run-asc'} onSelect={() => {
                setSortBy('last-run-asc')
                trackEvent('Sort Changed', { sortBy: 'last-run-asc' })
              }}>
                Last Run (Oldest)
              </ActionList.Item>
              <ActionList.Item selected={sortBy === 'pr-count'} onSelect={() => {
                setSortBy('pr-count')
                trackEvent('Sort Changed', { sortBy: 'pr-count' })
              }}>
                PR Count
              </ActionList.Item>
              <ActionList.Item selected={sortBy === 'status'} onSelect={() => {
                setSortBy('status')
                trackEvent('Sort Changed', { sortBy: 'status' })
              }}>
                Status
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
        
        {allTopics && allTopics.length > 0 && (
          <ActionMenu>
            <ActionMenu.Anchor>
              <Button 
                size="small" 
                leadingVisual={TagIcon} 
                trailingAction={ChevronDownIcon}
              >
                {filterByLabels.length === 0 
                  ? 'Select topics...' 
                  : `${filterByLabels.length} selected`}
              </Button>
            </ActionMenu.Anchor>
              <ActionMenu.Overlay width="auto">
                <ActionList selectionVariant="multiple">
                  {allTopics.map(topic => (
                    <ActionList.Item
                      key={topic}
                      selected={filterByLabels.includes(topic)}
                      onSelect={() => toggleLabelFilter(topic)}
                    >
                      <Label
                        sx={{
                          backgroundColor: getTopicColor(topic),
                          color: 'white',
                          fontSize: 0
                        }}
                      >
                        {topic}
                      </Label>
                    </ActionList.Item>
                  ))}
                </ActionList>
                {filterByLabels.length > 0 && (
                  <>
                    <ActionList.Divider />
                    <ActionList>
                      <ActionList.Item onSelect={clearLabelFilters}>
                        <ActionList.LeadingVisual>
                          <XIcon />
                        </ActionList.LeadingVisual>
                        Clear all filters
                      </ActionList.Item>
                    </ActionList>
                  </>
                )}
              </ActionMenu.Overlay>
            </ActionMenu>
        )}
        
        {allOwners && allOwners.length > 0 && (
          <ActionMenu>
            <ActionMenu.Anchor>
              <Button 
                size="small" 
                leadingVisual={RepoIcon} 
                trailingAction={ChevronDownIcon}
              >
                {filterByOwners.length === 0 
                  ? 'Select owners...' 
                  : `${filterByOwners.length} selected`}
              </Button>
            </ActionMenu.Anchor>
              <ActionMenu.Overlay width="auto">
                <ActionList selectionVariant="multiple">
                  {allOwners.map(owner => (
                    <ActionList.Item
                      key={owner}
                      selected={filterByOwners.includes(owner)}
                      onSelect={() => toggleOwnerFilter(owner)}
                    >
                      {owner}
                    </ActionList.Item>
                  ))}
                </ActionList>
                {filterByOwners.length > 0 && (
                  <>
                    <ActionList.Divider />
                    <ActionList>
                      <ActionList.Item onSelect={clearOwnerFilters}>
                        <ActionList.LeadingVisual>
                          <XIcon />
                        </ActionList.LeadingVisual>
                        Clear all filters
                      </ActionList.Item>
                    </ActionList>
                  </>
                )}
              </ActionMenu.Overlay>
            </ActionMenu>
        )}
        
        <RefreshButton 
          onRefresh={() => {
            trackEvent('Manual Refresh')
            fetchAllStatuses()
          }}
          loading={loading}
          disabled={false}
        />
        
        <div className="d-flex flex-items-center" style={{ gap: '4px' }}>
          <Checkbox
            checked={autoRefresh}
            onChange={(e) => {
              const newValue = e.target.checked
              setAutoRefresh(newValue)
              trackEvent('Auto-refresh Toggled', { enabled: newValue })
            }}
          />
          <span className="f6">Auto-refresh (10s)</span>
        </div>
        
        {lastUpdate && (
          <div className="d-flex flex-items-center" style={{ gap: '4px' }}>
            <span className="f6 color-fg-muted">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </header>
  )
}
