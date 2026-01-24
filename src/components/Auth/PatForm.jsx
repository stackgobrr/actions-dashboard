import { KeyIcon, LinkExternalIcon, UnlockIcon } from '@primer/octicons-react'
import { Button, TextInput } from '@primer/react'
import { useState } from 'react'

export function PatForm({
  githubToken,
  setGithubToken,
  onSubmit,
  patError,
  isValidatingPat
}) {
  const [validationError, setValidationError] = useState('')

  // GitHub Personal Access Token format: ghp_, gho_, ghu_, ghs_, ghr_ followed by 36 characters
  const validateToken = (token) => {
    if (!token) return 'Token is required'
    
    const tokenPattern = /^(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}$/
    if (!tokenPattern.test(token)) {
      return 'Invalid token format. GitHub tokens start with ghp_, gho_, ghu_, ghs_, or ghr_ followed by 36 characters'
    }
    
    return ''
  }

  const handleTokenChange = (e) => {
    const newToken = e.target.value
    setGithubToken(newToken)
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('')
    }
  }

  const handleSubmit = () => {
    const error = validateToken(githubToken)
    if (error) {
      setValidationError(error)
      return
    }
    
    setValidationError('')
    onSubmit()
  }
  return (
    <div>
      <div style={{
        background: 'var(--bgColor-muted)',
        borderBottom: '1px solid var(--borderColor-default)',
        borderRadius: '6px 6px 0 0',
        padding: '16px 24px'
      }}>
        <h2 className="f4 text-semibold mb-0" style={{display: 'flex', alignItems: 'center'}}>
          <KeyIcon size={20} style={{marginRight: '8px'}} />
          Personal Access Token
        </h2>
      </div>
      <div style={{padding: '32px 40px 16px 40px'}}>
        <p className="color-fg-muted f5 mb-3">Quick setup with just your GitHub token. Perfect for getting started.</p>
        <TextInput
          type="password"
          placeholder="ghp_xxxxxxxxxxxx"
          value={githubToken}
          onChange={handleTokenChange}
          block
          size="large"
          validationStatus={validationError || patError ? 'error' : undefined}
        />
        {validationError && (
          <p className="f6 color-fg-danger mt-2 mb-0">{validationError}</p>
        )}
        {patError && (
          <p className="f6 color-fg-danger mt-2 mb-0">{patError}</p>
        )}
        <div style={{marginTop: '16px'}}>
          <Button 
            onClick={handleSubmit} 
            disabled={!githubToken || isValidatingPat}
            variant="primary"
            block
            size="large"
            leadingVisual={UnlockIcon}
            loading={isValidatingPat}
          >
            {isValidatingPat ? 'Validating Token...' : 'Save Token & Continue'}
          </Button>
        </div>
        <p className="f6 mt-3 mb-0 text-center">
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
      </div>
    </div>
  )
}
