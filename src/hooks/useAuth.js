import { useState, useEffect, useCallback } from 'react'
import {
  isGitHubAppConfigured,
  getGitHubAppToken,
  saveGitHubAppCredentials,
  clearGitHubAppAuth,
  validateGitHubAppCredentials,
  getAppInstallationInfo
} from '../services/githubAppAuth'
import { logger } from '../utils/logger'
import { trackEvent } from '../utils/analytics'

/**
 * Hook to manage authentication state for PAT, GitHub App, OAuth (cookie session),
 * and demo modes.
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
      // Try OAuth session cookie first — probe /api/profile (lightweight check)
      // A 200 means the session cookie is valid; 401 means no active session.
      try {
        const res = await fetch('/api/profile', { credentials: 'include' })
        if (res.ok) {
          setAuthMethod('oauth')
          trackEvent('Dashboard Opened', { authMethod: 'oauth' })
          return
        }
      } catch {
        // Network error — fall through to legacy checks
      }

      // Legacy: PAT stored in localStorage (pre-cookie era)
      if (isGitHubAppConfigured()) {
        setAuthMethod('github-app')
        try {
          const info = await getAppInstallationInfo()
          setAppInfo(info)
        } catch (err) {
          logger.error('Failed to get app info:', err)
        }
        return
      }

      if (localStorage.getItem('github_token')) {
        setGithubToken(localStorage.getItem('github_token'))
        const method = localStorage.getItem('auth_method') === 'oauth' ? 'oauth' : 'pat'
        setAuthMethod(method)
        trackEvent('Dashboard Opened', { authMethod: method })
        return
      }

      if (localStorage.getItem('demo_mode') === 'true') {
        setAuthMethod('demo')
        return
      }

      // No auth found — landing page will show
    }
    checkAuth()
  }, [])

  /**
   * Gets the currently active authentication token.
   * For OAuth session-cookie auth, returns null — the cookie is sent automatically
   * by the browser for /api/* calls and GitHub API calls use the token stored
   * server-side; PAT/GitHub-App flows still return the token directly.
   * @returns {Promise<string|null>}
   */
  const getActiveToken = useCallback(async () => {
    if (authMethod === 'github-app') {
      return getGitHubAppToken()
    }
    if (authMethod === 'oauth' && !githubToken) {
      // Fetch the GitHub token from the profile API for direct GitHub API calls
      try {
        const res = await fetch('/api/profile', { credentials: 'include' })
        if (res.ok) {
          const profile = await res.json()
          return profile.github_token || null
        }
      } catch {
        return null
      }
    }
    return githubToken || null
  }, [authMethod, githubToken])

  /**
   * Validates and saves a Personal Access Token.
   */
  const saveToken = async () => {
    setPatError('')
    setIsValidatingPat(true)
    
    try {
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

      trackEvent('Dashboard Opened', { authMethod: 'pat' })
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
   * Clears the stored PAT and resets authentication state.
   */
  const clearToken = () => {
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
   * Handles logout for all authentication methods.
   */
  const handleLogout = () => {
    trackEvent('User Signed Out', { authMethod })
    
    // Clear localStorage (legacy PAT/GitHub-App storage)
    localStorage.removeItem('github_token')
    localStorage.removeItem('auth_method')
    localStorage.removeItem('github_app_id')
    localStorage.removeItem('github_app_private_key')
    localStorage.removeItem('github_app_installation_id')
    localStorage.removeItem('demo_mode')
    localStorage.removeItem('profile_cache')
    localStorage.removeItem('profile_cache_version')

    // For OAuth cookie sessions, the cookie will expire naturally (httpOnly, so we
    // cannot clear it from JS). A server-side logout endpoint can be added later.
    setGithubToken('')
    setAuthMethod('none')
    setAppInfo(null)
    setShowAuthSetup(true)
  }
  
  const handleDemoMode = () => {
    trackEvent('Demo Mode Started')
    localStorage.setItem('demo_mode', 'true')
    setAuthMethod('demo')
    setShowAuthSetup(false)
  }

  /**
   * Validates and saves GitHub App credentials.
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
      trackEvent('Dashboard Opened', { authMethod: 'github-app' })
      setAuthMethod('github-app')
      setShowGitHubAppForm(false)
      setShowAuthSetup(false)
      
      const info = await getAppInstallationInfo()
      setAppInfo(info)
      
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
