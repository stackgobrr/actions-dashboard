import { useState, useEffect } from 'react'
import { Dialog, Spinner, Label, Link } from '@primer/react'
import { 
  XIcon, 
  CheckCircleFillIcon, 
  XCircleFillIcon, 
  ClockIcon,
  SkipIcon,
  StopIcon,
  GitBranchIcon,
  LinkExternalIcon
} from '@primer/octicons-react'
import { trackEvent } from '../../utils/analytics'
import './FocusView.css'

const getRunStatusIcon = (status, conclusion) => {
  if (status === 'completed') {
    switch (conclusion) {
      case 'success':
        return <CheckCircleFillIcon size={16} className="color-fg-success" />
      case 'failure':
        return <XCircleFillIcon size={16} className="color-fg-danger" />
      case 'cancelled':
        return <StopIcon size={16} className="color-fg-muted" />
      case 'skipped':
        return <SkipIcon size={16} className="color-fg-muted" />
      default:
        return <XCircleFillIcon size={16} className="color-fg-danger" />
    }
  }
  return <ClockIcon size={16} className="color-fg-attention" />
}

const getRunStatusText = (status, conclusion) => {
  if (status === 'completed') {
    return conclusion || 'completed'
  }
  return status
}

export function FocusView({ repoName, repoOwner, onClose, getActiveToken }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWorkflowRuns = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const token = getActiveToken()
        const headers = token ? { 'Authorization': `token ${token}` } : {}
        
        const response = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs?per_page=10`,
          { headers }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch workflow runs: ${response.status}`)
        }
        
        const data = await response.json()
        setRuns(data.workflow_runs || [])
        
        trackEvent('Focus View Opened', { 
          repo: `${repoOwner}/${repoName}`,
          runCount: data.workflow_runs?.length || 0
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWorkflowRuns()
  }, [repoName, repoOwner, getActiveToken])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A'
    const diffMs = new Date(endTime) - new Date(startTime)
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const secs = diffSecs % 60
    
    if (diffMins > 0) {
      return `${diffMins}m ${secs}s`
    }
    return `${secs}s`
  }

  return (
    <Dialog
      isOpen={true}
      onDismiss={onClose}
      aria-labelledby="focus-view-title"
      sx={{ width: '90%', maxWidth: '900px', height: '80vh', maxHeight: '800px' }}
    >
      <Dialog.Header id="focus-view-title">
        <div className="focus-view-header">
          <div>
            <h2 className="focus-view-title">{repoName}</h2>
            <p className="focus-view-subtitle">{repoOwner}</p>
          </div>
        </div>
      </Dialog.Header>
      
      <div className="focus-view-content">
        {loading && (
          <div className="focus-view-loading">
            <Spinner size="large" />
            <p>Loading workflow runs...</p>
          </div>
        )}
        
        {error && (
          <div className="focus-view-error">
            <XCircleFillIcon size={24} />
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && runs.length === 0 && (
          <div className="focus-view-empty">
            <ClockIcon size={32} className="color-fg-muted" />
            <p>No workflow runs found</p>
          </div>
        )}
        
        {!loading && !error && runs.length > 0 && (
          <div className="focus-view-runs">
            <h3 className="focus-view-section-title">Recent Workflow Runs</h3>
            <div className="focus-view-runs-list">
              {runs.map((run) => (
                <div key={run.id} className="focus-view-run-item">
                  <div className="focus-view-run-status">
                    {getRunStatusIcon(run.status, run.conclusion)}
                  </div>
                  
                  <div className="focus-view-run-details">
                    <div className="focus-view-run-header">
                      <span className="focus-view-run-workflow">{run.name}</span>
                      <Label variant={run.status === 'completed' ? 'accent' : 'attention'} size="small">
                        {getRunStatusText(run.status, run.conclusion)}
                      </Label>
                    </div>
                    
                    <div className="focus-view-run-info">
                      <span className="focus-view-run-branch">
                        <GitBranchIcon size={12} /> {run.head_branch}
                      </span>
                      <span className="focus-view-run-commit">
                        {run.head_commit?.message?.split('\n')[0] || 'No message'}
                      </span>
                    </div>
                    
                    <div className="focus-view-run-meta">
                      <span>Run #{run.run_number}</span>
                      <span>•</span>
                      <span>{formatDate(run.created_at)}</span>
                      {run.status === 'completed' && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(run.created_at, run.updated_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="focus-view-run-actions">
                    <Link
                      href={run.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                    >
                      <LinkExternalIcon size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
