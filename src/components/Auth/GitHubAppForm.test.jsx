import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GitHubAppForm } from './GitHubAppForm'

describe('GitHubAppForm Component - Critical Functionality', () => {
  const defaultProps = {
    appId: '',
    setAppId: vi.fn(),
    installationId: '',
    setInstallationId: vi.fn(),
    privateKey: '',
    setPrivateKey: vi.fn(),
    appFormError: '',
    onSubmit: vi.fn(),
    onBack: vi.fn(),
    onShowGuide: vi.fn()
  }

  describe('Form Validation & Submission', () => {
    it('prevents submission when any required field is empty', async () => {
      const onSubmit = vi.fn()
      
      // All empty
      const { rerender } = render(<GitHubAppForm {...defaultProps} onSubmit={onSubmit} />)
      expect(screen.getByRole('button', { name: /save & authenticate/i })).toBeDisabled()
      
      // Only appId filled
      rerender(<GitHubAppForm {...defaultProps} appId="123" onSubmit={onSubmit} />)
      expect(screen.getByRole('button', { name: /save & authenticate/i })).toBeDisabled()
      
      // Only appId and installationId filled
      rerender(<GitHubAppForm {...defaultProps} appId="123" installationId="456" onSubmit={onSubmit} />)
      expect(screen.getByRole('button', { name: /save & authenticate/i })).toBeDisabled()
      
      // Clicking disabled button should not submit
      await userEvent.click(screen.getByRole('button', { name: /save & authenticate/i }))
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('allows submission when all required fields are filled', async () => {
      const onSubmit = vi.fn()
      render(<GitHubAppForm {...defaultProps} appId="123" installationId="456" privateKey="key" onSubmit={onSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /save & authenticate/i })
      expect(submitButton).toBeEnabled()
      
      await userEvent.click(submitButton)
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it('displays validation error to user', () => {
      render(<GitHubAppForm {...defaultProps} appFormError="Invalid App ID format" />)
      
      const errorMessage = screen.getByText('Invalid App ID format')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage.closest('.flash-error')).toBeInTheDocument()
    })

    it('updates field values as user types', async () => {
      const setAppId = vi.fn()
      const setInstallationId = vi.fn()
      const setPrivateKey = vi.fn()
      
      render(<GitHubAppForm {...defaultProps} setAppId={setAppId} setInstallationId={setInstallationId} setPrivateKey={setPrivateKey} />)
      
      await userEvent.type(screen.getByLabelText('App ID'), 'a')
      expect(setAppId).toHaveBeenCalled()
      
      await userEvent.type(screen.getByLabelText('Installation ID'), 'b')
      expect(setInstallationId).toHaveBeenCalled()
      
      await userEvent.type(screen.getByLabelText('Private Key (PEM)'), 'c')
      expect(setPrivateKey).toHaveBeenCalled()
    })
  })

  describe('Navigation', () => {
    it('allows user to go back to auth selection', async () => {
      const onBack = vi.fn()
      render(<GitHubAppForm {...defaultProps} onBack={onBack} />)
      
      await userEvent.click(screen.getByRole('button', { name: /back/i }))
      expect(onBack).toHaveBeenCalledOnce()
    })

    it('provides access to setup documentation', async () => {
      const onShowGuide = vi.fn()
      render(<GitHubAppForm {...defaultProps} onShowGuide={onShowGuide} />)
      
      await userEvent.click(screen.getByText('View setup guide'))
      expect(onShowGuide).toHaveBeenCalledOnce()
    })
  })

  describe('Required Fields', () => {
    it('renders all three required credential fields', () => {
      render(<GitHubAppForm {...defaultProps} />)
      
      expect(screen.getByLabelText('App ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Installation ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Private Key (PEM)')).toBeInTheDocument()
    })
  })
})
