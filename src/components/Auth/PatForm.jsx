import { KeyIcon, LinkExternalIcon } from '@primer/octicons-react'

export function PatForm({
  githubToken,
  setGithubToken,
  onSubmit
}) {
  return (
    <div className="Box">
      <div className="Box-header">
        <h2 className="Box-title">
          <KeyIcon size={20} style={{display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom'}} />
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
            <LinkExternalIcon size={14} style={{display: 'inline', marginLeft: '4px', verticalAlign: 'text-bottom'}} />
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
          onClick={onSubmit} 
          disabled={!githubToken}
          className="btn btn-primary btn-block mt-3"
        >
          <KeyIcon size={16} style={{marginRight: '0.5rem'}} />
          Save Token & Continue
        </button>
        <p className="note f6 color-fg-muted mt-2 mb-0">Token is stored locally in your browser.</p>
      </div>
    </div>
  )
}
