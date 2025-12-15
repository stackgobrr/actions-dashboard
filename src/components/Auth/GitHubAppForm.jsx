import { GearIcon, LinkExternalIcon, ArrowLeftIcon } from '@primer/octicons-react'
import { Button, TextInput, Textarea, FormControl, IconButton } from '@primer/react'
import { useState } from 'react'

export function GitHubAppForm({
  appId,
  setAppId,
  installationId,
  setInstallationId,
  privateKey,
  setPrivateKey,
  appFormError,
  onSubmit,
  onBack,
  onShowGuide,
  isValidatingGitHubApp
}) {
  const [validationErrors, setValidationErrors] = useState({
    appId: '',
    installationId: '',
    privateKey: ''
  })

  // Validate App ID (should be a positive integer)
  const validateAppId = (id) => {
    if (!id) return 'App ID is required'
    if (!/^\d+$/.test(id)) return 'App ID must be a number'
    if (parseInt(id) <= 0) return 'App ID must be a positive number'
    return ''
  }

  // Validate Installation ID (should be a positive integer)
  const validateInstallationId = (id) => {
    if (!id) return 'Installation ID is required'
    if (!/^\d+$/.test(id)) return 'Installation ID must be a number'
    if (parseInt(id) <= 0) return 'Installation ID must be a positive number'
    return ''
  }

  // Validate Private Key (should be in PEM format)
  const validatePrivateKey = (key) => {
    if (!key) return 'Private Key is required'
    
    const trimmedKey = key.trim()
    if (!trimmedKey.includes('-----BEGIN') || !trimmedKey.includes('-----END')) {
      return 'Private Key must be in PEM format (BEGIN/END markers required)'
    }
    
    // Check for common PEM formats
    const pemPatterns = [
      /-----BEGIN RSA PRIVATE KEY-----/,
      /-----BEGIN PRIVATE KEY-----/,
      /-----BEGIN ENCRYPTED PRIVATE KEY-----/
    ]
    
    if (!pemPatterns.some(pattern => pattern.test(trimmedKey))) {
      return 'Private Key must start with a valid PEM header'
    }
    
    return ''
  }

  const handleAppIdChange = (e) => {
    const value = e.target.value
    setAppId(value)
    if (validationErrors.appId) {
      setValidationErrors({ ...validationErrors, appId: '' })
    }
  }

  const handleInstallationIdChange = (e) => {
    const value = e.target.value
    setInstallationId(value)
    if (validationErrors.installationId) {
      setValidationErrors({ ...validationErrors, installationId: '' })
    }
  }

  const handlePrivateKeyChange = (e) => {
    const value = e.target.value
    setPrivateKey(value)
    if (validationErrors.privateKey) {
      setValidationErrors({ ...validationErrors, privateKey: '' })
    }
  }

  const handleSubmit = () => {
    const errors = {
      appId: validateAppId(appId),
      installationId: validateInstallationId(installationId),
      privateKey: validatePrivateKey(privateKey)
    }

    setValidationErrors(errors)

    // If any validation errors, don't submit
    if (errors.appId || errors.installationId || errors.privateKey) {
      return
    }

    onSubmit()
  }
  return (
    <div style={{
      boxShadow: '0 1px 3px var(--color-shadow-small), 0 8px 24px var(--color-shadow-medium)',
      border: '1px solid var(--borderColor-default)',
      borderRadius: '6px'
    }}>
      <div style={{
        background: 'var(--bgColor-muted)',
        borderBottom: '1px solid var(--borderColor-default)',
        borderRadius: '6px 6px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px'
      }}>
        <IconButton 
          onClick={onBack} 
          size="medium"
          variant="invisible"
          icon={ArrowLeftIcon}
          aria-label="Back"
        />
        <h2 style={{fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center'}}>
          <GearIcon size={20} style={{marginRight: '8px'}} />
          GitHub App Configuration
        </h2>
        <div style={{width: '32px'}}></div> {/* Spacer for alignment */}
      </div>
      <div style={{padding: '32px 40px 16px 40px'}}>
        <p className="f6 mb-4 text-center">
          <button 
            onClick={(e) => { e.preventDefault(); onShowGuide(); }} 
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 0, 
              cursor: 'pointer', 
              font: 'inherit',
              color: 'var(--fgColor-accent)',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            Need help setting up?
            <LinkExternalIcon size={14} style={{display: 'inline', marginLeft: '4px', verticalAlign: 'text-bottom'}} />
          </button>
        </p>
        
        <div style={{marginBottom: '12px'}}>
          <label htmlFor="app-id" className="FormControl-label" style={{display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px'}}>
            App ID
          </label>
          <TextInput
            id="app-id"
            type="text"
            placeholder="123456"
            value={appId}
            onChange={handleAppIdChange}
            block
            size="large"
            validationStatus={validationErrors.appId ? 'error' : undefined}
          />
          {validationErrors.appId && (
            <p className="f6 color-fg-danger mt-2 mb-0">{validationErrors.appId}</p>
          )}
        </div>
        
        <div style={{marginBottom: '12px'}}>
          <label htmlFor="installation-id" className="FormControl-label" style={{display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px'}}>
            Installation ID
          </label>
          <TextInput
            id="installation-id"
            type="text"
            placeholder="12345678"
            value={installationId}
            onChange={handleInstallationIdChange}
            block
            size="large"
            validationStatus={validationErrors.installationId ? 'error' : undefined}
          />
          {validationErrors.installationId && (
            <p className="f6 color-fg-danger mt-2 mb-0">{validationErrors.installationId}</p>
          )}
        </div>
        
        <div style={{marginBottom: '12px'}}>
          <label htmlFor="private-key" className="FormControl-label" style={{display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px'}}>
            Private Key (PEM)
          </label>
          <Textarea
            id="private-key"
            placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
            value={privateKey}
            onChange={handlePrivateKeyChange}
            rows={8}
            block
            validationStatus={validationErrors.privateKey ? 'error' : undefined}
          />
          {validationErrors.privateKey && (
            <p className="f6 color-fg-danger mt-2 mb-0">{validationErrors.privateKey}</p>
          )}
        </div>
        
        {appFormError && (
          <div className="flash flash-error mt-2">
            {appFormError}
          </div>
        )}
        
        <div style={{marginTop: '16px'}}>
          <Button 
            onClick={handleSubmit} 
            disabled={!appId || !privateKey || !installationId || isValidatingGitHubApp}
            variant="primary"
            block
            size="large"
            leadingVisual={GearIcon}
            loading={isValidatingGitHubApp}
          >
            {isValidatingGitHubApp ? 'Validating Credentials...' : 'Save & Authenticate'}
          </Button>
        </div>
        <p className="f6 color-fg-muted mt-3 mb-0 text-center">
          Your credentials are stored locally in your browser.
        </p>
      </div>
    </div>
  )
}
