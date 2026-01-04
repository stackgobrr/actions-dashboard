import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner, Flash } from '@primer/react'
import { CheckIcon, XIcon } from '@primer/octicons-react'
import { logger } from '../../utils/logger'

/**
 * SharedAppAuth Component
 * Handles the OAuth callback after a user installs the shared GitHub App
 *
 * Flow:
 * 1. User clicks "Install App" → redirected to GitHub
 * 2. GitHub redirects back to /auth/github/callback?installation_id=XXX&setup_action=install
 * 3. This component extracts installation_id and stores it
 * 4. Redirects to dashboard
 */
export function SharedAppAuth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract parameters from URL
        const installationId = searchParams.get('installation_id')
        const setupAction = searchParams.get('setup_action')
        const code = searchParams.get('code')

        logger.info('[SharedAppAuth] Callback received', {
          installationId,
          setupAction,
          hasCode: !!code
        })

        // Validate that we have an installation_id
        if (!installationId) {
          throw new Error('Missing installation_id parameter')
        }

        // Store installation ID in localStorage
        // This marks the user as authenticated with the shared app
        localStorage.setItem('shared_app_installation_id', installationId)
        localStorage.setItem('auth_method', 'shared-app')

        // Clear any existing self-hosted GitHub App credentials
        localStorage.removeItem('github_app_id')
        localStorage.removeItem('github_app_private_key')
        localStorage.removeItem('github_app_installation_id')

        logger.info('[SharedAppAuth] Installation ID stored successfully')

        setStatus('success')

        // Redirect to dashboard after a short delay
        // Use window.location.href for full page reload to ensure useAuth re-checks localStorage
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)

      } catch (err) {
        logger.error('[SharedAppAuth] Callback handling failed:', err)
        setError(err.message)
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  if (status === 'processing') {
    return (
      <div
        className="d-flex flex-column flex-items-center flex-justify-center"
        style={{ minHeight: '100vh', background: 'var(--bgColor-default)' }}
      >
        <Spinner size="large" />
        <p className="color-fg-muted mt-3">Completing GitHub App installation...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div
        className="d-flex flex-column flex-items-center flex-justify-center"
        style={{ minHeight: '100vh', background: 'var(--bgColor-default)', padding: '24px' }}
      >
        <div style={{ maxWidth: '480px', width: '100%' }}>
          <Flash variant="success">
            <div className="d-flex flex-items-center">
              <CheckIcon size={20} style={{ marginRight: '12px' }} />
              <div>
                <strong>Installation successful!</strong>
                <p className="mb-0 mt-1">Redirecting to dashboard...</p>
              </div>
            </div>
          </Flash>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        className="d-flex flex-column flex-items-center flex-justify-center"
        style={{ minHeight: '100vh', background: 'var(--bgColor-default)', padding: '24px' }}
      >
        <div style={{ maxWidth: '480px', width: '100%' }}>
          <Flash variant="danger">
            <div className="d-flex flex-items-start">
              <XIcon size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
              <div>
                <strong>Installation failed</strong>
                <p className="mb-2 mt-1">{error}</p>
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="btn btn-sm"
                >
                  Return to dashboard
                </button>
              </div>
            </div>
          </Flash>
        </div>
      </div>
    )
  }

  return null
}
