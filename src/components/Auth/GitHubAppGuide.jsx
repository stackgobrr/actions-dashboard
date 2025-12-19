import { LinkExternalIcon, CheckCircleIcon, XIcon } from '@primer/octicons-react'
import { Button, IconButton } from '@primer/react'

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
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          boxShadow: '0 1px 3px var(--color-shadow-small), 0 8px 24px var(--color-shadow-medium)',
          border: '1px solid var(--borderColor-default)',
          borderRadius: '6px',
          marginTop: '48px',
          background: 'var(--bgColor-default)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          background: 'var(--bgColor-muted)',
          borderBottom: '1px solid var(--borderColor-default)',
          borderRadius: '6px 6px 0 0',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{fontSize: '20px', fontWeight: 600, margin: 0}}>GitHub App Setup Guide</h1>
          <IconButton 
            onClick={onClose} 
            className="color-fg-muted"
            aria-label="Close"
            icon={XIcon}
          />
        </div>
        
        <div style={{padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)'}}>
          <div style={{marginBottom: '16px'}}>
            <details className="details-reset" style={{
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <summary style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bgColor-default)',
                borderRadius: '6px',
                userSelect: 'none'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bgColor-accent-emphasis)',
                  color: 'var(--fgColor-onEmphasis)',
                  fontSize: '14px',
                  fontWeight: 600
                }}>1</span>
                <span>Create GitHub App</span>
              </summary>
              <div style={{padding: '16px', borderTop: '1px solid var(--borderColor-default)'}}>
                <div style={{marginBottom: '16px'}}>
                  <a 
                    href="https://github.com/settings/apps/new" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      background: 'var(--button-primary-bgColor)',
                      color: 'var(--button-primary-fgColor)',
                      border: '1px solid transparent',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      gap: '6px'
                    }}
                  >
                    <LinkExternalIcon size={14} />
                    Open GitHub App creation form
                  </a>
                </div>
                
                <div style={{
                  border: '1px solid var(--borderColor-default)',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: 'var(--bgColor-muted)',
                    borderBottom: '1px solid var(--borderColor-default)',
                    padding: '12px 16px'
                  }}>
                    <h3 style={{fontSize: '14px', fontWeight: 600, margin: 0}}>Required Settings</h3>
                  </div>
                  <div style={{padding: '16px'}}>
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
                          <CheckCircleIcon size={16} className="color-fg-success" />
                          <span><strong>Actions:</strong> Read-only</span>
                        </li>
                        <li className="d-flex flex-items-center gap-2">
                          <CheckCircleIcon size={16} className="color-fg-success" />
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
                
                <div style={{
                  background: 'var(--bgColor-success-muted)',
                  border: '1px solid var(--borderColor-success-emphasis)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <CheckCircleIcon size={16} style={{color: 'var(--fgColor-success)', flexShrink: 0, marginTop: '2px'}} />
                  <div>
                    <strong style={{display: 'block', marginBottom: '4px'}}>After creating the app:</strong>
                    <p style={{margin: 0, fontSize: '14px'}}>Note down your <strong>App ID</strong> - it's displayed at the top of your app's settings page</p>
                  </div>
                </div>
              </div>
            </details>
          </div>
          
          <div style={{marginBottom: '16px'}}>
            <details className="details-reset" style={{
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <summary style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bgColor-default)',
                borderRadius: '6px',
                userSelect: 'none'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bgColor-accent-emphasis)',
                  color: 'var(--fgColor-onEmphasis)',
                  fontSize: '14px',
                  fontWeight: 600
                }}>2</span>
                <span>Generate Private Key</span>
              </summary>
              <div style={{padding: '16px', borderTop: '1px solid var(--borderColor-default)'}}>
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
                
                <div style={{
                  background: 'var(--bgColor-attention-muted)',
                  border: '1px solid var(--borderColor-attention-emphasis)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginTop: '16px'
                }}>
                  <strong style={{display: 'block', marginBottom: '4px'}}>⚠️ Security Note:</strong>
                  <p style={{margin: 0, fontSize: '14px'}}>Keep this private key secure! It's like a password for your GitHub App. Never commit it to version control or share it publicly.</p>
                </div>
                
                <div style={{
                  background: 'var(--bgColor-muted)',
                  border: '1px solid var(--borderColor-default)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginTop: '16px'
                }}>
                  <strong style={{display: 'block', marginBottom: '4px'}}>Why convert?</strong>
                  <p style={{margin: 0, fontSize: '14px'}}>GitHub generates keys in PKCS#1 format (<code className="f6">BEGIN RSA PRIVATE KEY</code>), but the authentication library requires PKCS#8 format (<code className="f6">BEGIN PRIVATE KEY</code>) for better security and compatibility.</p>
                </div>
              </div>
            </details>
          </div>
          
          <div style={{marginBottom: '16px'}}>
            <details className="details-reset" style={{
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <summary style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bgColor-default)',
                borderRadius: '6px',
                userSelect: 'none'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bgColor-accent-emphasis)',
                  color: 'var(--fgColor-onEmphasis)',
                  fontSize: '14px',
                  fontWeight: 600
                }}>3</span>
                <span>Install the App</span>
              </summary>
              <div style={{padding: '16px', borderTop: '1px solid var(--borderColor-default)'}}>
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
          
          <div style={{marginBottom: '16px'}}>
            <details className="details-reset" style={{
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <summary style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bgColor-default)',
                borderRadius: '6px',
                userSelect: 'none'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bgColor-accent-emphasis)',
                  color: 'var(--fgColor-onEmphasis)',
                  fontSize: '14px',
                  fontWeight: 600
                }}>4</span>
                <span>Configure Dashboard</span>
              </summary>
              <div style={{padding: '16px', borderTop: '1px solid var(--borderColor-default)'}}>
                <p style={{marginBottom: '16px', fontSize: '14px'}}>Now you have all three pieces of information needed:</p>
                
                <div style={{marginBottom: '16px'}}>
                  <div style={{
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <CheckCircleIcon size={20} style={{color: 'var(--fgColor-success)', flexShrink: 0, marginTop: '2px'}} />
                    <div>
                      <strong style={{display: 'block', marginBottom: '4px'}}>App ID</strong>
                      <p style={{fontSize: '14px', color: 'var(--fgColor-muted)', margin: 0}}>From your GitHub App settings page (usually 6 digits)</p>
                    </div>
                  </div>
                  
                  <div style={{
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <CheckCircleIcon size={20} style={{color: 'var(--fgColor-success)', flexShrink: 0, marginTop: '2px'}} />
                    <div>
                      <strong style={{display: 'block', marginBottom: '4px'}}>Installation ID</strong>
                      <p style={{fontSize: '14px', color: 'var(--fgColor-muted)', margin: 0}}>From the installation URL (usually 8 digits)</p>
                    </div>
                  </div>
                  
                  <div style={{
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <CheckCircleIcon size={20} style={{color: 'var(--fgColor-success)', flexShrink: 0, marginTop: '2px'}} />
                    <div>
                      <strong style={{display: 'block', marginBottom: '4px'}}>Private Key</strong>
                      <p style={{fontSize: '14px', color: 'var(--fgColor-muted)', margin: 0}}>Contents of the converted PKCS#8 .pem file</p>
                    </div>
                  </div>
                </div>
                
                <p style={{marginBottom: '12px', fontSize: '14px'}}>Click the button below to return to the configuration form and enter these credentials.</p>
                
                <Button 
                  onClick={onClose} 
                  variant="primary"
                  block
                >
                  Configure Dashboard Now →
                </Button>
              </div>
            </details>
          </div>
          
          <div style={{marginBottom: '16px'}}>
            <details className="details-reset" style={{
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <summary style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bgColor-default)',
                borderRadius: '6px',
                userSelect: 'none'
              }}>
                <span>Troubleshooting</span>
              </summary>
              <div style={{padding: '16px', borderTop: '1px solid var(--borderColor-default)'}}>
                <details style={{
                  border: '1px solid var(--borderColor-default)',
                  borderRadius: '6px',
                  marginBottom: '12px'
                }}>
                  <summary style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    background: 'var(--bgColor-default)',
                    borderRadius: '6px'
                  }}>
                    Error: "Failed to authenticate with GitHub App"
                  </summary>
                  <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--borderColor-default)'
                  }}>
                    <ul style={{marginLeft: '20px', fontSize: '14px'}}>
                      <li style={{marginBottom: '8px'}}>Double-check your App ID and Installation ID are correct</li>
                      <li style={{marginBottom: '8px'}}>Ensure you copied the entire private key including BEGIN/END lines</li>
                      <li style={{marginBottom: '8px'}}>Verify your GitHub App has the correct permissions (Actions: Read-only)</li>
                      <li style={{marginBottom: '8px'}}>Make sure the app is installed on your account/repos</li>
                      <li>Confirm you converted the key to PKCS#8 format</li>
                    </ul>
                  </div>
                </details>
                
                <details style={{
                  border: '1px solid var(--borderColor-default)',
                  borderRadius: '6px',
                  marginBottom: '12px'
                }}>
                  <summary style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    background: 'var(--bgColor-default)',
                    borderRadius: '6px'
                  }}>
                    Can't find my Installation ID
                  </summary>
                  <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--borderColor-default)'
                  }}>
                    <ul style={{marginLeft: '20px', fontSize: '14px'}}>
                      <li style={{marginBottom: '8px'}}>Go to <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer" style={{color: 'var(--fgColor-accent)', textDecoration: 'none'}}>github.com/settings/installations</a></li>
                      <li style={{marginBottom: '8px'}}>Click "Configure" next to your app</li>
                      <li>Look at the URL - the number at the end is your Installation ID</li>
                    </ul>
                  </div>
                </details>
                
                <details style={{
                  border: '1px solid var(--borderColor-default)',
                  borderRadius: '6px'
                }}>
                  <summary style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    background: 'var(--bgColor-default)',
                    borderRadius: '6px'
                  }}>
                    App shows "Authentication required" errors
                  </summary>
                  <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--borderColor-default)'
                  }}>
                    <ul style={{marginLeft: '20px', fontSize: '14px'}}>
                      <li style={{marginBottom: '8px'}}>Installation tokens expire after 1 hour (but auto-refresh)</li>
                      <li style={{marginBottom: '8px'}}>Try refreshing the page to generate a new token</li>
                      <li style={{marginBottom: '8px'}}>Verify the GitHub App is still installed on your account</li>
                      <li>Check that the app has access to the repositories you're trying to view</li>
                    </ul>
                  </div>
                </details>
              </div>
            </details>
          </div>
          
          <div>
            <details className="details-reset" style={{
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px'
            }}>
              <summary style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bgColor-default)',
                borderRadius: '6px',
                userSelect: 'none'
              }}>
                <span>Why GitHub Apps?</span>
              </summary>
              <div style={{padding: '16px', borderTop: '1px solid var(--borderColor-default)'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                  <div style={{
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    <h3 style={{fontSize: '16px', marginBottom: '8px', fontWeight: 600}}>🔒 More Secure</h3>
                    <p style={{fontSize: '14px', color: 'var(--fgColor-muted)', margin: 0}}>Fine-grained permissions scoped to specific repositories and actions</p>
                  </div>
                  
                  <div style={{
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    <h3 style={{fontSize: '16px', marginBottom: '8px', fontWeight: 600}}>🔄 Auto-Refresh</h3>
                    <p style={{fontSize: '14px', color: 'var(--fgColor-muted)', margin: 0}}>Installation tokens automatically refresh - no manual token rotation</p>
                  </div>
                  
                  <div style={{
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    <h3 style={{fontSize: '16px', marginBottom: '8px', fontWeight: 600}}>👥 Team Friendly</h3>
                    <p style={{fontSize: '14px', color: 'var(--fgColor-muted)', margin: 0}}>Not tied to a specific user account - better for organizations</p>
                  </div>
                  
                  <div style={{
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    <h3 style={{fontSize: '16px', marginBottom: '8px', fontWeight: 600}}>📊 Better Audit Trail</h3>
                    <p style={{fontSize: '14px', color: 'var(--fgColor-muted)', margin: 0}}>Enhanced logging and activity tracking in GitHub</p>
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
