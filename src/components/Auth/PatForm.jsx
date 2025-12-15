import { KeyIcon, LinkExternalIcon, UnlockIcon } from '@primer/octicons-react'
import { Button, TextInput } from '@primer/react'

export function PatForm({
  githubToken,
  setGithubToken,
  onSubmit
}) {
  return (
    <div>
      <div style={{
        background: 'var(--bgColor-muted)',
        borderBottom: '1px solid var(--borderColor-default)',
        borderRadius: '6px 6px 0 0',
        padding: '16px 24px'
      }}>
        <h2 style={{fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center'}}>
          <KeyIcon size={20} style={{marginRight: '8px'}} />
          Personal Access Token
        </h2>
      </div>
      <div style={{padding: '32px 40px 16px 40px'}}>
        <p className="color-fg-muted f5 mb-3">Simple authentication with your GitHub token, perfect for individual use.</p>
        <p className="f6 mb-3">
          <a 
            href="https://github.com/settings/tokens/new?scopes=repo&description=GitHub-Actions-Dashboard" 
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
          size="large"
        />
        <div style={{marginTop: '16px'}}>
          <Button 
            onClick={onSubmit} 
            disabled={!githubToken}
            variant="primary"
            block
            size="large"
            leadingVisual={UnlockIcon}
          >
            Save Token & Continue
          </Button>
        </div>
        <p className="f6 color-fg-muted mt-3 mb-0 text-center">Token is stored locally in your browser.</p>
      </div>
    </div>
  )
}
