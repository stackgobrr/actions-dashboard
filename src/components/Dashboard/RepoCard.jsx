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
  GitCommitIcon,
  IssueOpenedIcon,
  ShieldIcon,
  BookIcon,
  CodeIcon,
  GraphIcon,
  GearIcon
} from '@primer/octicons-react'
import { Link, Label, CounterLabel, IconButton, Spinner, UnderlineNav, ActionMenu, ActionList } from '@primer/react'
import { getStatusIcon, getStatusClass, getLabelColor, getTopicColor } from '../../utils/statusHelpers.jsx'
import { trackEvent } from '../../utils/analytics'
import { useState, useEffect, useRef, useMemo } from 'react'
import { MOCK_WORKFLOW_RUNS } from '../../data/mockRepoStatuses'
import './RepoCard.css'

export function RepoCard({ repoName, repoOwner, status, onTogglePin, isPinned, isExpanded, onToggleExpand, getActiveToken, isDemoMode }) {
  const labelColor = getLabelColor(status.category)
  const hasPRs = status.openPRCount > 0
  const topics = status.topics || []
  const [isFlashing, setIsFlashing] = useState(false)
  const prevStatusRef = useRef(null)
  const prevSequenceRef = useRef(null)
  const [runs, setRuns] = useState([])
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [activeTab, setActiveTab] = useState('workflows')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState('all')
  
  // Construct PR URL from repository URL
  const repoUrl = status.url ? status.url.split('/actions/')[0] : null
  const prUrl = repoUrl ? `${repoUrl}/pulls` : null
  
  useEffect(() => {
    const currentStatus = getStatusClass(status)
    const prevStatus = prevStatusRef.current
    const currentSequence = status.updateSequence
    const prevSequence = prevSequenceRef.current
    
    // Trigger flash if status changed OR new event happened (sequence changed)
    if (prevStatus && (prevStatus !== currentStatus || prevSequence !== currentSequence)) {
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 1800) // 3 pulses at 0.6s each
    }
    
    prevStatusRef.current = currentStatus
    prevSequenceRef.current = currentSequence
  }, [status.status, status.conclusion, status.updateSequence])

  // Fetch runs when expanded
  useEffect(() => {
    if (isExpanded && runs.length === 0) {
      const fetchRuns = async () => {
        setLoadingRuns(true)
        try {
          // In demo mode, use mock data
          if (isDemoMode) {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 500))
            // Use just the repo name as the key for mock data
            const mockRuns = MOCK_WORKFLOW_RUNS[repoName] || []
            setRuns(mockRuns)
          } else {
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
          }
        } catch (err) {
          console.error('Failed to fetch runs:', err)
        } finally {
          setLoadingRuns(false)
        }
      }
      fetchRuns()
    }
  }, [isExpanded, repoName, repoOwner, getActiveToken, runs.length, isDemoMode])

  // Poll for updates in demo mode when expanded
  useEffect(() => {
    if (isExpanded && isDemoMode) {
      const updateInterval = setInterval(() => {
        const mockRuns = MOCK_WORKFLOW_RUNS[repoName] || []
        setRuns(mockRuns)
      }, 5000) // Update every 5 seconds
      
      return () => clearInterval(updateInterval)
    }
  }, [isExpanded, isDemoMode, repoName])

  const getRunStatusIcon = (run) => {
    if (run.status === 'completed') {
      if (run.conclusion === 'success') return <CheckCircleFillIcon size={14} className="color-fg-success" />
      if (run.conclusion === 'failure') return <XCircleFillIcon size={14} className="color-fg-danger" />
      if (run.conclusion === 'cancelled' || run.conclusion === 'timed_out') {
        return <NoEntryIcon size={14} className="color-fg-attention" />
      }
    }
    return <ClockIcon size={14} className="color-fg-accent" />
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

  // Extract unique branches from runs
  const availableBranches = useMemo(() => {
    const branches = [...new Set(runs.map(run => run.head_branch).filter(Boolean))].sort()
    return branches
  }, [runs])

  // Extract unique workflows from runs
  const availableWorkflows = useMemo(() => {
    const workflows = [...new Set(runs.map(run => run.name).filter(Boolean))].sort()
    return workflows
  }, [runs])

  // Filter runs by selected branch and workflow
  const filteredRuns = useMemo(() => {
    let filtered = runs
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(run => run.head_branch === selectedBranch)
    }
    if (selectedWorkflow !== 'all') {
      filtered = filtered.filter(run => run.name === selectedWorkflow)
    }
    return filtered
  }, [runs, selectedBranch, selectedWorkflow])

  // Get the latest run from filtered results to display in card
  const displayStatus = useMemo(() => {
    if (isExpanded && filteredRuns.length > 0) {
      const latestRun = filteredRuns[0] // Already sorted by most recent
      return {
        workflow: latestRun.name || status.workflow,
        branch: latestRun.head_branch || status.branch,
        status: latestRun.status,
        conclusion: latestRun.conclusion
      }
    }
    return status
  }, [isExpanded, filteredRuns, status])

  return (
    <div 
      className={`repo-card ${getStatusClass(displayStatus)} ${isFlashing ? 'flashing' : ''} ${isPinned ? 'pinned' : ''} ${isExpanded ? 'expanded' : ''}`}
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
          {isExpanded && repoUrl && (
            <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
              <IconButton
                as="a"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                icon={CodeIcon}
                size="small"
                variant="invisible"
                aria-label="View code"
                sx={{ color: 'fg.muted' }}
              />
              <IconButton
                as="a"
                href={`${repoUrl}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                icon={IssueOpenedIcon}
                size="small"
                variant="invisible"
                aria-label="View issues"
                sx={{ color: 'fg.muted' }}
              />
              <IconButton
                as="a"
                href={`${repoUrl}/wiki`}
                target="_blank"
                rel="noopener noreferrer"
                icon={BookIcon}
                size="small"
                variant="invisible"
                aria-label="View wiki"
                sx={{ color: 'fg.muted' }}
              />
              <IconButton
                as="a"
                href={`${repoUrl}/security`}
                target="_blank"
                rel="noopener noreferrer"
                icon={ShieldIcon}
                size="small"
                variant="invisible"
                aria-label="View security"
                sx={{ color: 'fg.muted' }}
              />
              <IconButton
                as="a"
                href={`${repoUrl}/pulse`}
                target="_blank"
                rel="noopener noreferrer"
                icon={GraphIcon}
                size="small"
                variant="invisible"
                aria-label="View insights"
                sx={{ color: 'fg.muted' }}
              />
              <IconButton
                as="a"
                href={`${repoUrl}/settings`}
                target="_blank"
                rel="noopener noreferrer"
                icon={GearIcon}
                size="small"
                variant="invisible"
                aria-label="View settings"
                sx={{ color: 'fg.muted' }}
              />
            </div>
          )}
          <IconButton
            icon={PinIcon}
            size="small"
            variant="invisible"
            onClick={() => onTogglePin(repoName)}
            aria-label={isPinned ? 'Unpin repository' : 'Pin repository'}
            className={isPinned ? 'pinned' : ''}
            sx={{ color: isPinned ? 'var(--color-accent-fg)' : 'inherit' }}
          />
          <div className="repo-card__status-icon">{getStatusIcon(displayStatus)}</div>
        </div>
      </div>
      
      <div className="repo-card__body" 
        onClick={() => {
          onToggleExpand()
          if (isDemoMode) {
            trackEvent('Demo Interaction', { 
              action: isExpanded ? 'collapsed_repo' : 'expanded_repo',
              label: status.repoName || 'Unknown'
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
              {isExpanded && availableWorkflows.length > 0 ? (
                <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <ActionMenu>
                    <ActionMenu.Button 
                      size="small" 
                      variant="invisible"
                      sx={{ fontSize: '12px', fontWeight: 'normal', padding: '2px 6px' }}
                    >
                      <WorkflowIcon size={11} style={{ marginRight: '4px' }} />
                      {selectedWorkflow === 'all' ? 'All workflows' : selectedWorkflow}
                    </ActionMenu.Button>
                    <ActionMenu.Overlay width="medium">
                      <ActionList>
                        <ActionList.Item
                          selected={selectedWorkflow === 'all'}
                          onSelect={() => setSelectedWorkflow('all')}
                        >
                          All workflows
                        </ActionList.Item>
                        <ActionList.Divider />
                        {availableWorkflows.map(workflow => (
                          <ActionList.Item
                            key={workflow}
                            selected={selectedWorkflow === workflow}
                            onSelect={() => setSelectedWorkflow(workflow)}
                          >
                            <WorkflowIcon size={12} style={{ marginRight: '4px' }} />
                            {workflow}
                          </ActionList.Item>
                        ))}
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                </div>
              ) : (
                <span className="repo-card__value repo-card__value--bold">{displayStatus.workflow || 'N/A'}</span>
              )}
            </div>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Branch</span>
              {isExpanded && availableBranches.length > 0 ? (
                <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <ActionMenu>
                    <ActionMenu.Button 
                      size="small" 
                      variant="invisible"
                      sx={{ fontSize: '12px', fontWeight: 'normal', padding: '2px 6px' }}
                    >
                      <GitBranchIcon size={11} style={{ marginRight: '4px' }} />
                      {selectedBranch === 'all' ? 'All branches' : selectedBranch}
                    </ActionMenu.Button>
                    <ActionMenu.Overlay width="medium">
                      <ActionList>
                        <ActionList.Item
                          selected={selectedBranch === 'all'}
                          onSelect={() => setSelectedBranch('all')}
                        >
                          All branches
                        </ActionList.Item>
                        <ActionList.Divider />
                        {availableBranches.map(branch => (
                          <ActionList.Item
                            key={branch}
                            selected={selectedBranch === branch}
                            onSelect={() => setSelectedBranch(branch)}
                          >
                            <GitBranchIcon size={12} style={{ marginRight: '4px' }} />
                            {branch}
                          </ActionList.Item>
                        ))}
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                </div>
              ) : (
                <span className="repo-card__value">
                  <GitBranchIcon size={11} /> {displayStatus.branch || 'N/A'}
                </span>
              )}
            </div>
            <div className="repo-card__row">
              <span className="repo-card__label-text">Commit</span>
              <span className="repo-card__value repo-card__value--mono">{displayStatus.commitMessage || status.commitMessage}</span>
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
          <div className="repo-card__runs-header">
            <UnderlineNav aria-label="View options" className="repo-card__tabs" sx={{ marginBottom: 2, borderBottomWidth: '1px', display: 'flex', width: '100%' }}>
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
              sx={{ padding: '6px 10px', gap: 2, flex: 1, justifyContent: 'center' }}
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
              sx={{ padding: '6px 10px', gap: 2, flex: 1, justifyContent: 'center' }}
            >
              <GitCommitIcon size={12} style={{ marginRight: '6px', opacity: 0.6 }} />
              Commits
            </UnderlineNav.Item>
          </UnderlineNav>
          </div>

          {loadingRuns ? (
            <div className="repo-card__runs-loading">
              <Spinner size="small" />
            </div>
          ) : filteredRuns.length > 0 ? (
            <div className="repo-card__runs-content">
              {activeTab === 'workflows' && filteredRuns.map(run => (
                <div key={run.id} className="repo-card__run-item">
                  <div className="repo-card__run-status">{getRunStatusIcon(run)}</div>
                  <div className="repo-card__run-info">
                    <span className="repo-card__run-name">{run.name}</span>
                    <span className="repo-card__run-meta">
                      <GitBranchIcon size={10} style={{ marginRight: '2px' }} />
                      {run.head_branch} • #{run.run_number} • {formatDate(run.created_at)}
                    </span>
                  </div>
                  <Link href={run.html_url} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex' }}>
                    <LinkExternalIcon size={14} />
                  </Link>
                </div>
              ))}
              {activeTab === 'commits' && (() => {
                // Create a unique list of commits (deduplicate by SHA)
                const uniqueCommits = [];
                const seenShas = new Set();
                
                filteredRuns.forEach(run => {
                  if (run.head_sha && !seenShas.has(run.head_sha)) {
                    seenShas.add(run.head_sha);
                    uniqueCommits.push({
                      sha: run.head_sha,
                      message: run.head_commit?.message?.split('\n')[0] || 'No message',
                      author: run.head_commit?.author?.name || 'Unknown',
                      timestamp: run.created_at,
                      branch: run.head_branch
                    });
                  }
                });
                
                return uniqueCommits.map(commit => (
                  <div key={commit.sha} className="repo-card__run-item">
                    <div className="repo-card__run-status">
                      <GitCommitIcon size={14} className="color-fg-muted" />
                    </div>
                    <div className="repo-card__run-info">
                      <span className="repo-card__run-name">{commit.message}</span>
                      <span className="repo-card__run-meta">
                        <GitBranchIcon size={10} style={{ marginRight: '2px' }} />
                        {commit.branch} • {commit.author} • {formatDate(commit.timestamp)}
                      </span>
                    </div>
                    <code className="repo-card__commit-sha">{commit.sha.substring(0, 7)}</code>
                    <Link 
                      href={`https://github.com/${repoOwner}/${repoName}/commit/${commit.sha}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      sx={{ display: 'flex', marginLeft: '4px' }}
                    >
                      <LinkExternalIcon size={14} />
                    </Link>
                  </div>
                ));
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
