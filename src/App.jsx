import { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  Minimize
} from 'lucide-react'
import './App.css'
import GitHubAppGuide from './components/GitHubAppGuide'
import { StatusCard } from './components/StatusCard'
import { DashboardHeader } from './components/DashboardHeader'
import { AuthSetup } from './components/AuthSetup'
import { useGitHubStatus } from './hooks/useGitHubStatus'
import { useTheme } from './hooks/useTheme'
import { REPOSITORIES } from './constants'
import { getOptimalColumns, sortRepositories } from './utils/gridHelpers'
import {
  isGitHubAppConfigured,
  getGitHubAppToken,
  saveGitHubAppCredentials,
  clearGitHubAppAuth,
  validateGitHubAppCredentials,
  getAppInstallationInfo
} from './services/githubAppAuth'

function App() {
  const [showAuthSetup, setShowAuthSetup] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [sortBy, setSortBy] = useState('last-run-desc')
  const [theme, setTheme] = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [authMethod, setAuthMethod] = useState('none')
  const [appInfo, setAppInfo] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10)
  
  // GitHub App setup form state
  const [showGitHubAppForm, setShowGitHubAppForm] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [appId, setAppId] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [installationId, setInstallationId] = useState('')
  const [appFormError, setAppFormError] = useState('')

  const getActiveToken = async () => {
    if (authMethod === 'github-app') {
      return await getGitHubAppToken()
    }
    return githubToken
  }

  const { repoStatuses, loading, lastUpdate, fetchAllStatuses } = useGitHubStatus(
    REPOSITORIES,
    getActiveToken,
    authMethod,
    showAuthSetup,
    autoRefresh,
    refreshInterval
  )

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
      } else {
        setShowAuthSetup(true)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    if (authMethod === 'github-app') {
      clearGitHubAppAuth()
      setAppInfo(null)
    } else {
      localStorage.removeItem('github_token')
    }
    setGithubToken('')
    setAuthMethod('none')
    setShowAuthSetup(true)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return
      }

      switch(e.key.toLowerCase()) {
        case 't':
          // Toggle between light and dark themes
          const nextTheme = theme === 'dark' ? 'light' : 'dark'
          setTheme(nextTheme)
          break
        case 'r':
          // Refresh
          if (!loading) {
            fetchAllStatuses()
          }
          break
        case 'f':
          // Toggle fullscreen
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keypress', handleKeyPress)
    return () => document.removeEventListener('keypress', handleKeyPress)
  }, [theme, loading])

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

  if (showAuthSetup) {
    return (
      <AuthSetup
        showGuide={showGuide}
        setShowGuide={setShowGuide}
        showGitHubAppForm={showGitHubAppForm}
        setShowGitHubAppForm={setShowGitHubAppForm}
        githubToken={githubToken}
        setGithubToken={setGithubToken}
        saveToken={saveToken}
        appId={appId}
        setAppId={setAppId}
        installationId={installationId}
        setInstallationId={setInstallationId}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        appFormError={appFormError}
        handleGitHubAppSetup={handleGitHubAppSetup}
      />
    )
  }

  return (
    <div className="p-4" style={{
      height: '100%', 
      maxWidth: isFullscreen ? 'none' : '1600px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {!isFullscreen && (
        <DashboardHeader
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          authMethod={authMethod}
          appInfo={appInfo}
          handleLogout={handleLogout}
          clearToken={clearToken}
          theme={theme}
          setTheme={setTheme}
          sortBy={sortBy}
          setSortBy={setSortBy}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          lastUpdate={lastUpdate}
          fetchAllStatuses={fetchAllStatuses}
          loading={loading}
        />
      )}

      {loading && Object.keys(repoStatuses).length === 0 ? (
        <div className="text-center p-6 color-fg-muted">
          <div className="mb-2">Loading repository statuses...</div>
        </div>
      ) : (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${getOptimalColumns(Object.keys(repoStatuses).length, isFullscreen)}, 1fr)`,
            gridAutoRows: '1fr',
            gap: '16px',
            height: '100%',
            alignContent: 'stretch'
          }}>
          {sortRepositories(repoStatuses, sortBy).map(([repoName, status]) => (
            <StatusCard key={repoName} repoName={repoName} status={status} />
          ))}
          </div>
        </div>
      )}
      
      {isFullscreen && (
        <button 
          onClick={toggleFullscreen} 
          className="btn btn-sm position-fixed top-0 right-0 m-3" 
          title="Exit Fullscreen"
          style={{zIndex: 1000}}
        >
          <Minimize size={16} />
        </button>
      )}
    </div>
  )
}

export default App
