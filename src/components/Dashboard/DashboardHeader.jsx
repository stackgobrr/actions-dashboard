import { 
  MarkGithubIcon,
  GearIcon,
  SignOutIcon,
  FilterIcon,
  ClockIcon,
  TagIcon,
  XIcon,
  ChevronDownIcon
} from '@primer/octicons-react'
import { Button, IconButton, Select, Checkbox, Label, ActionMenu, ActionList } from '@primer/react'
import { ThemeToggle } from '../UI/ThemeToggle'
import { RefreshButton } from '../UI/RefreshButton'
import { FullscreenToggle } from '../UI/FullscreenToggle'
import { getTopicColor } from '../../utils/statusHelpers'

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
  refreshInterval,
  setRefreshInterval,
  lastUpdate,
  fetchAllStatuses,
  loading,
  onOpenSettings,
  filterByLabels,
  setFilterByLabels,
  allTopics,
  isDemoMode,
  toggleDemoMode,
  canToggleDemoMode
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }
  
  const toggleLabelFilter = (topicName) => {
    if (filterByLabels.includes(topicName)) {
      setFilterByLabels(filterByLabels.filter(l => l !== topicName))
    } else {
      setFilterByLabels([...filterByLabels, topicName])
    }
  }
  
  const clearLabelFilters = () => {
    setFilterByLabels([])
  }

  return (
    <header className="pb-3 mb-3 border-bottom">
      <div className="d-flex flex-justify-between flex-items-center mb-2">
        <div>
          <h1 className="f3 text-normal mb-1 d-flex flex-items-center" style={{ gap: '8px' }}>
            <MarkGithubIcon size={24} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
            Actions Dashboard
            {canToggleDemoMode && (
              <Label 
                variant={isDemoMode ? "attention" : "success"}
                size="small"
                sx={{ cursor: 'pointer' }}
                onClick={toggleDemoMode}
                title={isDemoMode ? "Click to disable demo mode and use real data" : "Click to enable demo mode"}
              >
                {isDemoMode ? "Demo Mode" : "Live Mode"}
              </Label>
            )}
          </h1>
          <p className="f6 color-fg-muted mb-0">
            {isDemoMode 
              ? "Showing demo data - click badge to connect to real repositories" 
              : "Real-time GitHub Actions status for all repositories"}
          </p>
        </div>
        
        <div className="d-flex flex-items-center" style={{ gap: '4px' }}>
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <IconButton
            icon={GearIcon}
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Repository Configuration"
            size="medium"
          />
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
              />
            </div>
          ) : authMethod === 'pat' ? (
            <IconButton 
              icon={SignOutIcon}
              onClick={clearToken} 
              aria-label="Sign out"
              title="Sign out"
              size="medium"
            />
          ) : null}
        </div>
      </div>
      
      <div className="d-flex flex-wrap flex-items-center" style={{ gap: '8px' }}>
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button 
              size="small" 
              leadingVisual={FilterIcon} 
              trailingAction={ChevronDownIcon}
              sx={{
                position: 'relative',
                color: 'fg.muted',
                bg: 'transparent',
                borderWidth: 'thin',
                borderColor: 'button.default.borderColor.rest',
                borderRadius: 'medium',
                '&:hover': {
                  bg: 'button.default.bgColor.hover',
                  borderColor: 'button.default.borderColor.hover'
                }
              }}
            >
              {sortBy === 'last-run-desc' ? 'Last Run (Newest)' : 
               sortBy === 'last-run-asc' ? 'Last Run (Oldest)' :
               sortBy === 'pr-count' ? 'PR Count' : 'Status'}
            </Button>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item selected={sortBy === 'last-run-desc'} onSelect={() => setSortBy('last-run-desc')}>
                Last Run (Newest)
              </ActionList.Item>
              <ActionList.Item selected={sortBy === 'last-run-asc'} onSelect={() => setSortBy('last-run-asc')}>
                Last Run (Oldest)
              </ActionList.Item>
              <ActionList.Item selected={sortBy === 'pr-count'} onSelect={() => setSortBy('pr-count')}>
                PR Count
              </ActionList.Item>
              <ActionList.Item selected={sortBy === 'status'} onSelect={() => setSortBy('status')}>
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
                sx={{
                  position: 'relative',
                  color: 'fg.muted',
                  bg: 'transparent',
                  borderWidth: 'thin',
                  borderColor: 'button.default.borderColor.rest',
                  borderRadius: 'medium',
                  '&:hover': {
                    bg: 'button.default.bgColor.hover',
                    borderColor: 'button.default.borderColor.hover'
                  }
                }}
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
        
        <div className="d-flex flex-items-center" style={{ gap: '4px' }}>
          <ClockIcon size={16} className="color-fg-muted" />
          <Checkbox
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span className="f6">Auto-refresh</span>
          {autoRefresh && (
            <Select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              size="small"
            >
              <Select.Option value="5">5s</Select.Option>
              <Select.Option value="10">10s</Select.Option>
              <Select.Option value="30">30s</Select.Option>
              <Select.Option value="60">1m</Select.Option>
              <Select.Option value="300">5m</Select.Option>
            </Select>
          )}
        </div>
        
        <RefreshButton 
          onRefresh={fetchAllStatuses}
          loading={loading}
          disabled={false}
        />
        
        {lastUpdate && (
          <div className="d-flex flex-items-center" style={{ gap: '4px' }}>
            <ClockIcon size={14} className="color-fg-muted" />
            <span className="f6 color-fg-muted">{lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </header>
  )
}
