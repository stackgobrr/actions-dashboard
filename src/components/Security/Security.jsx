import { ChevronLeftIcon, MoonIcon, SunIcon, ShieldLockIcon, CheckCircleIcon } from '@primer/octicons-react'
import { Button, IconButton, Text } from '@primer/react'
import './Security.css'

export function Security({ onBack, theme, setTheme }) {
  return (
    <div className="security-page">
      {/* Header */}
      <header className="security-header">
        <div className="container">
          <div className="d-flex flex-justify-between flex-items-center">
            <div className="d-flex flex-items-center" style={{ gap: '12px' }}>
              <ShieldLockIcon size={28} />
              <Text sx={{ fontSize: 3, fontWeight: 'semibold' }}>Actions Dashboard</Text>
            </div>
            <div className="d-flex flex-items-center" style={{ gap: '16px' }}>
              <Button
                variant="invisible"
                onClick={onBack}
                leadingVisual={ChevronLeftIcon}
              >
                Back
              </Button>
              <IconButton
                icon={theme === 'dark' ? SunIcon : MoonIcon}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="color-fg-muted"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="security-container">
        <div className="security-intro">
          <h1 className="security-title">Security</h1>
          <p>How Actions Dashboard protects your GitHub credentials and data.</p>
        </div>

        <div className="security-list">
          {/* OAuth Security */}
          <div className="security-card">
            <div className="card-header">
              <ShieldLockIcon size={20} className="color-fg-success" />
              <h2 className="card-title">OAuth Authentication</h2>
            </div>
            <p className="card-description">
              When you authenticate via GitHub OAuth, Actions Dashboard uses industry-standard security practices:
            </p>
            <ul className="security-features">
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>httpOnly Cookies:</strong> Your GitHub access token is stored in an httpOnly cookie that JavaScript cannot access, protecting against XSS (Cross-Site Scripting) attacks.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>Dual-Cookie Pattern:</strong> A separate readable cookie (<code>auth_status</code>) indicates authentication status for UI decisions, while the secure token cookie (<code>gh_session</code>) remains protected.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>Secure & SameSite:</strong> All cookies use the <code>Secure</code> flag (HTTPS only) and <code>SameSite=Lax</code> to prevent CSRF attacks.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>24-Hour Expiration:</strong> Sessions automatically expire after 24 hours, limiting exposure if a token is compromised.
                </div>
              </li>
            </ul>
          </div>

          {/* PAT & GitHub App Security */}
          <div className="security-card">
            <div className="card-header">
              <ShieldLockIcon size={20} className="color-fg-attention" />
              <h2 className="card-title">Personal Access Token & GitHub App</h2>
            </div>
            <p className="card-description">
              When you provide your own Personal Access Token or GitHub App credentials:
            </p>
            <ul className="security-features">
              <li>
                <CheckCircleIcon size={16} className="color-fg-attention" />
                <div>
                  <strong>localStorage Storage:</strong> Tokens are stored in browser localStorage for convenience. While this is less secure than httpOnly cookies, it's acceptable since you're managing your own credentials.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>Client-Side Only:</strong> Your tokens never touch our servers—all API requests go directly from your browser to GitHub.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>Same-Origin Policy:</strong> Browser security prevents cross-domain JavaScript from accessing your localStorage data.
                </div>
              </li>
            </ul>
          </div>

          {/* Additional Security Measures */}
          <div className="security-card">
            <div className="card-header">
              <ShieldLockIcon size={20} className="color-fg-accent" />
              <h2 className="card-title">Additional Security Measures</h2>
            </div>
            <ul className="security-features">
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>Content Security Policy (CSP):</strong> Strict CSP headers prevent inline script injection and restrict resource loading to trusted sources.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>No Third-Party Dependencies for Auth:</strong> All authentication logic is handled directly—no third-party auth libraries that could introduce vulnerabilities.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>HTTPS Only:</strong> All communication with GitHub APIs and our backend occurs over encrypted HTTPS connections.
                </div>
              </li>
              <li>
                <CheckCircleIcon size={16} className="color-fg-success" />
                <div>
                  <strong>Minimal Permissions:</strong> OAuth tokens request only the minimum required scopes (<code>repo</code>, <code>workflow</code>) to read workflow statuses.
                </div>
              </li>
            </ul>
          </div>

          {/* Security Tradeoffs */}
          <div className="security-card security-note">
            <h3>Security Tradeoffs</h3>
            <p>
              We've chosen OAuth with httpOnly cookies as the most secure authentication method. However, for flexibility, we also support Personal Access Tokens and GitHub Apps that use localStorage. This is a pragmatic tradeoff:
            </p>
            <ul>
              <li><strong>OAuth:</strong> Maximum security—you manage nothing, we handle everything securely</li>
              <li><strong>PAT/GitHub App:</strong> You manage your own credentials—you already have access to these tokens, so localStorage is acceptable</li>
            </ul>
            <p>
              Both approaches are protected by CSP and same-origin policies, providing defense-in-depth against common web attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
