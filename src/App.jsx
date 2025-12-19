import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard/Dashboard'
import { AuthSetup } from './components/Auth/AuthSetup'
import { Settings } from './components/Settings/Settings'
import { HotkeyHelper } from './components/UI/HotkeyHelper'
import { LandingPage } from './components/LandingPage/LandingPage'
import { useGitHubStatus } from './hooks/useGitHubStatus'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { REPOSITORIES } from './constants'
import { logger } from './utils/logger'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [sortBy, setSortBy] = useState('last-run-desc')
  const [theme, setTheme] = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10)
  const [showGuide, setShowGuide] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHotkeyHelper, setShowHotkeyHelper] = useState(false)
  const [filterByLabels, setFilterByLabels] = useState([])
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

  // Check if user is already authenticated on mount - wait for auth to initialize
  useEffect(() => {
    // Only hide landing if we have a definite auth method (not 'none')
    // This prevents flickering when auth is still initializing
    if (auth.authMethod !== 'none' && !auth.showAuthSetup) {
      setShowLanding(false)
    }
  }, [auth.authMethod, auth.showAuthSetup])

  // Watch for logout - show landing page when user logs out
  useEffect(() => {
    if (auth.authMethod === 'none' && !auth.showAuthSetup) {
      setShowLanding(true)
    }
  }, [auth.authMethod, auth.showAuthSetup])
  
  // Convert selectedRepos to REPOSITORIES format for hook - memoized to prevent re-renders
  const reposForHook = useMemo(() => ({
    common: selectedRepos.filter(r => r.category === 'common'),
    modules: selectedRepos.filter(r => r.category === 'modules'),
    infra: selectedRepos.filter(r => r.category === 'infra'),
    services: selectedRepos.filter(r => r.category === 'services'),
    utils: selectedRepos.filter(r => r.category === 'utils'),
    custom: selectedRepos.filter(r => r.category === 'custom')
  }), [selectedRepos])
  
  const { repoStatuses, loading, lastUpdate, fetchAllStatuses, isDemoMode, toggleDemoMode, canToggleDemoMode } = useGitHubStatus(
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

  const handleGetStarted = () => {
    setShowLanding(false)
    // If no auth is configured, show auth setup
    if (auth.authMethod === 'none') {
      auth.setShowAuthSetup(true)
    }
    // If already authenticated (PAT, GitHub App, or demo), go straight to dashboard
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        logger.error('Error attempting to enable fullscreen:', err)
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
        case 'h':
          // Toggle hotkey helper
          setShowHotkeyHelper(prev => !prev)
          break
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
        case 's':
          // Open settings
          setShowSettings(true)
          break
      }
    }

    document.addEventListener('keypress', handleKeyPress)
    return () => document.removeEventListener('keypress', handleKeyPress)
  }, [theme, loading, fetchAllStatuses, setTheme])

  // Show landing page first
  if (showLanding) {
    return <LandingPage 
      onGetStarted={handleGetStarted} 
      theme={theme} 
      setTheme={setTheme} 
    />
  }

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
        handleDemoMode={auth.handleDemoMode}
        handleLogout={auth.handleLogout}
        authMethod={auth.authMethod}
        patError={auth.patError}
        isValidatingPat={auth.isValidatingPat}
        isValidatingGitHubApp={auth.isValidatingGitHubApp}
      />
    )
  }

  return (
    <div className="dashboard-mode">
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
        filterByLabels={filterByLabels}
        setFilterByLabels={setFilterByLabels}
        isDemoMode={isDemoMode}
        toggleDemoMode={toggleDemoMode}
        canToggleDemoMode={canToggleDemoMode}
        onToggleHotkeyHelper={() => setShowHotkeyHelper(prev => !prev)}
      />
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          getActiveToken={auth.getActiveToken}
          selectedRepos={selectedRepos}
          onSaveRepos={handleSaveRepos}
        />
      )}
      <HotkeyHelper 
        isOpen={showHotkeyHelper} 
        onClose={() => setShowHotkeyHelper(false)} 
      />
    </div>
  )
}

export default App
