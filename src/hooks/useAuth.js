import { useState, useEffect } from 'react'
import {
  isGitHubAppConfigured,
  getGitHubAppToken,
  saveGitHubAppCredentials,
  clearGitHubAppAuth,
  validateGitHubAppCredentials,
  getAppInstallationInfo
} from '../services/githubAppAuth'

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

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isGitHubAppConfigured()) {
        setAuthMethod('github-app')
        try {
          const info = await getAppInstallationInfo()
          setAppInfo(info)
        } catch (err) {
          console.error('Failed to get app info:', err)
        }
      } else if (localStorage.getItem('github_token')) {
        setGithubToken(localStorage.getItem('github_token'))
        setAuthMethod('pat')
      } else if (localStorage.getItem('demo_mode') === 'true') {
        setAuthMethod('demo')
      } else {
        setShowAuthSetup(true)
      }
    }
    checkAuth()
  }, [])

  const getActiveToken = async () => {
    if (authMethod === 'github-app') {
      return await getGitHubAppToken()
    }
    return githubToken
  }

  const saveToken = () => {
    localStorage.setItem('github_token', githubToken)
    setAuthMethod('pat')
    setShowAuthSetup(false)
  }

  const clearToken = () => {
    localStorage.removeItem('github_token')
    setGithubToken('')
    setAuthMethod('none')
    setShowAuthSetup(true)
  }

  const handleLogout = () => {
    if (authMethod === 'github-app') {
      clearGitHubAppAuth()
      setAppInfo(null)
    } else if (authMethod === 'demo') {
      localStorage.removeItem('demo_mode')
    } else {
      localStorage.removeItem('github_token')
    }
    setGithubToken('')
    setAuthMethod('none')
    setShowAuthSetup(true)
  }
  
  const handleDemoMode = () => {
    localStorage.setItem('demo_mode', 'true')
    setAuthMethod('demo')
    setShowAuthSetup(false)
  }

  const handleGitHubAppSetup = async () => {
    setAppFormError('')
    
    if (!appId || !privateKey || !installationId) {
      setAppFormError('All fields are required')
      return
    }

    try {
      const result = await validateGitHubAppCredentials(appId, privateKey, installationId)
      
      if (!result.valid) {
        setAppFormError(`Validation failed: ${result.error}`)
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
    
    // Setters
    setGithubToken,
    setShowGitHubAppForm,
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
