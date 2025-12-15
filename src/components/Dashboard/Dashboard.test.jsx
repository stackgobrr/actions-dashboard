import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'

describe('Dashboard Component - Critical Functionality', () => {
  const defaultProps = {
    repoStatuses: {},
    loading: false,
    lastUpdate: new Date('2025-12-14T12:00:00'),
    fetchAllStatuses: vi.fn(),
    isFullscreen: false,
    toggleFullscreen: vi.fn(),
    authMethod: 'pat',
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
    onOpenSettings: vi.fn(),
    filterByLabels: [],
    setFilterByLabels: vi.fn()
  }

  describe('Repository Display', () => {
    it('displays all repositories with their statuses', () => {
      const repoStatuses = {
        'test-repo-1': { status: 'completed', conclusion: 'success', category: 'Test', description: 'Test 1' },
        'test-repo-2': { status: 'in_progress', category: 'Test', description: 'Test 2' },
        'test-repo-3': { status: 'completed', conclusion: 'failure', category: 'Test', description: 'Test 3' }
      }
      
      render(<Dashboard {...defaultProps} repoStatuses={repoStatuses} />)
      
      expect(screen.getByText('test-repo-1')).toBeInTheDocument()
      expect(screen.getByText('test-repo-2')).toBeInTheDocument()
      expect(screen.getByText('test-repo-3')).toBeInTheDocument()
    })

    it('shows loading state instead of empty grid when loading', () => {
      render(<Dashboard {...defaultProps} loading={true} repoStatuses={{}} />)
      
      expect(screen.getByText('Loading repository statuses...')).toBeInTheDocument()
      expect(screen.queryByText('Actions Dashboard')).toBeInTheDocument() // Header still visible
    })

    it('displays repositories even while loading if data exists', () => {
      const repoStatuses = {
        'existing-repo': { status: 'completed', conclusion: 'success', category: 'Test', description: 'Test' }
      }
      
      render(<Dashboard {...defaultProps} loading={true} repoStatuses={repoStatuses} />)
      
      // Should show repo data, not loading message
      expect(screen.getByText('existing-repo')).toBeInTheDocument()
      expect(screen.queryByText('Loading repository statuses...')).not.toBeInTheDocument()
    })
  })

  describe('Fullscreen Behavior', () => {
    it('hides header controls in fullscreen mode', () => {
      render(<Dashboard {...defaultProps} isFullscreen={true} />)
      
      // Header should be hidden
      expect(screen.queryByText('Actions Dashboard')).not.toBeInTheDocument()
      
      // But fullscreen toggle should be visible
      expect(screen.getByLabelText('Exit Fullscreen')).toBeInTheDocument()
    })

    it('shows header controls when not fullscreen', () => {
      render(<Dashboard {...defaultProps} isFullscreen={false} />)
      
      expect(screen.getByText('Actions Dashboard')).toBeInTheDocument()
      expect(screen.getByLabelText('Fullscreen')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('handles zero repositories gracefully when not loading', () => {
      const { container } = render(<Dashboard {...defaultProps} loading={false} repoStatuses={{}} />)
      
      // Should render grid container even if empty
      const grid = container.querySelector('.dashboard-grid')
      expect(grid).toBeInTheDocument()
    })
  })
})
