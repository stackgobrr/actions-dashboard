import { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  GitBranch,
  Key,
  ExternalLink,
  Filter,
  Palette,
  Timer,
  Trash2,
  Github,
  Maximize,
  Minimize,
  LogOut,
  User,
  Settings
} from 'lucide-react'
import './App.css'
import GitHubAppGuide from './components/GitHubAppGuide'
import {
  isGitHubAppConfigured,
  getGitHubAppToken,
  saveGitHubAppCredentials,
  clearGitHubAppAuth,
  validateGitHubAppCredentials,
  getAppInstallationInfo
} from './services/githubAppAuth'

const GITHUB_OWNER = 'h3ow3d'

const REPOSITORIES = {
  common: [
    { name: 'h3ow3d-github-actions', description: 'Shared CI/CD workflows' },
    { name: 'h3ow3d-infra-module-template', description: 'Terraform module template' },
  ],
  modules: [
    { name: 'h3ow3d-infra-cognito', description: 'Cognito authentication module' },
    { name: 'h3ow3d-infra-ecs-cluster', description: 'ECS cluster module' },
    { name: 'h3ow3d-infra-ecs-service', description: 'ECS service module' },
    { name: 'h3ow3d-infra-frontend', description: 'Frontend infrastructure module' },
    { name: 'h3ow3d-infra-monitoring', description: 'Monitoring module' },
    { name: 'h3ow3d-infra-networking', description: 'Networking module' },
  ],
  infra: [
    { name: 'h3ow3d-deployment', description: 'Infrastructure deployment' },
  ],
  services: [
    { name: 'h3ow3d-auth', description: 'Authentication service' },
    { name: 'h3ow3d-frontend', description: 'Frontend application' },
  ],
  utils: [
    { name: 'h3ow3d-actions-dashboard', description: 'GitHub Actions status dashboard' },
  ]
}

function App() {
  const [repoStatuses, setRepoStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [githubToken, setGithubToken] = useState('')
  const [showAuthSetup, setShowAuthSetup] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10) // seconds
  const [sortBy, setSortBy] = useState('last-run-desc') // last-run-desc, last-run-asc, group, status
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [authMethod, setAuthMethod] = useState('none') // 'pat', 'github-app', or 'none'
  const [appInfo, setAppInfo] = useState(null)
  
  // GitHub App setup form state
  const [showGitHubAppForm, setShowGitHubAppForm] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [appId, setAppId] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [installationId, setInstallationId] = useState('')
  const [appFormError, setAppFormError] = useState('')

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isGitHubAppConfigured()) {
        setAuthMethod('github-app')
        try {
          const info = await getAppInstallationInfo()
          setAppInfo(info)
        } catch (err) {
          console.error('Failed to get app info:', err)
        }
        setLoading(false)
      } else if (localStorage.getItem('github_token')) {
        setGithubToken(localStorage.getItem('github_token'))
        setAuthMethod('pat')
        setLoading(false)
      } else {
        setShowAuthSetup(true)
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    if (authMethod === 'github-app') {
      clearGitHubAppAuth()
      setAppInfo(null)
    } else {
      localStorage.removeItem('github_token')
    }
    setGithubToken('')
    setAuthMethod('none')
    setShowAuthSetup(true)
    setRepoStatuses({})
  }

  const getActiveToken = async () => {
    if (authMethod === 'github-app') {
      return await getGitHubAppToken()
    }
    return githubToken
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return
      }

      switch(e.key.toLowerCase()) {
        case 't':
          // Toggle between light and dark themes
          const nextTheme = theme === 'dark' ? 'light' : 'dark'
          setTheme(nextTheme)
          break
        case 'r':
          // Refresh
          if (!loading) {
            fetchAllStatuses()
          }
          break
        case 'f':
          // Toggle fullscreen
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keypress', handleKeyPress)
    return () => document.removeEventListener('keypress', handleKeyPress)
  }, [theme, loading])

  const fetchRepoStatus = async (repoName, token) => {
    try {
      const headers = token ? { 'Authorization': `token ${token}` } : {}
      
      // Fetch latest workflow runs
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/actions/runs?per_page=1`,
        { headers }
      )
      
      if (!response.ok) {
        if (response.status === 401) {
          return { error: 'Authentication required' }
        }
        return { error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      
      if (data.workflow_runs && data.workflow_runs.length > 0) {
        const run = data.workflow_runs[0]
        return {
          status: run.status,
          conclusion: run.conclusion,
          workflow: run.name,
          branch: run.head_branch,
          commitMessage: run.head_commit?.message?.split('\n')[0] || 'No message',
          url: run.html_url,
          updatedAt: run.updated_at,
        }
      }
      
      return { status: 'no_runs', conclusion: null }
    } catch (error) {
      return { error: error.message }
    }
  }

  const fetchAllStatuses = async () => {
    setLoading(true)
    const token = await getActiveToken()
    
    const allRepos = [
      ...REPOSITORIES.common.map(r => ({ ...r, category: 'common' })),
      ...REPOSITORIES.modules.map(r => ({ ...r, category: 'modules' })),
      ...REPOSITORIES.infra.map(r => ({ ...r, category: 'infra' })),
      ...REPOSITORIES.services.map(r => ({ ...r, category: 'services' })),
      ...REPOSITORIES.utils.map(r => ({ ...r, category: 'utils' })),
    ]

    const statuses = {}
    
    for (const repo of allRepos) {
      const status = await fetchRepoStatus(repo.name, token)
      statuses[repo.name] = { ...status, category: repo.category, description: repo.description }
    }

    setRepoStatuses(statuses)
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (!showAuthSetup && authMethod !== 'none') {
      fetchAllStatuses()
      
      if (autoRefresh) {
        const interval = setInterval(fetchAllStatuses, refreshInterval * 1000)
        return () => clearInterval(interval)
      }
    }
  }, [showAuthSetup, authMethod, autoRefresh, refreshInterval])

  useEffect(() => {
    // Set Primer CSS theme attributes correctly
    document.documentElement.setAttribute('data-color-mode', theme)
    if (theme === 'light') {
      document.documentElement.setAttribute('data-light-theme', 'light')
    } else {
      document.documentElement.setAttribute('data-dark-theme', 'dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const saveToken = () => {
    localStorage.setItem('github_token', githubToken)
    setAuthMethod('pat')
    setShowAuthSetup(false)
  }

  const clearToken = () => {
    localStorage.removeItem('github_token')
    setGithubToken('')
    setAuthMethod('none')
    setShowAuthSetup(true)
  }

  const handleGitHubAppSetup = async () => {
    setAppFormError('')
    
    if (!appId || !privateKey || !installationId) {
      setAppFormError('All fields are required')
      return
    }

    try {
      const result = await validateGitHubAppCredentials(appId, privateKey, installationId)
      
      if (!result.valid) {
        setAppFormError(`Validation failed: ${result.error}`)
        return
      }

      saveGitHubAppCredentials(appId, privateKey, installationId)
      setAuthMethod('github-app')
      setShowGitHubAppForm(false)
      setShowAuthSetup(false)
      
      // Get app info
      const info = await getAppInstallationInfo()
      setAppInfo(info)
      
      // Clear form
      setAppId('')
      setPrivateKey('')
      setInstallationId('')
    } catch (err) {
      setAppFormError(`Setup failed: ${err.message}`)
    }
  }

  const getStatusIcon = (status) => {
    if (status.error) return <AlertCircle size={18} className="color-fg-danger" />
    if (status.status === 'completed') {
      if (status.conclusion === 'success') return <CheckCircle size={18} className="color-fg-success" />
      if (status.conclusion === 'failure') return <XCircle size={18} className="color-fg-danger" />
      return <AlertCircle size={18} className="color-fg-attention" />
    }
    if (status.status === 'in_progress') return <Clock size={18} className="color-fg-accent" />
    return <AlertCircle size={18} className="color-fg-muted" />
  }

  const getStatusClass = (status) => {
    if (status.error) return 'error'
    if (status.status === 'completed') {
      if (status.conclusion === 'success') return 'success'
      if (status.conclusion === 'failure') return 'failure'
      return 'warning'
    }
    if (status.status === 'in_progress') return 'in-progress'
    return 'unknown'
  }

  const getLabelColor = (category) => {
    // Map categories to Primer Label colors
    const colorMap = {
      'common': 'accent',      // Purple for common/shared
      'modules': 'success',    // Green for modules
      'infra': 'attention',    // Yellow for infrastructure
      'services': 'done',      // Purple for services
      'utils': 'secondary'     // Gray for utilities
    }
    return colorMap[category] || 'secondary'
  }

  const sortRepos = (repos) => {
    const entries = Object.entries(repos)
    
    switch (sortBy) {
      case 'last-run-desc':
        return entries.sort(([, a], [, b]) => {
          if (!a.updatedAt) return 1
          if (!b.updatedAt) return -1
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        })
      
      case 'last-run-asc':
        return entries.sort(([, a], [, b]) => {
          if (!a.updatedAt) return 1
          if (!b.updatedAt) return -1
          return new Date(a.updatedAt) - new Date(b.updatedAt)
        })
      
      case 'group':
        return entries.sort(([, a], [, b]) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          // Within same group, sort by name
          return a.name || 0
        })
      
      case 'status':
        const statusOrder = {
          'failure': 0,
          'in-progress': 1,
          'warning': 2,
          'success': 3,
          'unknown': 4,
          'error': 5
        }
        return entries.sort(([, a], [, b]) => {
          const statusA = getStatusClass(a)
          const statusB = getStatusClass(b)
          return statusOrder[statusA] - statusOrder[statusB]
        })
      
      default:
        return entries
    }
  }

  // Calculate optimal columns to minimize empty space
  const getOptimalColumns = (itemCount) => {
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

  if (showAuthSetup) {
    return (
      <>
        {showGuide && <GitHubAppGuide onClose={() => setShowGuide(false)} />}
        <div className="p-3" style={{minHeight: '100vh', maxWidth: '480px', margin: '0 auto'}}>
          <div className="pt-6">
            <h1 className="f3 text-normal mb-2">
              <Github size={32} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
              GitHub Authentication
            </h1>
            <p className="color-fg-muted">Choose an authentication method to access workflow statuses.</p>
          
          {!showGitHubAppForm && (
            <>
              <div className="Box mt-4">
                <div className="Box-header">
                  <h2 className="Box-title">
                    <Settings size={20} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
                    GitHub App (Recommended)
                  </h2>
                </div>
                <div className="Box-body">
                  <p className="color-fg-muted f6">More secure, automatic token refresh, fine-grained permissions.</p>
                  <button onClick={() => setShowGitHubAppForm(true)} className="btn btn-primary btn-block mt-3">
                    <Github size={16} style={{marginRight: '0.5rem'}} />
                    Configure GitHub App
                  </button>
                  <p className="note f6 color-fg-muted mt-2 mb-0">
                    Need help?{' '}
                    <button 
                      onClick={(e) => { e.preventDefault(); setShowGuide(true); }} 
                      className="btn-link"
                    >
                      View setup guide
                    </button>
                  </p>
                </div>
              </div>
              
              <div className="d-flex flex-items-center my-4">
                <div className="flex-1 border-bottom"></div>
                <span className="px-3 f6 color-fg-muted">OR</span>
                <div className="flex-1 border-bottom"></div>
              </div>
              
              <div className="Box">
                <div className="Box-header">
                  <h2 className="Box-title">
                    <Key size={20} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
                    Personal Access Token
                  </h2>
                </div>
                <div className="Box-body">
                  <p className="color-fg-muted f6">Simple setup, use a PAT with <code className="p-1">repo</code> scope.</p>
                  <p className="f6 mb-2">
                    <a 
                      href="https://github.com/settings/tokens/new?scopes=repo&description=h3ow3d-dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="Link--primary"
                    >
                      Create a new token
                      <ExternalLink size={14} style={{display: 'inline', marginLeft: '4px', verticalAlign: 'text-bottom'}} />
                    </a>
                  </p>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="form-control input-block"
                  />
                  <button 
                    onClick={saveToken} 
                    disabled={!githubToken}
                    className="btn btn-primary btn-block mt-3"
                  >
                    <Key size={16} style={{marginRight: '0.5rem'}} />
                    Save Token & Continue
                  </button>
                  <p className="note f6 color-fg-muted mt-2 mb-0">Token is stored locally in your browser.</p>
                </div>
              </div>
            </>
          )}
          
          {showGitHubAppForm && (
            <div className="Box mt-4">
              <div className="Box-header">
                <button 
                  onClick={() => setShowGitHubAppForm(false)} 
                  className="btn btn-sm"
                >
                  ← Back
                </button>
              </div>
              <div className="Box-body">
                <h2 className="f4 mb-2">GitHub App Configuration</h2>
                <p className="f6 color-fg-muted mb-3">
                  Need help setting up?{' '}
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowGuide(true); }} 
                    className="btn-link"
                  >
                    View setup guide
                  </button>
                </p>
                
                <div className="form-group">
                  <label htmlFor="app-id" className="form-label">App ID</label>
                  <input
                    id="app-id"
                    type="text"
                    placeholder="123456"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="form-control input-block"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="installation-id" className="form-label">Installation ID</label>
                  <input
                    id="installation-id"
                    type="text"
                    placeholder="12345678"
                    value={installationId}
                    onChange={(e) => setInstallationId(e.target.value)}
                    className="form-control input-block"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="private-key" className="form-label">Private Key (PEM)</label>
                  <textarea
                    id="private-key"
                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    rows={8}
                    className="form-control input-block"
                  />
                </div>
                
                {appFormError && (
                  <div className="flash flash-error">
                    {appFormError}
                  </div>
                )}
                
                <button 
                  onClick={handleGitHubAppSetup} 
                  disabled={!appId || !privateKey || !installationId}
                  className="btn btn-primary btn-block mt-3"
                >
                  <Settings size={16} style={{marginRight: '0.5rem'}} />
                  Save & Authenticate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
    )
  }

  return (
    <div className="p-4" style={{
      height: '100%', 
      maxWidth: isFullscreen ? 'none' : '1600px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {!isFullscreen && (
        <header className="pb-3 mb-3 border-bottom">
          <div className="d-flex flex-justify-between flex-items-start mb-3">
            <div>
              <h1 className="f3 text-normal mb-1">
                <Github size={28} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
                Actions Dashboard
              </h1>
              <p className="f6 color-fg-muted mb-0">Real-time GitHub Actions status for all repositories</p>
            </div>
            
            <div className="d-flex flex-items-center gap-2">
              <button 
                onClick={toggleFullscreen} 
                className="btn btn-sm"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
              {authMethod === 'github-app' && appInfo ? (
                <div className="d-flex flex-items-center gap-2 border rounded-2 px-3 py-1">
                  <Settings size={16} className="color-fg-muted" />
                  <span className="f6">{appInfo.appName} ({appInfo.account})</span>
                  <button 
                    onClick={handleLogout} 
                    className="btn-octicon" 
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : authMethod === 'pat' ? (
                <button onClick={clearToken} className="btn btn-sm btn-danger">
                  <Trash2 size={16} style={{marginRight: '0.25rem'}} />
                  Clear Token
                </button>
              ) : null}
            </div>
          </div>
          
          <div className="d-flex flex-wrap flex-items-center gap-3">
            <div className="d-flex flex-items-center gap-2">
              <Palette size={16} className="color-fg-muted" />
              <label htmlFor="theme-select" className="f6 color-fg-muted">
                Theme:
              </label>
              <select 
                id="theme-select"
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            
            <div className="d-flex flex-items-center gap-2">
              <Filter size={16} className="color-fg-muted" />
              <label htmlFor="sort-select" className="f6 color-fg-muted">
                Sort:
              </label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="last-run-desc">Last Run (Newest)</option>
                <option value="last-run-asc">Last Run (Oldest)</option>
                <option value="group">Category</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <div className="d-flex flex-items-center gap-2">
              <Timer size={16} className="color-fg-muted" />
              <label className="d-flex flex-items-center gap-1 f6">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span>Auto-refresh</span>
              </label>
              {autoRefresh && (
                <select 
                  value={refreshInterval} 
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="form-select form-select-sm"
                >
                  <option value="5">5s</option>
                  <option value="10">10s</option>
                  <option value="30">30s</option>
                  <option value="60">1m</option>
                  <option value="300">5m</option>
                </select>
              )}
            </div>
            
            {lastUpdate && (
              <span className="f6 color-fg-muted d-flex flex-items-center gap-1">
                <Clock size={14} />
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            
            <button 
              onClick={fetchAllStatuses} 
              disabled={loading} 
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} style={{marginRight: '0.25rem'}} />
              Refresh
            </button>
          </div>
        </header>
      )}

      {loading && Object.keys(repoStatuses).length === 0 ? (
        <div className="text-center p-6 color-fg-muted">
          <div className="mb-2">Loading repository statuses...</div>
        </div>
      ) : (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${getOptimalColumns(Object.keys(repoStatuses).length)}, 1fr)`,
            gridAutoRows: '1fr',
            gap: '16px',
            height: '100%',
            alignContent: 'stretch'
          }}>
          {sortRepos(repoStatuses).map(([repoName, status]) => (
              <div key={repoName} className={`Box rounded-2 ${getStatusClass(status)}`}>
                <div className="Box-header">
                  <div className="d-flex flex-items-start flex-justify-between gap-2">
                    <div className="flex-1 min-width-0">
                      <h3 className="Box-title mb-1">{repoName}</h3>
                      <p className="color-fg-muted mb-0 lh-condensed" style={{fontSize: '11px'}}>{status.description}</p>
                    </div>
                    <div className="status-icon">
                      {getStatusIcon(status)}
                    </div>
                  </div>
                </div>
                
                <div className="Box-body">
                  {status.error ? (
                    <p className="f6 color-fg-danger mb-0">{status.error}</p>
                  ) : status.status ? (
                    <div>
                      <div className="metadata-row d-flex flex-justify-between flex-items-center">
                        <span className="color-fg-muted">Workflow</span>
                        <span className="text-bold">{status.workflow || 'N/A'}</span>
                      </div>
                      <div className="metadata-row d-flex flex-justify-between flex-items-center">
                        <span className="color-fg-muted">Branch</span>
                        <span className="d-flex flex-items-center gap-1">
                          <GitBranch size={11} />
                          {status.branch || 'N/A'}
                        </span>
                      </div>
                      <div className="metadata-row d-flex flex-justify-between flex-items-center">
                        <span className="color-fg-muted">Commit</span>
                        <span className="text-mono flex-1 text-right" style={{
                          fontSize: '10px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginLeft: '8px'
                        }}>
                          {status.commitMessage}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="metadata-row d-flex flex-justify-between flex-items-center">
                        <span className="color-fg-muted">Workflow</span>
                        <span>N/A</span>
                      </div>
                      <div className="metadata-row d-flex flex-justify-between flex-items-center">
                        <span className="color-fg-muted">Branch</span>
                        <span className="d-flex flex-items-center gap-1">
                          <GitBranch size={11} />
                          N/A
                        </span>
                      </div>
                      <div className="metadata-row d-flex flex-justify-between flex-items-center">
                        <span className="color-fg-muted">Commit</span>
                        <span>N/A</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="Box-footer d-flex flex-justify-between flex-items-center">
                  <div className="flex-1 min-width-0">
                    {status.url ? (
                      <a href={status.url} target="_blank" rel="noopener noreferrer" className="Link--primary d-inline-flex flex-items-center gap-1" style={{fontSize: '11px'}}>
                        <span>View Run</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="color-fg-muted" style={{fontSize: '11px'}}>No recent runs</span>
                    )}
                  </div>
                  <span className={`Label Label--${getLabelColor(status.category)}`} style={{fontSize: '10px'}}>
                    {status.category}
                  </span>
                </div>
              </div>
          ))}
          </div>
        </div>
      )}
      
      {isFullscreen && (
        <button 
          onClick={toggleFullscreen} 
          className="btn btn-sm position-fixed top-0 right-0 m-3" 
          title="Exit Fullscreen"
          style={{zIndex: 1000}}
        >
          <Minimize size={16} />
        </button>
      )}
    </div>
  )
}

export default App
