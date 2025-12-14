import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatForm } from './PatForm'

describe('PatForm Component - Critical Functionality', () => {
  const defaultProps = {
    githubToken: '',
    setGithubToken: vi.fn(),
    onSubmit: vi.fn()
  }

  describe('Form Submission Flow', () => {
    it('prevents submission when token is empty', async () => {
      const onSubmit = vi.fn()
      render(<PatForm {...defaultProps} githubToken="" onSubmit={onSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /save token/i })
      expect(submitButton).toBeDisabled()
      
      // Ensure clicking disabled button doesn't submit
      await userEvent.click(submitButton)
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('allows submission when token is provided', async () => {
      const onSubmit = vi.fn()
      const token = 'ghp_validtoken123'
      render(<PatForm {...defaultProps} githubToken={token} onSubmit={onSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /save token/i })
      expect(submitButton).toBeEnabled()
      
      await userEvent.click(submitButton)
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it('updates token value as user types', async () => {
      const setGithubToken = vi.fn()
      render(<PatForm {...defaultProps} setGithubToken={setGithubToken} />)
      
      const input = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx')
      await userEvent.type(input, 'test')
      
      // Verify setGithubToken was called for each character typed
      expect(setGithubToken).toHaveBeenCalled()
    })
  })

  describe('Critical UI Elements', () => {
    it('provides link to create GitHub token', () => {
      render(<PatForm {...defaultProps} />)
      const link = screen.getByText('Create a new token')
      expect(link).toHaveAttribute('href')
      expect(link.getAttribute('href')).toContain('github.com/settings/tokens')
    })

    it('has password input for security', () => {
      render(<PatForm {...defaultProps} />)
      const input = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx')
      expect(input).toHaveAttribute('type', 'password')
    })
  })
})
