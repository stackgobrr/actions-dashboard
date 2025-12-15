import { 
  MarkGithubIcon,
  GearIcon,
  SignOutIcon,
  TrashIcon,
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
  setFilterByLabels
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  // Get custom labels from localStorage for the filter dropdown
  const customLabels = JSON.parse(localStorage.getItem('customLabels') || '[]')
  
  const toggleLabelFilter = (labelName) => {
    if (filterByLabels.includes(labelName)) {
      setFilterByLabels(filterByLabels.filter(l => l !== labelName))
    } else {
      setFilterByLabels([...filterByLabels, labelName])
    }
  }
  
  const clearLabelFilters = () => {
    setFilterByLabels([])
  }

  return (
    <header className="pb-3 mb-3 border-bottom">
      <div className="d-flex flex-justify-between flex-items-start mb-3">
        <div>
          <h1 className="f3 text-normal mb-1">
            <MarkGithubIcon size={28} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
            Actions Dashboard
          </h1>
          <p className="f6 color-fg-muted mb-0">Real-time GitHub Actions status for all repositories</p>
        </div>
        
        <div className="d-flex flex-items-center gap-2">
          <IconButton
            icon={GearIcon}
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Repository Configuration"
            size="medium"
            variant="invisible"
          />
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          {authMethod === 'github-app' && appInfo ? (
            <div className="d-flex flex-items-center gap-2 border rounded-2 px-3 py-1">
              <GearIcon size={16} className="color-fg-muted" />
              <span className="f6">{appInfo.appName} ({appInfo.account})</span>
              <IconButton 
                onClick={handleLogout} 
                aria-label="Sign out"
                title="Sign out"
                icon={SignOutIcon}
                size="small"
                variant="invisible"
              />
            </div>
          ) : authMethod === 'pat' ? (
            <Button 
              onClick={clearToken} 
              size="small"
              variant="danger"
              leadingVisual={TrashIcon}
            >
              Clear Token
            </Button>
          ) : null}
        </div>
      </div>
      
      <div className="d-flex flex-wrap flex-items-center gap-3">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        
        <div className="d-flex flex-items-center gap-2">
          <FilterIcon size={16} className="color-fg-muted" />
          <label htmlFor="sort-select" className="f6 color-fg-muted">
            Sort:
          </label>
          <Select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
          >
            <Select.Option value="last-run-desc">Last Run (Newest)</Select.Option>
            <Select.Option value="last-run-asc">Last Run (Oldest)</Select.Option>
            <Select.Option value="group">Category</Select.Option>
            <Select.Option value="status">Status</Select.Option>
          </Select>
        </div>
        
        {customLabels.length > 0 && (
          <div className="d-flex flex-items-center gap-2">
            <TagIcon size={16} className="color-fg-muted" />
            <span className="f6 color-fg-muted">Filter:</span>
            <ActionMenu>
              <ActionMenu.Anchor>
                <Button size="small" trailingAction={ChevronDownIcon}>
                  {filterByLabels.length === 0 
                    ? 'Select labels...' 
                    : `${filterByLabels.length} selected`}
                </Button>
              </ActionMenu.Anchor>
              <ActionMenu.Overlay width="medium">
                <ActionList selectionVariant="multiple">
                  {customLabels.map(label => (
                    <ActionList.Item
                      key={label.name}
                      selected={filterByLabels.includes(label.name)}
                      onSelect={() => toggleLabelFilter(label.name)}
                    >
                      <ActionList.LeadingVisual>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: label.color
                          }}
                        />
                      </ActionList.LeadingVisual>
                      {label.name}
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
          </div>
        )}
        
        <div className="d-flex flex-items-center gap-2">
          <ClockIcon size={16} className="color-fg-muted" />
          <label className="d-flex flex-items-center gap-1 f6">
            <Checkbox
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
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
        
        {lastUpdate && (
          <span className="f6 color-fg-muted d-flex flex-items-center gap-1">
            <ClockIcon size={14} />
            {lastUpdate.toLocaleTimeString()}
          </span>
        )}
        
        <RefreshButton 
          onRefresh={fetchAllStatuses}
          loading={loading}
          disabled={false}
        />
      </div>
    </header>
  )
}
