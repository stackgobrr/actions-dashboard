import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard/Dashboard'
import { AuthSetup } from './components/Auth/AuthSetup'
import { Settings } from './components/Settings/Settings'
import { useGitHubStatus } from './hooks/useGitHubStatus'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { REPOSITORIES } from './constants'

function App() {
  const [sortBy, setSortBy] = useState('last-run-desc')
  const [theme, setTheme] = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10)
  const [showGuide, setShowGuide] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedRepos, setSelectedRepos] = useState(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem('selectedRepos')
    if (saved) {
      return JSON.parse(saved)
    }
    // Convert REPOSITORIES constant to the new format
    return [
      ...REPOSITORIES.common.map(r => ({ ...r, category: 'common' })),
      ...REPOSITORIES.modules.map(r => ({ ...r, category: 'modules' })),
      ...REPOSITORIES.infra.map(r => ({ ...r, category: 'infra' })),
      ...REPOSITORIES.services.map(r => ({ ...r, category: 'services' })),
      ...REPOSITORIES.utils.map(r => ({ ...r, category: 'utils' }))
    ]
  })

  const auth = useAuth()
  
  // Convert selectedRepos to REPOSITORIES format for hook - memoized to prevent re-renders
  const reposForHook = useMemo(() => ({
    common: selectedRepos.filter(r => r.category === 'common'),
    modules: selectedRepos.filter(r => r.category === 'modules'),
    infra: selectedRepos.filter(r => r.category === 'infra'),
    services: selectedRepos.filter(r => r.category === 'services'),
    utils: selectedRepos.filter(r => r.category === 'utils'),
    custom: selectedRepos.filter(r => r.category === 'custom')
  }), [selectedRepos])
  
  const { repoStatuses, loading, lastUpdate, fetchAllStatuses } = useGitHubStatus(
    reposForHook,
    auth.getActiveToken,
    auth.authMethod,
    auth.showAuthSetup,
    autoRefresh,
    refreshInterval
  )

  const handleSaveRepos = (repos) => {
    setSelectedRepos(repos)
    localStorage.setItem('selectedRepos', JSON.stringify(repos))
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
  }, [theme, loading, fetchAllStatuses, setTheme])

  if (auth.showAuthSetup) {
    return (
      <AuthSetup
        showGuide={showGuide}
        setShowGuide={setShowGuide}
        showGitHubAppForm={auth.showGitHubAppForm}
        setShowGitHubAppForm={auth.setShowGitHubAppForm}
        githubToken={auth.githubToken}
        setGithubToken={auth.setGithubToken}
        saveToken={auth.saveToken}
        appId={auth.appId}
        setAppId={auth.setAppId}
        installationId={auth.installationId}
        setInstallationId={auth.setInstallationId}
        privateKey={auth.privateKey}
        setPrivateKey={auth.setPrivateKey}
        appFormError={auth.appFormError}
        handleGitHubAppSetup={auth.handleGitHubAppSetup}
      />
    )
  }

  return (
    <>
      <Dashboard
        repoStatuses={repoStatuses}
        loading={loading}
        lastUpdate={lastUpdate}
        fetchAllStatuses={fetchAllStatuses}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        authMethod={auth.authMethod}
        appInfo={auth.appInfo}
        handleLogout={auth.handleLogout}
        clearToken={auth.clearToken}
        theme={theme}
        setTheme={setTheme}
        sortBy={sortBy}
        setSortBy={setSortBy}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onOpenSettings={() => setShowSettings(true)}
      />
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          getActiveToken={auth.getActiveToken}
          selectedRepos={selectedRepos}
          onSaveRepos={handleSaveRepos}
        />
      )}
    </>
  )
}

export default App
