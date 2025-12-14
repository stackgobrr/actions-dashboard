import { GearIcon } from '@primer/octicons-react'
import { Button, TextInput, Textarea, FormControl } from '@primer/react'

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
        <Button 
          onClick={onBack} 
          size="small"
        >
          ← Back
        </Button>
      </div>
      <div className="Box-body">
        <h2 className="f4 mb-2">GitHub App Configuration</h2>
        <p className="f6 color-fg-muted mb-3">
          Need help setting up?{' '}
          <Button 
            onClick={(e) => { e.preventDefault(); onShowGuide(); }} 
            variant="invisible"
            sx={{ padding: 0, height: 'auto', fontWeight: 'normal' }}
          >
            View setup guide
          </Button>
        </p>
        
        <FormControl id="app-id">
          <FormControl.Label>App ID</FormControl.Label>
          <TextInput
            type="text"
            placeholder="123456"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            block
          />
        </FormControl>
        
        <FormControl id="installation-id" sx={{ mt: 3 }}>
          <FormControl.Label>Installation ID</FormControl.Label>
          <TextInput
            type="text"
            placeholder="12345678"
            value={installationId}
            onChange={(e) => setInstallationId(e.target.value)}
            block
          />
        </FormControl>
        
        <FormControl id="private-key" sx={{ mt: 3 }}>
          <FormControl.Label>Private Key (PEM)</FormControl.Label>
          <Textarea
            placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            rows={8}
            block
          />
        </FormControl>
        
        {appFormError && (
          <div className="flash flash-error">
            {appFormError}
          </div>
        )}
        
        <Button 
          onClick={onSubmit} 
          disabled={!appId || !privateKey || !installationId}
          variant="primary"
          block
          leadingVisual={GearIcon}
          sx={{ mt: 3 }}
        >
          Save & Authenticate
        </Button>
      </div>
    </div>
  )
}
