import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GitHubAppGuide from './GitHubAppGuide'

describe('GitHubAppGuide Component - Critical Functionality', () => {
  describe('Modal Behavior', () => {
    it('closes when user clicks close button', async () => {
      const onClose = vi.fn()
      render(<GitHubAppGuide onClose={onClose} />)
      
      await userEvent.click(screen.getByLabelText('Close'))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('closes when user clicks backdrop (outside modal)', async () => {
      const onClose = vi.fn()
      const { container } = render(<GitHubAppGuide onClose={onClose} />)
      
      const backdrop = container.firstChild
      await userEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('stays open when clicking inside modal content', async () => {
      const onClose = vi.fn()
      render(<GitHubAppGuide onClose={onClose} />)
      
      const modalContent = screen.getByText('GitHub App Setup Guide').closest('.Box')
      await userEvent.click(modalContent)
      
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Setup Instructions', () => {
    it('provides link to GitHub App creation page', () => {
      render(<GitHubAppGuide onClose={vi.fn()} />)
      
      const link = screen.getByRole('link', { name: /open github app creation form/i })
      expect(link).toHaveAttribute('href', 'https://github.com/settings/apps/new')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('displays all critical setup steps', () => {
      render(<GitHubAppGuide onClose={vi.fn()} />)
      
      // User needs to complete these steps to configure the app
      expect(screen.getByText('Create GitHub App')).toBeInTheDocument()
      expect(screen.getByText('Generate Private Key')).toBeInTheDocument()
      expect(screen.getByText('Install the App')).toBeInTheDocument()
      expect(screen.getByText('Configure Dashboard')).toBeInTheDocument()
    })

    it('is accessible via keyboard (can close with keyboard)', async () => {
      const onClose = vi.fn()
      render(<GitHubAppGuide onClose={onClose} />)
      
      const closeButton = screen.getByLabelText('Close')
      closeButton.focus()
      await userEvent.keyboard('{Enter}')
      
      expect(onClose).toHaveBeenCalledOnce()
    })
  })
})
