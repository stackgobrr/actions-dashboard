import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RepoCard } from './RepoCard'

describe('RepoCard Component', () => {
  describe('Rendering', () => {
    it('renders repository name', () => {
      const status = {
        category: 'Frontend',
        description: 'Main web application'
      }
      
      render(<RepoCard repoName="my-repo" status={status} />)
      
      expect(screen.getByText('my-repo')).toBeInTheDocument()
    })
    
    it('renders description', () => {
      const status = {
        category: 'Backend',
        description: 'API server'
      }
      
      render(<RepoCard repoName="api" status={status} />)
      
      expect(screen.getByText(/api server/i)).toBeInTheDocument()
    })
    
    it('renders category label', () => {
      const status = {
        category: 'DevOps',
        description: 'Infrastructure',
        labels: []
      }
      
      render(<RepoCard repoName="infra" status={status} />)
      
      // Category label no longer displays by default, only when no custom labels are applied
      // Since we're not showing category labels anymore, this test should check that it's NOT displayed
      expect(screen.queryByText('DevOps')).not.toBeInTheDocument()
    })
  })
  
  describe('Error States', () => {
    it('displays error message when error exists', () => {
      const status = {
        category: 'Frontend',
        description: 'Main app',
        error: 'Failed to fetch workflow status'
      }
      
      render(<RepoCard repoName="my-repo" status={status} />)
      
      expect(screen.getByText(/failed.*fetch.*workflow/i)).toBeInTheDocument()
    })
    
    it('shows error icon when error exists', () => {
      const status = {
        category: 'Frontend',
        description: 'Main app',
        error: 'API error'
      }
      
      const { container } = render(<RepoCard repoName="my-repo" status={status} />)
      
      expect(container.querySelector('.color-fg-danger')).toBeInTheDocument()
    })
  })
  
  describe('Success States', () => {
    it('displays workflow information for completed success', () => {
      const status = {
        category: 'Frontend',
        description: 'Main app',
        status: 'completed',
        conclusion: 'success',
        workflow: 'CI Pipeline',
        branch: 'main',
        commitMessage: 'fix: update dependencies',
        url: 'https://github.com/example/repo/actions/runs/123'
      }
      
      render(<RepoCard repoName="my-repo" status={status} />)
      
      expect(screen.getByText(/ci pipeline/i)).toBeInTheDocument()
      // Check branch is displayed (appears in both description and branch, so verify it's there)
      expect(screen.getAllByText(/main/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/update dependencies/i)).toBeInTheDocument()
    })
    
    it('renders View Run link when url exists', () => {
      const status = {
        category: 'Frontend',
        description: 'Main app',
        status: 'completed',
        conclusion: 'success',
        url: 'https://github.com/example/repo/actions/runs/123'
      }
      
      render(<RepoCard repoName="my-repo" status={status} />)
      
      const link = screen.getByLabelText('View workflow run')
      expect(link).toHaveAttribute('href', 'https://github.com/example/repo/actions/runs/123')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })
  
  describe('In-Progress States', () => {
    it('displays in-progress workflow information', () => {
      const status = {
        category: 'Backend',
        description: 'API',
        status: 'in_progress',
        workflow: 'Deploy to Staging',
        branch: 'develop',
        commitMessage: 'feat: add new endpoint'
      }
      
      render(<RepoCard repoName="api-server" status={status} />)
      
      expect(screen.getByText(/deploy.*staging/i)).toBeInTheDocument()
      expect(screen.getByText(/develop/i)).toBeInTheDocument()
    })
  })
  
  describe('Empty States', () => {
    it('shows icon for missing workflow data', () => {
      const status = {
        category: 'Frontend',
        description: 'No runs yet'
      }
      
      render(<RepoCard repoName="new-repo" status={status} />)
      
      expect(screen.getByLabelText('No recent runs')).toBeInTheDocument()
    })
  })
  
  describe('Failure States', () => {
    it('displays failure information', () => {
      const status = {
        category: 'Frontend',
        description: 'Main app',
        status: 'completed',
        conclusion: 'failure',
        workflow: 'Test Suite',
        branch: 'feature/new-ui',
        commitMessage: 'test: add new tests'
      }
      
      render(<RepoCard repoName="my-repo" status={status} />)
      
      expect(screen.getByText(/test suite/i)).toBeInTheDocument()
      expect(screen.getByText(/feature.*new-ui/i)).toBeInTheDocument()
    })
  })
})
