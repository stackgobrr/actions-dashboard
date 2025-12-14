import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardHeader } from './DashboardHeader'

describe('DashboardHeader Component', () => {
  const defaultProps = {
    isFullscreen: false,
    toggleFullscreen: vi.fn(),
    authMethod: 'none',
    appInfo: null,
    handleLogout: vi.fn(),
    clearToken: vi.fn(),
    theme: 'dark',
    setTheme: vi.fn(),
    sortBy: 'last-run-desc',
    setSortBy: vi.fn(),
    autoRefresh: true,
    setAutoRefresh: vi.fn(),
    refreshInterval: 10,
    setRefreshInterval: vi.fn(),
    lastUpdate: new Date('2025-12-14T11:30:00'),
    fetchAllStatuses: vi.fn(),
    loading: false
  }

  describe('Basic Rendering', () => {
    it('renders dashboard title', () => {
      render(<DashboardHeader {...defaultProps} />)
      expect(screen.getByText('Actions Dashboard')).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<DashboardHeader {...defaultProps} />)
      expect(screen.getByText('Real-time GitHub Actions status for all repositories')).toBeInTheDocument()
    })

    it('renders refresh button', () => {
      render(<DashboardHeader {...defaultProps} />)
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })
  })

  describe('Fullscreen Toggle', () => {
    it('shows Maximize button when not fullscreen', () => {
      render(<DashboardHeader {...defaultProps} isFullscreen={false} />)
      const button = screen.getByLabelText('Fullscreen')
      expect(button).toBeInTheDocument()
    })

    it('shows Minimize button when fullscreen', () => {
      render(<DashboardHeader {...defaultProps} isFullscreen={true} />)
      const button = screen.getByLabelText('Exit Fullscreen')
      expect(button).toBeInTheDocument()
    })

    it('calls toggleFullscreen when clicked', async () => {
      const user = userEvent.setup()
      const toggleFullscreen = vi.fn()
      render(<DashboardHeader {...defaultProps} toggleFullscreen={toggleFullscreen} />)
      
      await user.click(screen.getByLabelText('Fullscreen'))
      expect(toggleFullscreen).toHaveBeenCalledOnce()
    })
  })

  describe('Authentication Display', () => {
    it('shows GitHub App info when authenticated with app', () => {
      const appInfo = { appName: 'My GitHub App', account: 'h3ow3d' }
      render(<DashboardHeader {...defaultProps} authMethod="github-app" appInfo={appInfo} />)
      
      expect(screen.getByText('My GitHub App (h3ow3d)')).toBeInTheDocument()
    })

    it('shows logout button for GitHub App', async () => {
      const user = userEvent.setup()
      const handleLogout = vi.fn()
      const appInfo = { appName: 'My App', account: 'user' }
      
      render(<DashboardHeader {...defaultProps} authMethod="github-app" appInfo={appInfo} handleLogout={handleLogout} />)
      
      const logoutBtn = screen.getByLabelText('Sign out')
      await user.click(logoutBtn)
      expect(handleLogout).toHaveBeenCalledOnce()
    })

    it('shows Clear Token button for PAT auth', () => {
      render(<DashboardHeader {...defaultProps} authMethod="pat" />)
      expect(screen.getByRole('button', { name: /clear token/i })).toBeInTheDocument()
    })

    it('calls clearToken when Clear Token clicked', async () => {
      const user = userEvent.setup()
      const clearToken = vi.fn()
      render(<DashboardHeader {...defaultProps} authMethod="pat" clearToken={clearToken} />)
      
      await user.click(screen.getByRole('button', { name: /clear token/i }))
      expect(clearToken).toHaveBeenCalledOnce()
    })

    it('shows no auth controls when authMethod is none', () => {
      render(<DashboardHeader {...defaultProps} authMethod="none" />)
      expect(screen.queryByText(/clear token/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Sign out')).not.toBeInTheDocument()
    })
  })

  describe('Theme Selection', () => {
    it('renders theme selector with correct value', () => {
      render(<DashboardHeader {...defaultProps} theme="light" />)
      const select = screen.getByLabelText('Theme:')
      expect(select).toHaveValue('light')
    })

    it('calls setTheme when theme changes', async () => {
      const user = userEvent.setup()
      const setTheme = vi.fn()
      render(<DashboardHeader {...defaultProps} setTheme={setTheme} />)
      
      await user.selectOptions(screen.getByLabelText('Theme:'), 'light')
      expect(setTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('Sort Selection', () => {
    it('renders sort selector with correct value', () => {
      render(<DashboardHeader {...defaultProps} sortBy="group" />)
      const select = screen.getByLabelText('Sort:')
      expect(select).toHaveValue('group')
    })

    it('calls setSortBy when sort changes', async () => {
      const user = userEvent.setup()
      const setSortBy = vi.fn()
      render(<DashboardHeader {...defaultProps} setSortBy={setSortBy} />)
      
      await user.selectOptions(screen.getByLabelText('Sort:'), 'status')
      expect(setSortBy).toHaveBeenCalledWith('status')
    })
  })

  describe('Auto-Refresh Controls', () => {
    it('shows auto-refresh checkbox checked when enabled', () => {
      render(<DashboardHeader {...defaultProps} autoRefresh={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('calls setAutoRefresh when checkbox toggled', async () => {
      const user = userEvent.setup()
      const setAutoRefresh = vi.fn()
      render(<DashboardHeader {...defaultProps} setAutoRefresh={setAutoRefresh} />)
      
      await user.click(screen.getByRole('checkbox'))
      expect(setAutoRefresh).toHaveBeenCalled()
    })

    it('shows interval selector when auto-refresh enabled', () => {
      render(<DashboardHeader {...defaultProps} autoRefresh={true} />)
      const selects = screen.getAllByRole('combobox')
      // Should have 3 selects: theme, sort, and refresh interval
      expect(selects).toHaveLength(3)
    })

    it('hides interval selector when auto-refresh disabled', () => {
      render(<DashboardHeader {...defaultProps} autoRefresh={false} />)
      const selects = screen.getAllByRole('combobox')
      // Should have only 2 selects: theme and sort
      expect(selects).toHaveLength(2)
    })
  })

  describe('Last Update Display', () => {
    it('shows last update time when available', () => {
      const lastUpdate = new Date('2025-12-14T11:30:00')
      render(<DashboardHeader {...defaultProps} lastUpdate={lastUpdate} />)
      expect(screen.getByText(/11:30/)).toBeInTheDocument()
    })

    it('hides last update when null', () => {
      render(<DashboardHeader {...defaultProps} lastUpdate={null} />)
      const times = screen.queryAllByText(/:\d{2}/)
      expect(times).toHaveLength(0)
    })
  })

  describe('Refresh Button', () => {
    it('calls fetchAllStatuses when clicked', async () => {
      const user = userEvent.setup()
      const fetchAllStatuses = vi.fn()
      render(<DashboardHeader {...defaultProps} fetchAllStatuses={fetchAllStatuses} />)
      
      await user.click(screen.getByRole('button', { name: /refresh/i }))
      expect(fetchAllStatuses).toHaveBeenCalledOnce()
    })

    it('disables refresh button when loading', () => {
      render(<DashboardHeader {...defaultProps} loading={true} />)
      const button = screen.getByRole('button', { name: /refresh/i })
      expect(button).toBeDisabled()
    })

    it('enables refresh button when not loading', () => {
      render(<DashboardHeader {...defaultProps} loading={false} />)
      const button = screen.getByRole('button', { name: /refresh/i })
      expect(button).not.toBeDisabled()
    })
  })
})
