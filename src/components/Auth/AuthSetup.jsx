import { MarkGithubIcon, GearIcon, LinkExternalIcon, ShieldLockIcon, DownloadIcon } from '@primer/octicons-react'
import { Button, Flash } from '@primer/react'
import GitHubAppGuide from './GitHubAppGuide'
import { GitHubAppForm } from './GitHubAppForm'
import { PatForm } from './PatForm'
import { buildInstallUrl, isSharedAppConfigured } from '../../config/githubApp'

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
  authMethod,
  patError,
  isValidatingPat,
  isValidatingGitHubApp
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

          <div style={{ marginBottom: '24px' }}>
            <Flash variant="default">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <ShieldLockIcon size={16} style={{marginRight: '8px', verticalAlign: 'text-bottom'}} />
                  <strong>Your credentials stay secure:</strong>
                </div>
                <ul className="f5 mb-0" style={{ paddingLeft: '28px' }}>
                  <li>Stored locally in your browser only, never sent to our servers</li>
                  <li>Direct API calls from your browser to GitHub, no middleman</li>
                  <li>CSP and same-origin policies prevent unauthorized access</li>
                </ul>
              </div>
            </Flash>
          </div>
        
        {!showGitHubAppForm && (
          <>
            {/* Option 1: Personal Access Token - Simplest */}
            <div style={{
              boxShadow: '0 1px 3px var(--color-shadow-small), 0 8px 24px var(--color-shadow-medium)',
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px'
            }}>
              <PatForm
                githubToken={githubToken}
                setGithubToken={setGithubToken}
                onSubmit={saveToken}
                patError={patError}
                isValidatingPat={isValidatingPat}
              />
              <div style={{padding: '0 40px 16px 40px'}}>
                <p className="f6 color-fg-muted mb-0" style={{fontStyle: 'italic'}}>
                  <strong>When to use:</strong> Quick setup for personal projects. Updates every 10 seconds via polling.
                </p>
              </div>
            </div>

            {isSharedAppConfigured() && (
              <>
                <div className="d-flex flex-items-center my-5">
                  <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
                  <span className="px-4 f5 text-semibold color-fg-muted">OR</span>
                  <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
                </div>

                {/* Option 2: Managed GitHub App - Recommended */}
                <div style={{
                  boxShadow: '0 1px 3px var(--color-shadow-small), 0 8px 24px var(--color-shadow-medium)',
                  border: '2px solid var(--borderColor-accent-emphasis)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    background: 'var(--bgColor-accent-muted)',
                    borderBottom: '1px solid var(--borderColor-default)',
                    borderRadius: '6px 6px 0 0',
                    padding: '16px 24px'
                  }}>
                    <h2 className="f4 text-semibold mb-0" style={{display: 'flex', alignItems: 'center'}}>
                      <DownloadIcon size={20} style={{marginRight: '8px'}} />
                      Managed GitHub App
                      <span className="Label Label--success ml-2" style={{fontSize: '12px'}}>Recommended</span>
                    </h2>
                  </div>
                  <div style={{padding: '32px 40px 16px 40px'}}>
                    <p className="color-fg-muted f5 mb-3">
                      One-click installation with instant live updates via webhooks. No configuration needed.
                    </p>
                    <Button
                      as="a"
                      href={buildInstallUrl()}
                      variant="primary"
                      block
                      size="large"
                      leadingVisual={DownloadIcon}
                    >
                      Install GitHub App
                    </Button>
                    <p className="f6 color-fg-muted mt-3 mb-0" style={{fontStyle: 'italic'}}>
                      <strong>When to use:</strong> Best for most users. Get instant updates when workflows start, complete, or fail.
                    </p>
                  </div>
                </div>
              </>
            )}
            
            <div className="d-flex flex-items-center my-5">
              <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
              <span className="px-4 f5 text-semibold color-fg-muted">OR</span>
              <div className="flex-1" style={{height: '1px', background: 'var(--borderColor-default)'}}></div>
            </div>

            {/* Option 3: Self-Hosted GitHub App - Advanced */}
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
                <h2 className="f4 text-semibold mb-0" style={{display: 'flex', alignItems: 'center'}}>
                  <GearIcon size={20} style={{marginRight: '8px'}} />
                  Self-Hosted GitHub App
                  <span className="Label ml-2" style={{fontSize: '12px'}}>Advanced</span>
                </h2>
              </div>
              <div style={{padding: '32px 40px 16px 40px'}}>
                <p className="color-fg-muted f5 mb-3">Create and configure your own GitHub App with full control over permissions and webhooks.</p>
                <Button
                  onClick={() => setShowGitHubAppForm(true)}
                  variant="default"
                  block
                  size="large"
                  leadingVisual={GearIcon}
                >
                  Configure GitHub App
                </Button>
                <p className="f6 color-fg-muted mt-3 mb-2 text-center">
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
                    Need help setting up?
                    <LinkExternalIcon size={14} style={{display: 'inline', marginLeft: '4px', verticalAlign: 'text-bottom'}} />
                  </button>
                </p>
                <p className="f6 color-fg-muted mb-0" style={{fontStyle: 'italic'}}>
                  <strong>When to use:</strong> Enterprise use, custom webhook endpoints, or when you need complete control.
                </p>
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
            isValidatingGitHubApp={isValidatingGitHubApp}
          />
        )}
      </div>
    </div>
    </>
  )
}
