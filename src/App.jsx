import { useState, useEffect, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import { Dashboard } from './components/Dashboard/Dashboard'
import { AuthSetup } from './components/Auth/AuthSetup'
import { Settings } from './components/Settings/Settings'
import { HotkeyHelper } from './components/UI/HotkeyHelper'
import { LandingPage } from './components/LandingPage/LandingPage'
import { Roadmap } from './components/Roadmap/Roadmap'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { Analytics } from './components/Analytics/Analytics'
import { useGitHubStatus } from './hooks/useGitHubStatus'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { REPOSITORIES } from './constants'
import { logger } from './utils/logger'
import { DEFAULT_REFRESH_INTERVAL } from './constants/timing'

function App() {
  // Check if user has any auth credentials - if so, skip landing page
  const hasAuth = () => {
    return !!(
      localStorage.getItem('github_token') ||
      localStorage.getItem('github_app_id') ||
      localStorage.getItem('demo_mode')
    )
  }

  const [showLanding, setShowLanding] = useState(!hasAuth())
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [sortBy, setSortBy] = useState('last-run-desc')
  const [theme, setTheme] = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHotkeyHelper, setShowHotkeyHelper] = useState(false)
  const [filterByLabels, setFilterByLabels] = useState([])
  const [hasInitialAuth, setHasInitialAuth] = useState(hasAuth()) // Track if we had auth on mount
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
  const [authInitialized, setAuthInitialized] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('[App Debug]', {
      showLanding,
      authMethod: auth.authMethod,
      showAuthSetup: auth.showAuthSetup,
      hasInitialAuth,
      authInitialized
    })
  }, [showLanding, auth.authMethod, auth.showAuthSetup, hasInitialAuth, authInitialized])

  // Track when auth has finished initializing
  useEffect(() => {
    if (auth.authMethod !== 'none' || !hasInitialAuth) {
      setAuthInitialized(true)
    }
  }, [auth.authMethod, hasInitialAuth])

  // Sync landing page visibility with auth state
  useEffect(() => {
    if (auth.showAuthSetup) {
      // When auth setup is requested, hide landing page to show auth setup
      setShowLanding(false)
    } else if (auth.authMethod === 'none') {
      // No auth and no setup requested - show landing page
      setShowLanding(true)
    } else {
      // Has auth - hide landing page
      setShowLanding(false)
    }
  }, [auth.authMethod, auth.showAuthSetup])
  
  // Convert selectedRepos to REPOSITORIES format for hook - memoized to prevent re-renders
  const reposForHook = useMemo(() => 
    ['common', 'modules', 'infra', 'services', 'utils', 'custom']
      .reduce((acc, category) => ({
        ...acc,
        [category]: selectedRepos.filter(r => r.category === category)
      }), {})
  , [selectedRepos])
  
  const { repoStatuses, loading, lastUpdate, fetchAllStatuses, isDemoMode, toggleDemoMode, canToggleDemoMode } = useGitHubStatus(
    reposForHook,
    auth.getActiveToken,
    auth.authMethod,
    auth.showAuthSetup,
    autoRefresh,
    DEFAULT_REFRESH_INTERVAL
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

  return (
    <Routes>
      {/* Main app route */}
      <Route path="*" element={
        <>
          <Analytics />
          {showRoadmap ? (
            <Roadmap
              onBack={() => {
                setShowRoadmap(false)
                setShowLanding(true)
              }}
              theme={theme}
              setTheme={setTheme}
            />
          ) : showLanding ? (
            /* Show landing page first */
            <LandingPage
              onGetStarted={handleGetStarted}
              onViewRoadmap={() => {
                setShowLanding(false)
                setShowRoadmap(true)
              }}
              onViewDemo={auth.handleDemoMode}
              theme={theme}
              setTheme={setTheme}
            />
          ) : auth.showAuthSetup ? (
            /* Show auth setup */
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
          ) : (
            /* Show dashboard */
            <ErrorBoundary>
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
                    authMethod={auth.authMethod}
                    selectedRepos={selectedRepos}
                    onSaveRepos={handleSaveRepos}
                  />
                )}
                <HotkeyHelper
                  isOpen={showHotkeyHelper}
                  onClose={() => setShowHotkeyHelper(false)}
                />
              </div>
            </ErrorBoundary>
          )}
        </>
      } />
    </Routes>
  )
}

export default App
