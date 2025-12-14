import { 
  GitBranchIcon,
  LinkExternalIcon
} from '@primer/octicons-react'
import { getStatusIcon, getStatusClass, getLabelColor } from '../../utils/statusHelpers.jsx'

export function RepoCard({ repoName, status }) {
  const labelColor = getLabelColor(status.category)
  
  return (
    <div className={`Box rounded-2 ${getStatusClass(status)}`}>
      <div className="Box-header">
        <div className="d-flex flex-items-start flex-justify-between gap-2">
          <div className="flex-1 min-width-0">
            <h3 className="Box-title mb-1">{repoName}</h3>
            <p className="color-fg-muted mb-0 lh-condensed" style={{fontSize: '11px'}}>
              {status.description}
            </p>
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
            <div className="metadata-row workflow-row d-flex flex-justify-between flex-items-center">
              <span className="color-fg-muted">Workflow</span>
              <span className="text-bold">{status.workflow || 'N/A'}</span>
            </div>
            <div className="metadata-row branch-row d-flex flex-justify-between flex-items-center">
              <span className="color-fg-muted">Branch</span>
              <span className="d-flex flex-items-center gap-1">
                <GitBranchIcon size={11} />
                {status.branch || 'N/A'}
              </span>
            </div>
            <div className="metadata-row commit-row d-flex flex-justify-between flex-items-center">
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
            <div className="metadata-row workflow-row d-flex flex-justify-between flex-items-center">
              <span className="color-fg-muted">Workflow</span>
              <span>N/A</span>
            </div>
            <div className="metadata-row branch-row d-flex flex-justify-between flex-items-center">
              <span className="color-fg-muted">Branch</span>
              <span className="d-flex flex-items-center gap-1">
                <GitBranchIcon size={11} />
                N/A
              </span>
            </div>
            <div className="metadata-row commit-row d-flex flex-justify-between flex-items-center">
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
              <LinkExternalIcon size={10} />
            </a>
          ) : (
            <span className="color-fg-muted" style={{fontSize: '11px'}}>No recent runs</span>
          )}
        </div>
        <span 
          className="Label"
          style={{
            color: labelColor.text,
            backgroundColor: labelColor.bg,
            borderColor: labelColor.border
          }}
        >
          {status.category}
        </span>
      </div>
    </div>
  )
}
