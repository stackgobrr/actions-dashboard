import { KeyIcon, LinkExternalIcon } from '@primer/octicons-react'
import { Button, TextInput } from '@primer/react'

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
        <TextInput
          type="password"
          placeholder="ghp_xxxxxxxxxxxx"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
          block
        />
        <Button 
          onClick={onSubmit} 
          disabled={!githubToken}
          variant="primary"
          block
          leadingVisual={KeyIcon}
          sx={{ mt: 3 }}
        >
          Save Token & Continue
        </Button>
        <p className="note f6 color-fg-muted mt-2 mb-0">Token is stored locally in your browser.</p>
      </div>
    </div>
  )
}
