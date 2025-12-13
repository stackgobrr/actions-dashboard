import { ExternalLink, CheckCircle, X } from 'lucide-react'

function GitHubAppGuide({ onClose }) {
  const currentUrl = window.location.origin
  
  return (
    <div 
      className="position-fixed top-0 left-0 right-0 bottom-0 d-flex flex-items-start flex-justify-center overflow-y-auto" 
      style={{
        background: 'rgba(27, 31, 36, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        padding: '32px'
      }}
      onClick={onClose}
    >
      <div 
        className="Box mt-6" 
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Box-header d-flex flex-justify-between flex-items-center">
          <h1 className="Box-title">GitHub App Setup Guide</h1>
          <button 
            onClick={onClose} 
            className="btn-octicon btn-octicon-danger"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="Box-body overflow-y-auto" style={{maxHeight: 'calc(90vh - 60px)'}}>
          <div className="mb-3">
            <details className="details-reset">
              <summary className="btn btn-block text-left d-flex flex-justify-between flex-items-center">
                <span className="d-flex flex-items-center gap-2">
                  <span className="Label Label--primary" style={{width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>1</span>
                  <strong>Create GitHub App</strong>
                </span>
              </summary>
              <div className="p-3 border-top mt-2">
                <p className="mb-3">
                  <a href="https://github.com/settings/apps/new" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    <ExternalLink size={14} style={{marginRight: '0.25rem'}} />
                    Open GitHub App creation form
                  </a>
                </p>
                
                <div className="Box Box--condensed mb-3">
                  <div className="Box-header">
                    <h3 className="Box-title">Required Settings</h3>
                  </div>
                  <div className="Box-body">
                    <div className="mb-3">
                      <strong className="d-block mb-1">GitHub App name</strong>
                      <p className="f6 color-fg-muted">Choose any unique name (e.g., "My Actions Dashboard")</p>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="d-block mb-1">Homepage URL</strong>
                      <code className="f6">{currentUrl}</code>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="d-block mb-1">Webhook</strong>
                      <p className="f6 color-fg-muted">Uncheck "Active" - we don't need webhooks for this app</p>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="d-block mb-1">Repository permissions</strong>
                      <ul className="ml-3">
                        <li className="d-flex flex-items-center gap-2 mb-1">
                          <CheckCircle size={16} className="color-fg-success" />
                          <span><strong>Actions:</strong> Read-only</span>
                        </li>
                        <li className="d-flex flex-items-center gap-2">
                          <CheckCircle size={16} className="color-fg-success" />
                          <span><strong>Metadata:</strong> Read-only (automatically selected)</span>
                        </li>
                      </ul>
                      <p className="f6 color-fg-muted mt-2 mb-0">All other permissions should remain "No access"</p>
                    </div>
                    
                    <div>
                      <strong className="d-block mb-1">Where can this GitHub App be installed?</strong>
                      <ul className="ml-3">
                        <li className="mb-1">Choose "Only on this account" for personal use</li>
                        <li>Or "Any account" if you want to share it</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flash flash-success">
                  <CheckCircle size={16} style={{marginRight: '0.5rem'}} />
                  <div>
                    <strong>After creating the app:</strong>
                    <p className="mb-0">Note down your <strong>App ID</strong> - it's displayed at the top of your app's settings page</p>
                  </div>
                </div>
              </div>
            </details>
          </div>
          
          <div className="mb-3">
            <details className="details-reset">
              <summary className="btn btn-block text-left d-flex flex-justify-between flex-items-center">
                <span className="d-flex flex-items-center gap-2">
                  <span className="Label Label--primary" style={{width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>2</span>
                  <strong>Generate Private Key</strong>
                </span>
              </summary>
              <div className="p-3 border-top mt-2">
                <ol className="ml-3">
                  <li className="mb-2">On your GitHub App settings page, scroll down to the "Private keys" section</li>
                  <li className="mb-2">Click the <strong>"Generate a private key"</strong> button</li>
                  <li className="mb-2">A <code className="f6">.pem</code> file will be automatically downloaded</li>
                  <li className="mb-2">
                    <strong>Convert the key format</strong> (GitHub generates PKCS#1, but we need PKCS#8):
                    <ul className="ml-3 mt-2">
                      <li className="mb-1">Open Terminal (Mac/Linux) or PowerShell (Windows)</li>
                      <li className="mb-1">Run this command (replace the filename with yours):</li>
                    </ul>
                    <pre className="p-2 rounded-2 color-bg-subtle f6 text-mono mt-2 mb-2" style={{overflowX: 'auto'}}>
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in your-app.pem -out your-app-pkcs8.pem
                    </pre>
                    <ul className="ml-3">
                      <li className="mb-1">This creates a new file ending in <code className="f6">-pkcs8.pem</code></li>
                    </ul>
                  </li>
                  <li className="mb-2">Open the <strong>converted</strong> file (<code className="f6">-pkcs8.pem</code>) with any text editor</li>
                  <li className="mb-2">Copy the entire contents including the BEGIN and END lines</li>
                  <li>The key should start with <code className="f6">-----BEGIN PRIVATE KEY-----</code> (not "RSA PRIVATE KEY")</li>
                </ol>
                
                <div className="flash flash-warn mt-3">
                  <strong>⚠️ Security Note:</strong>
                  <p className="mb-0">Keep this private key secure! It's like a password for your GitHub App. Never commit it to version control or share it publicly.</p>
                </div>
                
                <div className="flash mt-3">
                  <strong>Why convert?</strong>
                  <p className="mb-0">GitHub generates keys in PKCS#1 format (<code className="f6">BEGIN RSA PRIVATE KEY</code>), but the authentication library requires PKCS#8 format (<code className="f6">BEGIN PRIVATE KEY</code>) for better security and compatibility.</p>
                </div>
              </div>
            </details>
          </div>
          
          <div className="mb-3">
            <details className="details-reset">
              <summary className="btn btn-block text-left d-flex flex-justify-between flex-items-center">
                <span className="d-flex flex-items-center gap-2">
                  <span className="Label Label--primary" style={{width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>3</span>
                  <strong>Install the App</strong>
                </span>
              </summary>
              <div className="p-3 border-top mt-2">
                <ol className="ml-3">
                  <li className="mb-2">In your GitHub App settings, click <strong>"Install App"</strong> in the left sidebar</li>
                  <li className="mb-2">Click the <strong>"Install"</strong> button next to your account/organization</li>
                  <li className="mb-2">Choose repository access:
                    <ul className="ml-3 mt-1">
                      <li className="mb-1"><strong>All repositories</strong> - Easiest option, gives access to all current and future repos</li>
                      <li><strong>Only select repositories</strong> - More secure, manually select which repos the app can access</li>
                    </ul>
                  </li>
                  <li>Click <strong>"Install"</strong> to complete the installation</li>
                </ol>
                
                <div className="flash mt-3">
                  <div>
                    <strong className="d-block mb-1">Finding your Installation ID:</strong>
                    <p className="mb-2">After installing, look at the URL in your browser:</p>
                    <code className="d-block p-2 rounded-2 color-bg-subtle f6 text-mono">https://github.com/settings/installations/12345678</code>
                    <p className="mt-2 mb-0">The number at the end (<code className="f6">12345678</code>) is your <strong>Installation ID</strong></p>
                  </div>
                </div>
              </div>
            </details>
          </div>
          
          <div className="mb-3">
            <details className="details-reset">
              <summary className="btn btn-block text-left d-flex flex-justify-between flex-items-center">
                <span className="d-flex flex-items-center gap-2">
                  <span className="Label Label--primary" style={{width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>4</span>
                  <strong>Configure Dashboard</strong>
                </span>
              </summary>
              <div className="p-3 border-top mt-2">
                <p className="mb-3">Now you have all three pieces of information needed:</p>
                
                <div className="mb-3">
                  <div className="Box Box--condensed mb-2">
                    <div className="Box-row d-flex gap-3">
                      <CheckCircle size={20} className="color-fg-success flex-shrink-0" />
                      <div>
                        <strong className="d-block">App ID</strong>
                        <p className="f6 color-fg-muted mb-0">From your GitHub App settings page (usually 6 digits)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="Box Box--condensed mb-2">
                    <div className="Box-row d-flex gap-3">
                      <CheckCircle size={20} className="color-fg-success flex-shrink-0" />
                      <div>
                        <strong className="d-block">Installation ID</strong>
                        <p className="f6 color-fg-muted mb-0">From the installation URL (usually 8 digits)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="Box Box--condensed">
                    <div className="Box-row d-flex gap-3">
                      <CheckCircle size={20} className="color-fg-success flex-shrink-0" />
                      <div>
                        <strong className="d-block">Private Key</strong>
                        <p className="f6 color-fg-muted mb-0">Contents of the converted PKCS#8 .pem file</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="mb-2">Click the button below to return to the configuration form and enter these credentials.</p>
                
                <button onClick={onClose} className="btn btn-primary btn-block">
                  Configure Dashboard Now →
                </button>
              </div>
            </details>
          </div>
          
          <div className="mb-3">
            <details className="details-reset">
              <summary className="btn btn-block text-left">
                <strong>Troubleshooting</strong>
              </summary>
              <div className="p-3 border-top mt-2">
                <details className="Box Box--condensed mb-2">
                  <summary className="Box-row">
                    <strong>Error: "Failed to authenticate with GitHub App"</strong>
                  </summary>
                  <div className="Box-row border-top">
                    <ul className="ml-3">
                      <li>Double-check your App ID and Installation ID are correct</li>
                      <li>Ensure you copied the entire private key including BEGIN/END lines</li>
                      <li>Verify your GitHub App has the correct permissions (Actions: Read-only)</li>
                      <li>Make sure the app is installed on your account/repos</li>
                      <li>Confirm you converted the key to PKCS#8 format</li>
                    </ul>
                  </div>
                </details>
                
                <details className="Box Box--condensed mb-2">
                  <summary className="Box-row">
                    <strong>Can't find my Installation ID</strong>
                  </summary>
                  <div className="Box-row border-top">
                    <ul className="ml-3">
                      <li>Go to <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer" className="Link--primary">github.com/settings/installations</a></li>
                      <li>Click "Configure" next to your app</li>
                      <li>Look at the URL - the number at the end is your Installation ID</li>
                    </ul>
                  </div>
                </details>
                
                <details className="Box Box--condensed">
                  <summary className="Box-row">
                    <strong>App shows "Authentication required" errors</strong>
                  </summary>
                  <div className="Box-row border-top">
                    <ul className="ml-3">
                      <li>Installation tokens expire after 1 hour (but auto-refresh)</li>
                      <li>Try refreshing the page to generate a new token</li>
                      <li>Verify the GitHub App is still installed on your account</li>
                      <li>Check that the app has access to the repositories you're trying to view</li>
                    </ul>
                  </div>
                </details>
              </div>
            </details>
          </div>
          
          <div>
            <details className="details-reset">
              <summary className="btn btn-block text-left">
                <strong>Why GitHub Apps?</strong>
              </summary>
              <div className="p-3 border-top mt-2">
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                  <div className="Box">
                    <div className="Box-body">
                      <h3 className="f5 mb-2">🔒 More Secure</h3>
                      <p className="f6 color-fg-muted mb-0">Fine-grained permissions scoped to specific repositories and actions</p>
                    </div>
                  </div>
                  
                  <div className="Box">
                    <div className="Box-body">
                      <h3 className="f5 mb-2">🔄 Auto-Refresh</h3>
                      <p className="f6 color-fg-muted mb-0">Installation tokens automatically refresh - no manual token rotation</p>
                    </div>
                  </div>
                  
                  <div className="Box">
                    <div className="Box-body">
                      <h3 className="f5 mb-2">👥 Team Friendly</h3>
                      <p className="f6 color-fg-muted mb-0">Not tied to a specific user account - better for organizations</p>
                    </div>
                  </div>
                  
                  <div className="Box">
                    <div className="Box-body">
                      <h3 className="f5 mb-2">📊 Better Audit Trail</h3>
                      <p className="f6 color-fg-muted mb-0">Enhanced logging and activity tracking in GitHub</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubAppGuide
