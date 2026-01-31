import { 
  GitBranchIcon,
  LinkExternalIcon,
  GitPullRequestIcon,
  NoEntryIcon,
  PinIcon,
  CheckCircleFillIcon,
  XCircleFillIcon,
  ClockIcon,
  WorkflowIcon,
  GitCommitIcon
} from '@primer/octicons-react'
import { Link, Label, CounterLabel, IconButton, Spinner, UnderlineNav } from '@primer/react'
import { getStatusIcon, getStatusClass, getLabelColor, getTopicColor } from '../../utils/statusHelpers.jsx'
import { trackEvent } from '../../utils/analytics'
import { useState, useEffect, useRef } from 'react'
import './RepoCard.css'

export function RepoCard({ repoName, repoOwner, status, onTogglePin, isPinned, isExpanded, onToggleExpand, getActiveToken, isDemoMode }) {
  const labelColor = getLabelColor(status.category)
  const hasPRs = status.openPRCount > 0
  const topics = status.topics || []
  const [isFlashing, setIsFlashing] = useState(false)
  const prevStatusRef = useRef(null)
  const [runs, setRuns] = useState([])
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [activeTab, setActiveTab] = useState('workflows')
  
  // Construct PR URL from repository URL
  const repoUrl = status.url ? status.url.split('/actions/')[0] : null
  const prUrl = repoUrl ? `${repoUrl}/pulls` : null
  
  useEffect(() => {
    const currentStatus = getStatusClass(status)
    const prevStatus = prevStatusRef.current
    
    // Trigger flash if status changed (but not on initial mount)
    if (prevStatus && prevStatus !== currentStatus) {
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 1800) // 3 pulses at 0.6s each
    }
    
    prevStatusRef.current = currentStatus
  }, [status.status, status.conclusion])

  useEffect(() => {
    if (isExpanded && runs.length === 0) {
      const fetchRuns = async () => {
        setLoadingRuns(true)
        try {
          const token = getActiveToken()
          const headers = token ? { 'Authorization': `token ${token}` } : {}
          const response = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs?per_page=30`,
            { headers }
          )
          if (response.ok) {
            const data = await response.json()
            setRuns(data.workflow_runs || [])
          }
        } catch (err) {
          console.error('Failed to fetch runs:', err)
        } finally {
          setLoadingRuns(false)
        }
      }
      fetchRuns()
    }
  }, [isExpanded, repoName, repoOwner, getActiveToken, runs.length])

  const getRunStatusIcon = (run) => {
    if (run.status === 'completed') {
      if (run.conclusion === 'success') return <CheckCircleFillIcon size={14} className="color-fg-success" />
      if (run.conclusion === 'failure') return <XCircleFillIcon size={14} className="color-fg-danger" />
    }
    return <ClockIcon size={14} className="color-fg-attention" />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div 
      className={`repo-card ${getStatusClass(status)} ${isFlashing ? 'flashing' : ''} ${isPinned ? 'pinned' : ''} ${isExpanded ? 'expanded' : ''}`}
    >
      {hasPRs && prUrl && (
        <Link
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-card__pr-badge"
          sx={{ textDecoration: 'none', color: 'inherit' }}
          aria-label={`View ${status.openPRCount} open pull request${status.openPRCount > 1 ? 's' : ''}`}
        >
          <CounterLabel>
            <GitPullRequestIcon size={12} />
            {status.openPRCount}
          </CounterLabel>
        </Link>
      )}
      {hasPRs && !prUrl && (
        <div className="repo-card__pr-badge">
          <CounterLabel>
            <GitPullRequestIcon size={12} />
            {status.openPRCount}
          </CounterLabel>
        </div>
      )}
      <div className="repo-card__header">
        <div className="repo-card__title-wrapper">
          <h3 className="repo-card__title">{repoName}</h3>
          {status.description && (
            <p className="repo-card__description">{status.description}</p>
          )}
        </div>
        <div className="repo-card__header-actions">
          <IconButton
            icon={PinIcon}
            size="small"
            variant="invisible"
            onClick={() => onTogglePin(repoName)}
            aria-label={isPinned ? 'Unpin repository' : 'Pin repository'}
            className={isPinned ? 'pinned' : ''}
            sx={{ color: isPinned ? 'var(--color-accent-fg)' : 'inherit' }}
          />
          <div className="repo-card__status-icon">{getStatusIcon(status)}</div>
        </div>
      </div>
      
      <div className="repo-card__body" 
        onClick={() => {
          onToggleExpand()
          if (isDemoMode) {
            trackEvent('Demo Interaction', { 
              action: isExpanded ? 'collapsed_repo' : 'expanded_repo',
              repo: repoName 
            })
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        {status.error ? (
          <p className="repo-card__error">{status.error}</p>
        ) : status.status ? (
          <>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Workflow</span>
              <span className="repo-card__value repo-card__value--bold">{status.workflow || 'N/A'}</span>
            </div>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Branch</span>
              <span className="repo-card__value">
                <GitBranchIcon size={11} /> {status.branch || 'N/A'}
              </span>
            </div>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Commit</span>
              <span className="repo-card__value repo-card__value--mono">{status.commitMessage}</span>
            </div>
          </>
        ) : (
          <>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Workflow</span>
              <span className="repo-card__value">N/A</span>
            </div>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Branch</span>
              <span className="repo-card__value"><GitBranchIcon size={11} /> N/A</span>
            </div>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Commit</span>
              <span className="repo-card__value">N/A</span>
            </div>
          </>
        )}
      </div>
      
      {isExpanded && (
        <div className="repo-card__runs">
          <UnderlineNav aria-label="View options" className="repo-card__tabs" sx={{ marginBottom: 2, borderBottomWidth: '1px' }}>
            <UnderlineNav.Item
              aria-current={activeTab === 'workflows' ? 'page' : undefined}
              onSelect={() => {
                setActiveTab('workflows')
                if (isDemoMode) {
                  trackEvent('Demo Interaction', { 
                    action: 'tab_changed',
                    tab: 'workflows',
                    repo: repoName 
                  })
                }
              }}
              sx={{ padding: '6px 10px', gap: 2 }}
            >
              <WorkflowIcon size={12} style={{ marginRight: '6px', opacity: 0.6 }} />
              Workflows
            </UnderlineNav.Item>
            <UnderlineNav.Item
              aria-current={activeTab === 'commits' ? 'page' : undefined}
              onSelect={() => {
                setActiveTab('commits')
                if (isDemoMode) {
                  trackEvent('Demo Interaction', { 
                    action: 'tab_changed',
                    tab: 'commits',
                    repo: repoName 
                  })
                }
              }}
              sx={{ padding: '6px 10px', gap: 2 }}
            >
              <GitCommitIcon size={12} style={{ marginRight: '6px', opacity: 0.6 }} />
              Commits
            </UnderlineNav.Item>
            <UnderlineNav.Item
              aria-current={activeTab === 'branches' ? 'page' : undefined}
              onSelect={() => {
                setActiveTab('branches')
                if (isDemoMode) {
                  trackEvent('Demo Interaction', { 
                    action: 'tab_changed',
                    tab: 'branches',
                    repo: repoName 
                  })
                }
              }}
              sx={{ padding: '6px 10px', gap: 2 }}
            >
              <GitBranchIcon size={12} style={{ marginRight: '6px', opacity: 0.6 }} />
              Branches
            </UnderlineNav.Item>
          </UnderlineNav>

          {loadingRuns ? (
            <div className="repo-card__runs-loading">
              <Spinner size="small" />
            </div>
          ) : runs.length > 0 ? (
            <div className="repo-card__runs-content">
              {activeTab === 'workflows' && (() => {
                const grouped = runs.reduce((acc, run) => {
                  const workflow = run.name || 'Unknown'
                  if (!acc[workflow]) acc[workflow] = []
                  acc[workflow].push(run)
                  return acc
                }, {})
                return Object.entries(grouped).map(([workflow, workflowRuns]) => (
                  <div key={workflow} className="repo-card__run-group">
                    <div className="repo-card__run-group-title">
                      <WorkflowIcon size={12} />
                      {workflow}
                      <span className="repo-card__run-group-count">{workflowRuns.length}</span>
                    </div>
                    {workflowRuns.slice(0, 3).map(run => (
                      <div key={run.id} className="repo-card__run-item">
                        <div className="repo-card__run-status">{getRunStatusIcon(run)}</div>
                        <div className="repo-card__run-info">
                          <div className="repo-card__run-meta">
                            <span>#{run.run_number}</span>
                            <span>•</span>
                            <span>{formatDate(run.created_at)}</span>
                          </div>
                        </div>
                        <Link href={run.html_url} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex' }}>
                          <LinkExternalIcon size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ))
              })()}
              {activeTab === 'commits' && (() => {
                const grouped = runs.reduce((acc, run) => {
                  const sha = run.head_sha
                  const message = run.head_commit?.message?.split('\\n')[0] || 'No message'
                  if (!acc[sha]) acc[sha] = { message, runs: [] }
                  acc[sha].runs.push(run)
                  return acc
                }, {})
                return Object.entries(grouped).map(([sha, data]) => (
                  <div key={sha} className="repo-card__run-group">
                    <div className="repo-card__run-group-title">
                      <GitCommitIcon size={12} />
                      <span className="repo-card__commit-message">{data.message}</span>
                      <code className="repo-card__commit-sha">{sha.substring(0, 7)}</code>
                      <span className="repo-card__run-group-count">{data.runs.length}</span>
                    </div>
                    {data.runs.map(run => (
                      <div key={run.id} className="repo-card__run-item">
                        <div className="repo-card__run-status">{getRunStatusIcon(run)}</div>
                        <div className="repo-card__run-info">
                          <div className="repo-card__run-name">{run.name}</div>
                          <div className="repo-card__run-meta">
                            <span>#{run.run_number}</span>
                            <span>•</span>
                            <span>{formatDate(run.created_at)}</span>
                          </div>
                        </div>
                        <Link href={run.html_url} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex' }}>
                          <LinkExternalIcon size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ))
              })()}
              {activeTab === 'branches' && (() => {
                const grouped = runs.reduce((acc, run) => {
                  const branch = run.head_branch || 'unknown'
                  if (!acc[branch]) acc[branch] = []
                  acc[branch].push(run)
                  return acc
                }, {})
                return Object.entries(grouped).map(([branch, branchRuns]) => (
                  <div key={branch} className="repo-card__run-group">
                    <div className="repo-card__run-group-title">
                      <GitBranchIcon size={12} />
                      {branch}
                      <span className="repo-card__run-group-count">{branchRuns.length}</span>
                    </div>
                    {branchRuns.slice(0, 3).map(run => (
                      <div key={run.id} className="repo-card__run-item">
                        <div className="repo-card__run-status">{getRunStatusIcon(run)}</div>
                        <div className="repo-card__run-info">
                          <div className="repo-card__run-name">{run.name}</div>
                          <div className="repo-card__run-meta">
                            <span>#{run.run_number}</span>
                            <span>•</span>
                            <span>{formatDate(run.created_at)}</span>
                          </div>
                        </div>
                        <Link href={run.html_url} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex' }}>
                          <LinkExternalIcon size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ))
              })()}
            </div>
          ) : (
            <div className="repo-card__runs-empty">
              No recent runs
            </div>
          )}
        </div>
      )}
      
      <div className="repo-card__footer">
        {status.url ? (
          <Link 
            href={status.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: 0, display: 'inline-flex', alignItems: 'center' }}
            aria-label="View workflow run"
          >
            <LinkExternalIcon size={16} />
          </Link>
        ) : (
          <NoEntryIcon size={16} className="color-fg-muted" aria-label="No recent runs" />
        )}
        <div className="repo-card__labels">
          {topics.length > 0 && (
            topics.map(topic => (
              <Label
                key={topic}
                variant="accent"
                size="small"
              >
                {topic}
              </Label>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
