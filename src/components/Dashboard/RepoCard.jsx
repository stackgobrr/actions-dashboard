import { 
  GitBranchIcon,
  LinkExternalIcon,
  GitPullRequestIcon,
  NoEntryIcon
} from '@primer/octicons-react'
import { Link, Label, CounterLabel } from '@primer/react'
import { getStatusIcon, getStatusClass, getLabelColor, getTopicColor } from '../../utils/statusHelpers.jsx'
import { useState, useEffect, useRef } from 'react'
import './RepoCard.css'

export function RepoCard({ repoName, status }) {
  const labelColor = getLabelColor(status.category)
  const hasPRs = status.openPRCount > 0
  const topics = status.topics || []
  const [isFlashing, setIsFlashing] = useState(false)
  const prevStatusRef = useRef(null)
  
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

  return (
    <div className={`repo-card ${getStatusClass(status)} ${isFlashing ? 'flashing' : ''}`}>
      {hasPRs && (
        <div className="repo-card__pr-badge">
          <CounterLabel>
            <GitPullRequestIcon size={12} />
            {status.openPRCount}
          </CounterLabel>
        </div>
      )}
      <div className="repo-card__header">
        <div>
          <h3 className="repo-card__title">{repoName}</h3>
          {status.description && (
            <p className="repo-card__description">{status.description}</p>
          )}
        </div>
        <div className="repo-card__status-icon">{getStatusIcon(status)}</div>
      </div>
      
      <div className="repo-card__body">
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
                sx={{
                  backgroundColor: getTopicColor(topic),
                  color: 'white',
                  fontSize: 0,
                  px: 1,
                  py: 0,
                  lineHeight: '18px'
                }}
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
