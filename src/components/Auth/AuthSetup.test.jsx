import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { AuthSetup } from './AuthSetup'

// Wrapper component to handle PAT state for controlled component testing
function AuthSetupWithPATState({ saveToken, ...otherProps }) {
  const [githubToken, setGithubToken] = useState('')
  return <AuthSetup {...otherProps} githubToken={githubToken} setGithubToken={setGithubToken} saveToken={saveToken} />
}

describe('AuthSetup Component', () => {
  const defaultProps = {
    showGuide: false,
    setShowGuide: vi.fn(),
    showGitHubAppForm: false,
    setShowGitHubAppForm: vi.fn(),
    githubToken: '',
    setGithubToken: vi.fn(),
    saveToken: vi.fn(),
    appId: '',
    setAppId: vi.fn(),
    installationId: '',
    setInstallationId: vi.fn(),
    privateKey: '',
    setPrivateKey: vi.fn(),
    appFormError: '',
    handleGitHubAppSetup: vi.fn()
  }

  describe('Initial Render', () => {
    it('presents authentication setup to user', () => {
      render(<AuthSetup {...defaultProps} />)
      
      // User sees this is an authentication page
      expect(screen.getByRole('heading', { name: /authentication/i })).toBeInTheDocument()
      
      // User can choose between authentication methods
      const configButtons = screen.getAllByRole('button', { name: /configure|save/i })
      expect(configButtons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('GitHub App Option', () => {
    it('allows user to configure GitHub App authentication', async () => {
      const user = userEvent.setup()
      const setShowGitHubAppForm = vi.fn()
      render(<AuthSetup {...defaultProps} setShowGitHubAppForm={setShowGitHubAppForm} />)
      
      // User can access GitHub App configuration
      const configButton = screen.getByRole('button', { name: /app/i })
      await user.click(configButton)
      
      expect(setShowGitHubAppForm).toHaveBeenCalledWith(true)
    })

    it('provides help documentation when requested', async () => {
      const user = userEvent.setup()
      const setShowGuide = vi.fn()
      render(<AuthSetup {...defaultProps} setShowGuide={setShowGuide} />)
      
      // User can access help guide
      const helpLink = screen.getByText(/help|guide/i)
      await user.click(helpLink)
      
      expect(setShowGuide).toHaveBeenCalledWith(true)
    })
  })

  describe('Personal Access Token Option', () => {
    it('provides link to create GitHub token', () => {
      render(<AuthSetup {...defaultProps} />)
      
      // User can navigate to GitHub to create a token
      const link = screen.getByRole('link', { name: /token/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('github.com/settings/tokens'))
    })

    it('allows user to enter their token', async () => {
      const user = userEvent.setup()
      const setGithubToken = vi.fn()
      render(<AuthSetup {...defaultProps} setGithubToken={setGithubToken} />)
      
      // User can input their token securely
      const input = screen.getByPlaceholderText(/ghp_/i)
      expect(input).toHaveAttribute('type', 'password')
      
      await user.type(input, 'ghp_test123')
      expect(setGithubToken).toHaveBeenCalled()
    })

    it('validates token before allowing save', () => {
      const { rerender } = render(<AuthSetup {...defaultProps} githubToken="" />)
      
      // User cannot save without a token
      const button = screen.getByRole('button', { name: /save|continue/i })
      expect(button).toBeDisabled()
      
      // User can save once token is provided
      rerender(<AuthSetup {...defaultProps} githubToken="ghp_test123" />)
      expect(button).not.toBeDisabled()
    })

    it('saves token when user submits', async () => {
      const user = userEvent.setup()
      const saveToken = vi.fn()
      render(<AuthSetupWithPATState {...defaultProps} saveToken={saveToken} />)
      
      // User enters and saves token
      const tokenInput = screen.getByPlaceholderText(/ghp_/i)
      await user.type(tokenInput, 'ghp_123456789012345678901234567890123456')
      
      const saveButton = screen.getByRole('button', { name: /save|continue/i })
      await user.click(saveButton)
      
      expect(saveToken).toHaveBeenCalledOnce()
    })
  })

  describe('GitHub App Form', () => {
    it('displays credential input form when configured', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      
      // User sees GitHub App credential form (not initial options)
      expect(screen.getByLabelText(/app id/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/installation id/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/private key/i)).toBeInTheDocument()
    })

    it('allows user to return to auth options', async () => {
      const user = userEvent.setup()
      const setShowGitHubAppForm = vi.fn()
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} setShowGitHubAppForm={setShowGitHubAppForm} />)
      
      // User can go back to choose different auth method
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(setShowGitHubAppForm).toHaveBeenCalledWith(false)
    })

    it('captures all required GitHub App credentials from user', async () => {
      const user = userEvent.setup()
      const setAppId = vi.fn()
      const setInstallationId = vi.fn()
      const setPrivateKey = vi.fn()
      render(<AuthSetup {...defaultProps} 
        showGitHubAppForm={true} 
        setAppId={setAppId}
        setInstallationId={setInstallationId}
        setPrivateKey={setPrivateKey}
      />)
      
      // User can input all three required credentials
      await user.type(screen.getByLabelText(/app id/i), '123456')
      expect(setAppId).toHaveBeenCalled()
      
      await user.type(screen.getByLabelText(/installation id/i), '789')
      expect(setInstallationId).toHaveBeenCalled()
      
      await user.type(screen.getByLabelText(/private key/i), '-----BEGIN RSA')
      expect(setPrivateKey).toHaveBeenCalled()
    })

    it('validates all fields before allowing submission', () => {
      const { rerender } = render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      
      // User cannot submit without all credentials
      const button = screen.getByRole('button', { name: /save|authenticate/i })
      expect(button).toBeDisabled()
      
      // User can submit once all fields are filled
      const validPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz
-----END RSA PRIVATE KEY-----`
      rerender(<AuthSetup {...defaultProps} 
        showGitHubAppForm={true}
        appId="123"
        installationId="456"
        privateKey={validPrivateKey}
      />)
      expect(button).not.toBeDisabled()
    })

    it('submits GitHub App credentials when user saves', async () => {
      const user = userEvent.setup()
      const handleGitHubAppSetup = vi.fn()
      const validPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz
-----END RSA PRIVATE KEY-----`
      render(<AuthSetup {...defaultProps} 
        showGitHubAppForm={true}
        appId="123"
        installationId="456"
        privateKey={validPrivateKey}
        handleGitHubAppSetup={handleGitHubAppSetup}
      />)
      
      // User submits credentials
      await user.click(screen.getByRole('button', { name: /save|authenticate/i }))
      expect(handleGitHubAppSetup).toHaveBeenCalledOnce()
    })

    it('shows error feedback when credentials are invalid', () => {
      const { rerender } = render(<AuthSetup {...defaultProps} showGitHubAppForm={true} appFormError="" />)
      
      // No error shown initially
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
      
      // User sees error when credentials fail validation
      rerender(<AuthSetup {...defaultProps} 
        showGitHubAppForm={true}
        appFormError="Invalid credentials"
      />)
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
