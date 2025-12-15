import { 
  GitBranchIcon,
  LinkExternalIcon,
  GitPullRequestIcon
} from '@primer/octicons-react'
import { Link, Label, CounterLabel } from '@primer/react'
import { getStatusIcon, getStatusClass, getLabelColor } from '../../utils/statusHelpers.jsx'
import './RepoCard.css'

export function RepoCard({ repoName, status }) {
  const labelColor = getLabelColor(status.category)
  const hasPRs = status.openPRCount > 0
  
  // Get custom labels from localStorage
  const customLabels = JSON.parse(localStorage.getItem('customLabels') || '[]')

  return (
    <div className={`repo-card ${getStatusClass(status)}`}>
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
            sx={{ fontSize: 0 }}
          >
            View Run <LinkExternalIcon size={10} />
          </Link>
        ) : (
          <span className="repo-card__no-runs">No recent runs</span>
        )}
        <div className="repo-card__labels">
          {status.labels && status.labels.length > 0 && (
            status.labels.map(labelName => {
              const labelDef = customLabels.find(l => l.name === labelName)
              return labelDef ? (
                <Label
                  key={labelName}
                  sx={{
                    backgroundColor: labelDef.color,
                    color: 'white',
                    fontSize: 0
                  }}
                >
                  {labelName}
                </Label>
              ) : null
            })
          )}
        </div>
      </div>
    </div>
  )
}
