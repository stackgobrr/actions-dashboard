import { 
  GitBranchIcon,
  LinkExternalIcon
} from '@primer/octicons-react'
import { Link, Label } from '@primer/react'
import { getStatusIcon, getStatusClass, getLabelColor } from '../../utils/statusHelpers.jsx'
import './RepoCard.css'

export function RepoCard({ repoName, status }) {
  const labelColor = getLabelColor(status.category)

  return (
    <div className={`repo-card ${getStatusClass(status)}`}>
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
        <Label 
          sx={{
            color: labelColor.text,
            backgroundColor: labelColor.bg,
            borderColor: labelColor.border,
            borderWidth: 1,
            borderStyle: 'solid'
          }}
        >
          {status.category}
        </Label>
      </div>
    </div>
  )
}
