import { useState, useEffect } from 'react'
import {
  isGitHubAppConfigured,
  getGitHubAppToken,
  saveGitHubAppCredentials,
  clearGitHubAppAuth,
  validateGitHubAppCredentials,
  getAppInstallationInfo
} from '../services/githubAppAuth'
import { logger } from '../utils/logger'

/**
 * Hook to manage authentication state for both GitHub App and PAT methods
 * @returns {Object} Authentication state and methods
 */
export function useAuth() {
  const [authMethod, setAuthMethod] = useState('none')
  const [githubToken, setGithubToken] = useState('')
  const [showAuthSetup, setShowAuthSetup] = useState(false)
  const [appInfo, setAppInfo] = useState(null)

  // GitHub App setup form state
  const [showGitHubAppForm, setShowGitHubAppForm] = useState(false)
  const [appId, setAppId] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [installationId, setInstallationId] = useState('')
  const [appFormError, setAppFormError] = useState('')
  const [patError, setPatError] = useState('')
  const [isValidatingPat, setIsValidatingPat] = useState(false)
  const [isValidatingGitHubApp, setIsValidatingGitHubApp] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check localStorage for auth method marker (set by OAuth callback)
      const authMethod = localStorage.getItem('auth_method')
      
      if (authMethod === 'oauth' && localStorage.getItem('github_token')) {
        setGithubToken(localStorage.getItem('github_token'))
        setAuthMethod('oauth')
      } else if (isGitHubAppConfigured()) {
        setAuthMethod('github-app')
        try {
          const info = await getAppInstallationInfo()
          setAppInfo(info)
        } catch (err) {
          logger.error('Failed to get app info:', err)
        }
      } else if (localStorage.getItem('github_token')) {
        setGithubToken(localStorage.getItem('github_token'))
        setAuthMethod('pat')
      } else if (localStorage.getItem('demo_mode') === 'true') {
        setAuthMethod('demo')
      }
      // If no auth is found, don't set showAuthSetup - let the landing page show
    }
    checkAuth()
  }, [])

  /**
   * Gets the currently active authentication token
   * @returns {string|null} The active token (PAT, OAuth, or GitHub App token) or null if none exists
   */
  const getActiveToken = () => {
    if (authMethod === 'github-app') {
      return getGitHubAppToken()
    }
    return githubToken
  }

  /**
   * Validates and saves a Personal Access Token
   * Tests the token by making an API call to GitHub before storing it
   * @async
   * @throws {Error} When network request fails
   * @returns {Promise<void>}
   */
  const saveToken = async () => {
    setPatError('')
    setIsValidatingPat(true)
    
    try {
      // Test the token by making a simple API call to GitHub
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setPatError('Invalid token: Authentication failed. Please check your token and try again.')
        } else if (response.status === 403) {
          setPatError('Token lacks required permissions. Ensure your token has "repo" scope.')
        } else {
          setPatError(`Token validation failed: ${response.statusText}`)
        }
        setIsValidatingPat(false)
        return
      }

      // Token is valid
      localStorage.setItem('github_token', githubToken)
      setAuthMethod('pat')
      setShowAuthSetup(false)
      setPatError('')
    } catch (err) {
      setPatError(`Network error: ${err.message}. Please check your connection and try again.`)
    } finally {
      setIsValidatingPat(false)
    }
  }

  /**
   * Clears the stored PAT and resets authentication state
   */
  const clearToken = () => {
    // Clear all possible auth tokens
    localStorage.removeItem('github_token')
    localStorage.removeItem('auth_method')
    localStorage.removeItem('github_app_id')
    localStorage.removeItem('github_app_private_key')
    localStorage.removeItem('github_app_installation_id')
    localStorage.removeItem('demo_mode')
    setGithubToken('')
    setAuthMethod('none')
    setAppInfo(null)
    setShowAuthSetup(true)
  }

  /**
   * Handles logout for all authentication methods
   * Clears all credentials and returns to landing page
   */
  const handleLogout = () => {
    // Clear all possible auth tokens
    localStorage.removeItem('github_token')
    localStorage.removeItem('auth_method')
    localStorage.removeItem('github_app_id')
    localStorage.removeItem('github_app_private_key')
    localStorage.removeItem('github_app_installation_id')
    localStorage.removeItem('demo_mode')
    setGithubToken('')
    setAuthMethod('none')
    setAppInfo(null)
    setShowAuthSetup(true)
  }
  
  const handleDemoMode = () => {
    localStorage.setItem('demo_mode', 'true')
    setAuthMethod('demo')
    setShowAuthSetup(false) // Hide auth setup to show dashboard
  }

  /**
   * Validates and saves GitHub App credentials
   * Tests the credentials by generating a token before storing
   * @async
   * @returns {Promise<void>}
   */
  const handleGitHubAppSetup = async () => {
    setAppFormError('')
    setIsValidatingGitHubApp(true)
    
    if (!appId || !privateKey || !installationId) {
      setAppFormError('All fields are required')
      setIsValidatingGitHubApp(false)
      return
    }

    try {
      const result = await validateGitHubAppCredentials(appId, privateKey, installationId)
      
      if (!result.valid) {
        setAppFormError(`Validation failed: ${result.error}`)
        setIsValidatingGitHubApp(false)
        return
      }

      saveGitHubAppCredentials(appId, privateKey, installationId)
      setAuthMethod('github-app')
      setShowGitHubAppForm(false)
      setShowAuthSetup(false)
      
      // Get app info
      const info = await getAppInstallationInfo()
      setAppInfo(info)
      
      // Clear form
      setAppId('')
      setPrivateKey('')
      setInstallationId('')
    } catch (err) {
      setAppFormError(`Setup failed: ${err.message}`)
    } finally {
      setIsValidatingGitHubApp(false)
    }
  }

  return {
    // State
    authMethod,
    githubToken,
    showAuthSetup,
    appInfo,
    showGitHubAppForm,
    appId,
    privateKey,
    installationId,
    appFormError,
    patError,
    isValidatingPat,
    isValidatingGitHubApp,
    
    // Setters
    setGithubToken,
    setShowGitHubAppForm,
    setShowAuthSetup,
    setAppId,
    setPrivateKey,
    setInstallationId,
    
    // Methods
    getActiveToken,
    saveToken,
    clearToken,
    handleLogout,
    handleGitHubAppSetup,
    handleDemoMode
  }
}
