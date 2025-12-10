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
  Minimize
} from 'lucide-react'
import './App.css'

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
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '')
  const [showTokenInput, setShowTokenInput] = useState(!localStorage.getItem('github_token'))
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10) // seconds
  const [sortBy, setSortBy] = useState('last-run-desc') // last-run-desc, last-run-asc, group, status
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [isFullscreen, setIsFullscreen] = useState(false)

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
    const token = githubToken || null
    
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
    if (!showTokenInput) {
      fetchAllStatuses()
      
      if (autoRefresh) {
        const interval = setInterval(fetchAllStatuses, refreshInterval * 1000)
        return () => clearInterval(interval)
      }
    }
  }, [showTokenInput, githubToken, autoRefresh, refreshInterval])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const saveToken = () => {
    localStorage.setItem('github_token', githubToken)
    setShowTokenInput(false)
  }

  const clearToken = () => {
    localStorage.removeItem('github_token')
    setGithubToken('')
    setShowTokenInput(true)
  }

  const getStatusIcon = (status) => {
    if (status.error) return <AlertCircle className="status-icon error" />
    if (status.status === 'completed') {
      if (status.conclusion === 'success') return <CheckCircle className="status-icon success" />
      if (status.conclusion === 'failure') return <XCircle className="status-icon failure" />
      return <AlertCircle className="status-icon warning" />
    }
    if (status.status === 'in_progress') return <Clock className="status-icon in-progress" />
    return <AlertCircle className="status-icon unknown" />
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

  if (showTokenInput) {
    return (
      <div className="app">
        <div className="token-setup">
          <h1><Key size={32} style={{display: 'inline', marginRight: '0.5rem'}} /> GitHub Token Required</h1>
          <p>To fetch workflow statuses, you need a GitHub Personal Access Token with <code>repo</code> scope.</p>
          <p>
            <a href="https://github.com/settings/tokens/new?scopes=repo&description=h3ow3d-dashboard" target="_blank" rel="noopener noreferrer">
              Create a new token <ExternalLink size={14} style={{display: 'inline', marginLeft: '4px'}} />
            </a>
          </p>
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
          />
          <button onClick={saveToken} disabled={!githubToken}>
            Save Token & Continue
          </button>
          <p className="note">Token is stored locally in your browser.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {!isFullscreen && (
        <header className="header">
          <div>
            <h1><Github size={28} style={{display: 'inline', marginRight: '0.5rem'}} />Actions Dashboard</h1>
            <p>Real-time GitHub Actions status for all repositories</p>
          </div>
          <div className="header-actions">
          <div className="theme-controls">
            <Palette size={16} style={{marginRight: '0.5rem'}} />
            <label htmlFor="theme-select" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '0.5rem' }}>
              Theme:
            </label>
            <select 
              id="theme-select"
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              className="theme-select"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="gruvbox">Gruvbox</option>
              <option value="cyberpunk">Cyberpunk</option>
            </select>
          </div>
          <div className="sort-controls">
            <Filter size={16} style={{marginRight: '0.5rem'}} />
            <label htmlFor="sort-select" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '0.5rem' }}>
              Sort by:
            </label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="last-run-desc">Last Run (Newest)</option>
              <option value="last-run-asc">Last Run (Oldest)</option>
              <option value="group">Category</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="auto-refresh-controls">
            <Timer size={16} style={{marginRight: '0.5rem'}} />
            <label className="refresh-toggle">
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
                className="refresh-interval"
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
            <span className="last-update">
              <Clock size={14} style={{display: 'inline', marginRight: '0.25rem'}} />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchAllStatuses} disabled={loading} className="refresh-btn">
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button onClick={clearToken} className="token-btn">
            <Trash2 size={16} />
            Clear Token
          </button>
          <button onClick={toggleFullscreen} className="refresh-btn">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </header>
      )}

      {loading && Object.keys(repoStatuses).length === 0 ? (
        <div className="loading">Loading repository statuses...</div>
      ) : (
        <div className="repo-grid">
          {sortRepos(repoStatuses).map(([repoName, status]) => (
              <div key={repoName} className={`repo-card ${getStatusClass(status)}`}>
                <div className="repo-header">
                  <h3>{repoName}</h3>
                  <p className="repo-description">{status.description}</p>
                </div>
                
                {status.error ? (
                  <div className="status-details">
                    <p className="error-message">{status.error}</p>
                  </div>
                ) : status.status ? (
                  <div className="status-details">
                    <div className="status-row">
                      <span className="label">Workflow:</span>
                      <span>{status.workflow || 'N/A'}</span>
                    </div>
                    <div className="status-row">
                      <span className="label">Branch:</span>
                      <span>
                        <GitBranch size={14} style={{ marginRight: '4px' }} />
                        {status.branch || 'N/A'}
                      </span>
                    </div>
                    <div className="status-row">
                      <span className="label">Commit:</span>
                      <span className="commit-message">{status.commitMessage}</span>
                    </div>
                  </div>
                ) : (
                  <div className="status-details">
                    <div className="status-row">
                      <span className="label">Workflow:</span>
                      <span>N/A</span>
                    </div>
                    <div className="status-row">
                      <span className="label">Branch:</span>
                      <span>
                        <GitBranch size={14} style={{ marginRight: '4px' }} />
                        N/A
                      </span>
                    </div>
                    <div className="status-row">
                      <span className="label">Commit:</span>
                      <span>N/A</span>
                    </div>
                  </div>
                )}

                <div className="card-footer">
                  <div className="card-footer-left">
                    {status.url && (
                      <a href={status.url} target="_blank" rel="noopener noreferrer" className="view-run">
                        View Run <ExternalLink size={12} style={{display: 'inline', marginLeft: '4px'}} />
                      </a>
                    )}
                  </div>
                  <div className="card-footer-right">
                    <span className={`category-badge ${status.category}`}>
                      {status.category}
                    </span>
                    {getStatusIcon(status)}
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}
      
      {isFullscreen && (
        <button onClick={toggleFullscreen} className="fullscreen-exit-btn" title="Exit Fullscreen">
          <Minimize size={20} />
        </button>
      )}
    </div>
  )
}

export default App
