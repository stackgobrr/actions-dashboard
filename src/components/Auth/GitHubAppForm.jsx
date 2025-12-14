import { GearIcon } from '@primer/octicons-react'

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
  onShowGuide
}) {
  return (
    <div className="Box mt-4">
      <div className="Box-header">
        <button 
          onClick={onBack} 
          className="btn btn-sm"
        >
          ← Back
        </button>
      </div>
      <div className="Box-body">
        <h2 className="f4 mb-2">GitHub App Configuration</h2>
        <p className="f6 color-fg-muted mb-3">
          Need help setting up?{' '}
          <button 
            onClick={(e) => { e.preventDefault(); onShowGuide(); }} 
            className="btn-link"
          >
            View setup guide
          </button>
        </p>
        
        <div className="form-group">
          <label htmlFor="app-id" className="form-label">App ID</label>
          <input
            id="app-id"
            type="text"
            placeholder="123456"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="form-control input-block"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="installation-id" className="form-label">Installation ID</label>
          <input
            id="installation-id"
            type="text"
            placeholder="12345678"
            value={installationId}
            onChange={(e) => setInstallationId(e.target.value)}
            className="form-control input-block"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="private-key" className="form-label">Private Key (PEM)</label>
          <textarea
            id="private-key"
            placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            rows={8}
            className="form-control input-block"
          />
        </div>
        
        {appFormError && (
          <div className="flash flash-error">
            {appFormError}
          </div>
        )}
        
        <button 
          onClick={onSubmit} 
          disabled={!appId || !privateKey || !installationId}
          className="btn btn-primary btn-block mt-3"
        >
          <GearIcon size={16} style={{marginRight: '0.5rem'}} />
          Save & Authenticate
        </button>
      </div>
    </div>
  )
}
