import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, GitBranch } from 'lucide-react'
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
      ...REPOSITORIES.common,
      ...REPOSITORIES.modules,
      ...REPOSITORIES.infra,
      ...REPOSITORIES.services,
      ...REPOSITORIES.utils,
    ]

    const statuses = {}
    
    for (const repo of allRepos) {
      const status = await fetchRepoStatus(repo.name, token)
      statuses[repo.name] = status
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

  if (showTokenInput) {
    return (
      <div className="app">
        <div className="token-setup">
          <h1>GitHub Token Required</h1>
          <p>To fetch workflow statuses, you need a GitHub Personal Access Token with <code>repo</code> scope.</p>
          <p>
            <a href="https://github.com/settings/tokens/new?scopes=repo&description=h3ow3d-dashboard" target="_blank" rel="noopener noreferrer">
              Create a new token →
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
      <header className="header">
        <div>
          <h1>🚀 h3ow3d Actions Dashboard</h1>
          <p>Real-time GitHub Actions status for all repositories</p>
        </div>
        <div className="header-actions">
          <div className="auto-refresh-controls">
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
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchAllStatuses} disabled={loading} className="refresh-btn">
            <RefreshCw className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button onClick={clearToken} className="token-btn">
            Change Token
          </button>
        </div>
      </header>

      {loading && Object.keys(repoStatuses).length === 0 ? (
        <div className="loading">Loading repository statuses...</div>
      ) : (
        <>
          {Object.entries(REPOSITORIES).map(([category, repos]) => (
            <section key={category} className="category">
              <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
              <div className="repo-grid">
                {repos.map((repo) => {
                  const status = repoStatuses[repo.name] || {}
                  return (
                    <div key={repo.name} className={`repo-card ${getStatusClass(status)}`}>
                      <div className="repo-header">
                        <div>
                          <h3>{repo.name}</h3>
                          <p className="repo-description">{repo.description}</p>
                        </div>
                        {getStatusIcon(status)}
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
                          {status.url && (
                            <a href={status.url} target="_blank" rel="noopener noreferrer" className="view-run">
                              View Run →
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="status-details">
                          <p>No workflow runs found</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  )
}

export default App
