import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { logger } from '../utils/logger'

const GITHUB_APP_ID_KEY = 'github_app_id'
const GITHUB_APP_PRIVATE_KEY_KEY = 'github_app_private_key'
const GITHUB_APP_INSTALLATION_ID_KEY = 'github_app_installation_id'
const GITHUB_APP_TOKEN_KEY = 'github_app_token'
const GITHUB_APP_TOKEN_EXPIRY_KEY = 'github_app_token_expiry'

// Store GitHub App credentials
export const saveGitHubAppCredentials = (appId, privateKey, installationId) => {
  // Ensure private key has proper formatting
  const formattedKey = privateKey.trim()
  
  localStorage.setItem(GITHUB_APP_ID_KEY, appId)
  localStorage.setItem(GITHUB_APP_PRIVATE_KEY_KEY, formattedKey)
  localStorage.setItem(GITHUB_APP_INSTALLATION_ID_KEY, installationId)
}

// Get stored credentials
export const getGitHubAppCredentials = () => {
  return {
    appId: localStorage.getItem(GITHUB_APP_ID_KEY),
    privateKey: localStorage.getItem(GITHUB_APP_PRIVATE_KEY_KEY),
    installationId: localStorage.getItem(GITHUB_APP_INSTALLATION_ID_KEY)
  }
}

// Check if GitHub App is configured
export const isGitHubAppConfigured = () => {
  const { appId, privateKey, installationId } = getGitHubAppCredentials()
  return !!(appId && privateKey && installationId)
}

// Generate installation access token
export const generateInstallationToken = async () => {
  const { appId, privateKey, installationId } = getGitHubAppCredentials()
  
  if (!appId || !privateKey || !installationId) {
    throw new Error('GitHub App not configured')
  }

  try {
    // Validate the private key format
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid private key format. Make sure you converted the key to PKCS#8 format (BEGIN PRIVATE KEY, not BEGIN RSA PRIVATE KEY)')
    }

    const auth = createAppAuth({
      appId: parseInt(appId),
      privateKey: privateKey.trim(),
      installationId: parseInt(installationId)
    })

    const { token } = await auth({ type: 'installation' })
    
    // Store token with expiry (tokens last 1 hour)
    const expiryTime = Date.now() + (55 * 60 * 1000) // 55 minutes (5 min buffer)
    localStorage.setItem(GITHUB_APP_TOKEN_KEY, token)
    localStorage.setItem(GITHUB_APP_TOKEN_EXPIRY_KEY, expiryTime.toString())
    
    return token
  } catch (error) {
    logger.error('Failed to generate installation token:', error)
    
    // Provide more helpful error messages
    if (error.message.includes('PKCS#1')) {
      throw new Error('Private key must be in PKCS#8 format. Please convert your key using the setup guide instructions.')
    } else if (error.message.includes('JSON web token')) {
      throw new Error('Failed to create JWT token. Check that your App ID, Installation ID, and Private Key are correct.')
    }
    
    throw new Error(`Failed to authenticate with GitHub App: ${error.message}`)
  }
}

// Get valid token (refresh if expired)
export const getGitHubAppToken = async () => {
  const token = localStorage.getItem(GITHUB_APP_TOKEN_KEY)
  const expiry = localStorage.getItem(GITHUB_APP_TOKEN_EXPIRY_KEY)
  
  // If token exists and not expired, return it
  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token
  }
  
  // Otherwise generate new token
  return await generateInstallationToken()
}

// Clear GitHub App data
export const clearGitHubAppAuth = () => {
  localStorage.removeItem(GITHUB_APP_ID_KEY)
  localStorage.removeItem(GITHUB_APP_PRIVATE_KEY_KEY)
  localStorage.removeItem(GITHUB_APP_INSTALLATION_ID_KEY)
  localStorage.removeItem(GITHUB_APP_TOKEN_KEY)
  localStorage.removeItem(GITHUB_APP_TOKEN_EXPIRY_KEY)
}

// Validate GitHub App credentials
export const validateGitHubAppCredentials = async (appId, privateKey, installationId) => {
  try {
    const auth = createAppAuth({
      appId: parseInt(appId),
      privateKey: privateKey,
      installationId: parseInt(installationId)
    })

    const { token } = await auth({ type: 'installation' })
    
    // Test the token by making a simple API call
    const octokit = new Octokit({ auth: token })
    await octokit.rest.apps.getAuthenticated()
    
    return { valid: true, token }
  } catch (error) {
    logger.error('GitHub App validation failed:', error)
    return { valid: false, error: error.message }
  }
}

// Get app installation info
export const getAppInstallationInfo = async () => {
  try {
    const token = await getGitHubAppToken()
    const octokit = new Octokit({ auth: token })
    
    const { data: app } = await octokit.rest.apps.getAuthenticated()
    const { data: installation } = await octokit.rest.apps.getInstallation({
      installation_id: parseInt(getGitHubAppCredentials().installationId)
    })
    
    return {
      appName: app.name,
      appSlug: app.slug,
      account: installation.account.login,
      accountType: installation.account.type
    }
  } catch (error) {
    logger.error('Failed to get installation info:', error)
    return null
  }
}
