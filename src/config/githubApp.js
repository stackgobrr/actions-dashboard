/**
 * Shared GitHub App Configuration
 * This is a pre-created GitHub App that users can install to their accounts
 */

// GitHub App slug (will be provided after you create the GitHub App)
// Format: https://github.com/apps/{APP_SLUG}
export const GITHUB_APP_SLUG = import.meta.env.VITE_APP_SLUG || ''

// GitHub App install URL
export const GITHUB_APP_INSTALL_URL = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`

// OAuth callback URL (must be registered in GitHub App settings)
// GitHub App installations redirect to the root URL with query params
export const GITHUB_APP_CALLBACK_URL = window.location.origin

/**
 * Check if shared GitHub App is configured
 */
export function isSharedAppConfigured() {
  return GITHUB_APP_SLUG && GITHUB_APP_SLUG.length > 0
}

/**
 * Build the installation URL with optional state parameter
 */
export function buildInstallUrl(state = null) {
  const url = new URL(GITHUB_APP_INSTALL_URL)
  if (state) {
    url.searchParams.set('state', state)
  }
  return url.toString()
}
