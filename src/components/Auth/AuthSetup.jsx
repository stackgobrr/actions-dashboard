import { MarkGithubIcon, GearIcon, LinkExternalIcon, BeakerIcon, SignOutIcon, LightBulbIcon } from '@primer/octicons-react'
import { Button } from '@primer/react'
import GitHubAppGuide from './GitHubAppGuide'
import { GitHubAppForm } from './GitHubAppForm'
import { PatForm } from './PatForm'

export function AuthSetup({
  showGuide,
  setShowGuide,
  showGitHubAppForm,
  setShowGitHubAppForm,
  githubToken,
  setGithubToken,
  saveToken,
  appId,
  setAppId,
  installationId,
  setInstallationId,
  privateKey,
  setPrivateKey,
  appFormError,
  handleGitHubAppSetup,
  handleDemoMode,
  handleLogout,
  authMethod
}) {
  return (
    <>
      {showGuide && <GitHubAppGuide onClose={() => setShowGuide(false)} />}
      <div 
        className="d-flex flex-column flex-items-center" 
        style={{
          minHeight: '100vh',
          maxHeight: '100vh',
          background: 'var(--bgColor-default)',
          padding: '24px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div style={{maxWidth: '480px', width: '100%', paddingTop: '40px', paddingBottom: '40px'}}>
          <div className="text-center mb-5">
            <MarkGithubIcon size={48} style={{marginBottom: '16px'}} />
            <h1 className="h2 mb-2">GitHub Authentication</h1>
            <p className="color-fg-muted f4">Choose an authentication method to access workflow statuses.</p>
          </div>
        
        {!showGitHubAppForm && (
          <>
            <div style={{
              boxShadow: '0 1px 3px var(--color-shadow-small), 0 8px 24px var(--color-shadow-medium)',
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px'
            }}>
              <div style={{
                background: 'var(--bgColor-muted)',
                borderBottom: '1px solid var(--borderColor-default)',
                borderRadius: '6px 6px 0 0',
                padding: '16px 24px'
              }}>
                <h2 style={{fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center'}}>
                  <GearIcon size={20} style={{marginRight: '8px'}} />
                  GitHub App (Recommended)
                </h2>
              </div>
              <div style={{padding: '32px 40px 16px 40px'}}>
                <p className="color-fg-muted f5 mb-3">Enhanced security with automatic token refresh, ideal for professional use.</p>
                <Button 
                  onClick={() => setShowGitHubAppForm(true)} 
                  variant="primary"
                  block
                  size="large"
                  leadingVisual={MarkGithubIcon}
                >
                  Configure GitHub App
                </Button>
                <p className="f6 color-fg-muted mt-3 mb-0 text-center">
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowGuide(true); }} 
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
                    Need help?
                    <LinkExternalIcon size={14} style={{display: 'inline', marginLeft: '4px', verticalAlign: 'text-bottom'}} />
                  </button>
                </p>
              </div>
            </div>
            
            <div className="d-flex flex-items-center my-5">
              <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
              <span className="px-4 f5 color-fg-muted" style={{fontWeight: 600}}>OR</span>
              <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
            </div>
            
            <div style={{
              boxShadow: '0 1px 3px var(--color-shadow-small), 0 8px 24px var(--color-shadow-medium)',
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px'
            }}>
              <PatForm
                githubToken={githubToken}
                setGithubToken={setGithubToken}
                onSubmit={saveToken}
              />
            </div>
            
            <div className="d-flex flex-items-center my-5">
              <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
              <span className="px-4 f5 color-fg-muted" style={{fontWeight: 600}}>OR</span>
              <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
            </div>
            
            <div style={{
              boxShadow: '0 1px 3px var(--color-shadow-small), 0 8px 24px var(--color-shadow-medium)',
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px'
            }}>
              <div style={{
                background: 'var(--bgColor-muted)',
                borderBottom: '1px solid var(--borderColor-default)',
                borderRadius: '6px 6px 0 0',
                padding: '16px 24px'
              }}>
                <h2 style={{fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center'}}>
                  <BeakerIcon size={20} style={{marginRight: '8px'}} />
                  Demo Mode
                </h2>
              </div>
              <div style={{padding: '32px 40px 16px'}}>
                {authMethod === 'demo' ? (
                  <>
                    <p className="color-fg-muted f5 mb-3">You are currently viewing sample data.</p>
                    <Button 
                      onClick={handleLogout} 
                      variant="danger"
                      block
                      size="large"
                      leadingVisual={SignOutIcon}
                    >
                      Sign Out
                    </Button>
                    <p className="f6 color-fg-muted mt-3 mb-0 text-center">Sign out to use real GitHub data.</p>
                  </>
                ) : (
                  <>
                    <p className="color-fg-muted f5 mb-3">Explore the dashboard with demo data, discover what this app can do.</p>
                    <Button 
                      onClick={handleDemoMode} 
                      variant="default"
                      block
                      size="large"
                      leadingVisual={LightBulbIcon}
                    >
                      Explore Demo
                    </Button>
                    <p className="f6 color-fg-muted mt-3 mb-0 text-center">No authentication required. Demo data only.</p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        
        {showGitHubAppForm && (
          <GitHubAppForm
            appId={appId}
            setAppId={setAppId}
            installationId={installationId}
            setInstallationId={setInstallationId}
            privateKey={privateKey}
            setPrivateKey={setPrivateKey}
            appFormError={appFormError}
            onSubmit={handleGitHubAppSetup}
            onBack={() => setShowGitHubAppForm(false)}
            onShowGuide={() => setShowGuide(true)}
          />
        )}
      </div>
    </div>
    </>
  )
}
