import { ExternalLink, CheckCircle } from 'lucide-react'
import './GitHubAppGuide.css'

function GitHubAppGuide({ onClose }) {
  const currentUrl = window.location.origin
  
  return (
    <div className="guide-overlay">
      <div className="guide-container">
        <div className="guide-header">
          <h1>GitHub App Setup Guide</h1>
          <button onClick={onClose} className="guide-close">×</button>
        </div>
        
        <div className="guide-content">
          <section className="guide-section">
            <details>
              <summary><h2><span className="step-number">1</span> Create GitHub App</h2></summary>
              <div className="section-content">
                <p>
                  <a href="https://github.com/settings/apps/new" target="_blank" rel="noopener noreferrer" className="guide-link">
                    Open GitHub App creation form <ExternalLink size={16} />
                  </a>
                </p>
                
                <div className="settings-box">
                  <h3>Required Settings</h3>
                  
                  <div className="setting-item">
                    <strong>GitHub App name</strong>
                    <p>Choose any unique name (e.g., "My Actions Dashboard")</p>
                  </div>
                  
                  <div className="setting-item">
                    <strong>Homepage URL</strong>
                    <p><code>{currentUrl}</code></p>
                  </div>
                  
                  <div className="setting-item">
                    <strong>Webhook</strong>
                    <p>Uncheck "Active" - we don't need webhooks for this app</p>
                  </div>
                  
                  <div className="setting-item">
                    <strong>Repository permissions</strong>
                    <ul>
                      <li><strong>Actions:</strong> Read-only <CheckCircle size={16} className="check-icon" /></li>
                      <li><strong>Metadata:</strong> Read-only (automatically selected) <CheckCircle size={16} className="check-icon" /></li>
                    </ul>
                    <p className="note">All other permissions should remain "No access"</p>
                  </div>
                  
                  <div className="setting-item">
                    <strong>Where can this GitHub App be installed?</strong>
                    <ul>
                      <li>Choose "Only on this account" for personal use</li>
                      <li>Or "Any account" if you want to share it</li>
                    </ul>
                  </div>
                </div>
                
                <div className="success-box">
                  <CheckCircle size={20} />
                  <div>
                    <strong>After creating the app:</strong>
                    <p>Note down your <strong>App ID</strong> - it's displayed at the top of your app's settings page</p>
                  </div>
                </div>
              </div>
            </details>
          </section>
          
          <section className="guide-section">
            <details>
              <summary><h2><span className="step-number">2</span> Generate Private Key</h2></summary>
              <div className="section-content">
                <ol className="guide-steps">
                  <li>On your GitHub App settings page, scroll down to the "Private keys" section</li>
                  <li>Click the <strong>"Generate a private key"</strong> button</li>
                  <li>A <code>.pem</code> file will be automatically downloaded</li>
                  <li><strong>Convert the key format</strong> (GitHub generates PKCS#1, but we need PKCS#8):
                    <ul>
                      <li>Open Terminal (Mac/Linux) or PowerShell (Windows)</li>
                      <li>Run this command (replace the filename with yours):</li>
                      <code style={{display: 'block', margin: '8px 0', padding: '8px', background: 'var(--bg-primary)', borderRadius: '3px'}}>
                        openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in your-app.pem -out your-app-pkcs8.pem
                      </code>
                      <li>This creates a new file ending in <code>-pkcs8.pem</code></li>
                    </ul>
                  </li>
                  <li>Open the <strong>converted</strong> file (<code>-pkcs8.pem</code>) with any text editor</li>
                  <li>Copy the entire contents including the BEGIN and END lines</li>
                  <li>The key should start with <code>-----BEGIN PRIVATE KEY-----</code> (not "RSA PRIVATE KEY")</li>
                </ol>
                
                <div className="warning-box">
                  <strong>⚠️ Security Note:</strong>
                  <p>Keep this private key secure! It's like a password for your GitHub App. Never commit it to version control or share it publicly.</p>
                </div>
                
                <div className="info-box">
                  <strong>Why convert?</strong>
                  <p>GitHub generates keys in PKCS#1 format (<code>BEGIN RSA PRIVATE KEY</code>), but the authentication library requires PKCS#8 format (<code>BEGIN PRIVATE KEY</code>) for better security and compatibility.</p>
                </div>
              </div>
            </details>
          </section>
          
          <section className="guide-section">
            <details>
              <summary><h2><span className="step-number">3</span> Install the App</h2></summary>
              <div className="section-content">
                <ol className="guide-steps">
                  <li>In your GitHub App settings, click <strong>"Install App"</strong> in the left sidebar</li>
                  <li>Click the <strong>"Install"</strong> button next to your account/organization</li>
                  <li>Choose repository access:
                    <ul>
                      <li><strong>All repositories</strong> - Easiest option, gives access to all current and future repos</li>
                      <li><strong>Only select repositories</strong> - More secure, manually select which repos the app can access</li>
                    </ul>
                  </li>
                  <li>Click <strong>"Install"</strong> to complete the installation</li>
                </ol>
                
                <div className="info-box">
                  <strong>Finding your Installation ID:</strong>
                  <p>After installing, look at the URL in your browser:</p>
                  <code className="url-example">https://github.com/settings/installations/12345678</code>
                  <p>The number at the end (<code>12345678</code>) is your <strong>Installation ID</strong></p>
                </div>
              </div>
            </details>
          </section>
          
          <section className="guide-section">
            <details>
              <summary><h2><span className="step-number">4</span> Configure Dashboard</h2></summary>
              <div className="section-content">
                <p>Now you have all three pieces of information needed:</p>
                
                <div className="credentials-list">
                  <div className="credential-item">
                    <CheckCircle size={20} className="check-icon" />
                    <div>
                      <strong>App ID</strong>
                      <p>From your GitHub App settings page (usually 6 digits)</p>
                    </div>
                  </div>
                  
                  <div className="credential-item">
                    <CheckCircle size={20} className="check-icon" />
                    <div>
                      <strong>Installation ID</strong>
                      <p>From the installation URL (usually 8 digits)</p>
                    </div>
                  </div>
                  
                  <div className="credential-item">
                    <CheckCircle size={20} className="check-icon" />
                    <div>
                      <strong>Private Key</strong>
                      <p>Contents of the downloaded .pem file</p>
                    </div>
                  </div>
                </div>
                
                <p>Click the button below to return to the configuration form and enter these credentials.</p>
                
                <button onClick={onClose} className="guide-cta">
                  Configure Dashboard Now →
                </button>
              </div>
            </details>
          </section>
          
          <section className="guide-section">
            <details>
              <summary><h2>Troubleshooting</h2></summary>
              <div className="section-content">
                <div className="troubleshooting">
                  <details>
                    <summary><strong>Error: "Failed to authenticate with GitHub App"</strong></summary>
                    <ul>
                      <li>Double-check your App ID and Installation ID are correct</li>
                      <li>Ensure you copied the entire private key including BEGIN/END lines</li>
                      <li>Verify your GitHub App has the correct permissions (Actions: Read-only)</li>
                      <li>Make sure the app is installed on your account/repos</li>
                    </ul>
                  </details>
                  
                  <details>
                    <summary><strong>Can't find my Installation ID</strong></summary>
                    <ul>
                      <li>Go to <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer">https://github.com/settings/installations</a></li>
                      <li>Click "Configure" next to your app</li>
                      <li>Look at the URL - the number at the end is your Installation ID</li>
                    </ul>
                  </details>
                  
                  <details>
                    <summary><strong>App shows "Authentication required" errors</strong></summary>
                    <ul>
                      <li>Installation tokens expire after 1 hour (but auto-refresh)</li>
                      <li>Try refreshing the page to generate a new token</li>
                      <li>Verify the GitHub App is still installed on your account</li>
                      <li>Check that the app has access to the repositories you're trying to view</li>
                    </ul>
                  </details>
                </div>
              </div>
            </details>
          </section>
          
          <section className="guide-section">
            <details>
              <summary><h2>Why GitHub Apps?</h2></summary>
              <div className="section-content">
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <h3>🔒 More Secure</h3>
                    <p>Fine-grained permissions scoped to specific repositories and actions</p>
                  </div>
                  
                  <div className="benefit-card">
                    <h3>🔄 Auto-Refresh</h3>
                    <p>Installation tokens automatically refresh - no manual token rotation</p>
                  </div>
                  
                  <div className="benefit-card">
                    <h3>👥 Team Friendly</h3>
                    <p>Not tied to a specific user account - better for organizations</p>
                  </div>
                  
                  <div className="benefit-card">
                    <h3>📊 Better Audit Trail</h3>
                    <p>Enhanced logging and activity tracking in GitHub</p>
                  </div>
                </div>
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  )
}

export default GitHubAppGuide
