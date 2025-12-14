import { 
  MarkGithubIcon,
  GearIcon,
  SignOutIcon,
  TrashIcon,
  PaintbrushIcon,
  FilterIcon,
  ClockIcon
} from '@primer/octicons-react'
import { Button, IconButton, Select, Checkbox } from '@primer/react'
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
  loading
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
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
        <div className="d-flex flex-items-center gap-2">
          <PaintbrushIcon size={16} className="color-fg-muted" />
          <label htmlFor="theme-select" className="f6 color-fg-muted">
            Theme:
          </label>
          <Select 
            id="theme-select"
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            size="small"
          >
            <Select.Option value="dark">Dark</Select.Option>
            <Select.Option value="light">Light</Select.Option>
          </Select>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        
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
