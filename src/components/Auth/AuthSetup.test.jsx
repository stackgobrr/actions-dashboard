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
    it('renders authentication title', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByText('GitHub Authentication')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByText('Choose an authentication method to access workflow statuses.')).toBeInTheDocument()
    })

    it('shows both authentication options initially', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByText('Self-Hosted GitHub App')).toBeInTheDocument()
      expect(screen.getByText('Personal Access Token')).toBeInTheDocument()
    })

    it('renders OR divider between options', () => {
      render(<AuthSetup {...defaultProps} />)
      const orDividers = screen.getAllByText('OR')
      expect(orDividers.length).toBeGreaterThan(0)
    })
  })

  describe('GitHub App Option', () => {
    it('displays GitHub App description', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByText('Create and configure your own GitHub App with full control over permissions and webhooks.')).toBeInTheDocument()
    })

    it('shows Configure GitHub App button', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByRole('button', { name: /configure github app/i })).toBeInTheDocument()
    })

    it('calls setShowGitHubAppForm when Configure button clicked', async () => {
      const user = userEvent.setup()
      const setShowGitHubAppForm = vi.fn()
      render(<AuthSetup {...defaultProps} setShowGitHubAppForm={setShowGitHubAppForm} />)
      
      await user.click(screen.getByRole('button', { name: /configure github app/i }))
      expect(setShowGitHubAppForm).toHaveBeenCalledWith(true)
    })

    it('shows setup guide link', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByText(/Need help setting up\?/i)).toBeInTheDocument()
    })

    it('opens guide when Need help link clicked', async () => {
      const user = userEvent.setup()
      const setShowGuide = vi.fn()
      render(<AuthSetup {...defaultProps} setShowGuide={setShowGuide} />)
      
      const guideLink = screen.getByText(/Need help setting up\?/i)
      await user.click(guideLink)
      expect(setShowGuide).toHaveBeenCalledWith(true)
    })
  })

  describe('Personal Access Token Option', () => {
    it('displays PAT description', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByText('Quick setup with just your GitHub token. Perfect for getting started.')).toBeInTheDocument()
    })

    it('shows Create a new token link', () => {
      render(<AuthSetup {...defaultProps} />)
      const link = screen.getByText('Create a new token')
      expect(link.closest('a')).toHaveAttribute('href', 'https://github.com/settings/tokens/new?scopes=repo&description=GitHub-Actions-Dashboard')
    })

    it('renders token input field', () => {
      render(<AuthSetup {...defaultProps} />)
      const input = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'password')
    })

    it('updates token when input changes', async () => {
      const user = userEvent.setup()
      const setGithubToken = vi.fn()
      render(<AuthSetup {...defaultProps} setGithubToken={setGithubToken} />)
      
      const input = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx')
      await user.type(input, 'ghp_test123')
      
      expect(setGithubToken).toHaveBeenCalled()
    })

    it('disables Save button when token is empty', () => {
      render(<AuthSetup {...defaultProps} githubToken="" />)
      const button = screen.getByRole('button', { name: /save token & continue/i })
      expect(button).toBeDisabled()
    })

    it('enables Save button when token is provided', () => {
      render(<AuthSetup {...defaultProps} githubToken="ghp_test123" />)
      const button = screen.getByRole('button', { name: /save token & continue/i })
      expect(button).not.toBeDisabled()
    })

    it('calls saveToken when Save button clicked', async () => {
      const user = userEvent.setup()
      const saveToken = vi.fn()
      render(<AuthSetupWithPATState {...defaultProps} saveToken={saveToken} />)
      
      const tokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx')
      await user.type(tokenInput, 'ghp_123456789012345678901234567890123456')
      
      await user.click(screen.getByRole('button', { name: /save token & continue/i }))
      expect(saveToken).toHaveBeenCalledOnce()
    })

    it('shows security notice with protection measures', () => {
      render(<AuthSetup {...defaultProps} />)
      expect(screen.getByText('Your credentials stay secure:')).toBeInTheDocument()
      expect(screen.getByText(/Stored locally in your browser only, never sent to our servers/i)).toBeInTheDocument()
      expect(screen.getByText(/Direct API calls from your browser to GitHub, no middleman/i)).toBeInTheDocument()
      expect(screen.getByText(/CSP and same-origin policies prevent unauthorized access/i)).toBeInTheDocument()
    })
  })

  describe('GitHub App Form', () => {
    it('shows form when showGitHubAppForm is true', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      expect(screen.getByText('GitHub App Configuration')).toBeInTheDocument()
    })

    it('hides initial options when showGitHubAppForm is true', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      expect(screen.queryByText('OR')).not.toBeInTheDocument()
      expect(screen.queryByText('Personal Access Token')).not.toBeInTheDocument()
    })

    it('renders Back button', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('calls setShowGitHubAppForm(false) when Back clicked', async () => {
      const user = userEvent.setup()
      const setShowGitHubAppForm = vi.fn()
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} setShowGitHubAppForm={setShowGitHubAppForm} />)
      
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(setShowGitHubAppForm).toHaveBeenCalledWith(false)
    })

    it('renders App ID input', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      expect(screen.getByLabelText('App ID')).toBeInTheDocument()
    })

    it('renders Installation ID input', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      expect(screen.getByLabelText('Installation ID')).toBeInTheDocument()
    })

    it('renders Private Key textarea', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      expect(screen.getByLabelText('Private Key (PEM)')).toBeInTheDocument()
    })

    it('updates appId when input changes', async () => {
      const user = userEvent.setup()
      const setAppId = vi.fn()
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} setAppId={setAppId} />)
      
      await user.type(screen.getByLabelText('App ID'), '123456')
      expect(setAppId).toHaveBeenCalled()
    })

    it('updates installationId when input changes', async () => {
      const user = userEvent.setup()
      const setInstallationId = vi.fn()
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} setInstallationId={setInstallationId} />)
      
      await user.type(screen.getByLabelText('Installation ID'), '789')
      expect(setInstallationId).toHaveBeenCalled()
    })

    it('updates privateKey when textarea changes', async () => {
      const user = userEvent.setup()
      const setPrivateKey = vi.fn()
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} setPrivateKey={setPrivateKey} />)
      
      await user.type(screen.getByLabelText('Private Key (PEM)'), '-----BEGIN RSA')
      expect(setPrivateKey).toHaveBeenCalled()
    })

    it('disables Save button when fields are empty', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} />)
      const button = screen.getByRole('button', { name: /save & authenticate/i })
      expect(button).toBeDisabled()
    })

    it('enables Save button when all fields are filled', () => {
      const validPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz
-----END RSA PRIVATE KEY-----`
      render(<AuthSetup {...defaultProps} 
        showGitHubAppForm={true}
        appId="123"
        installationId="456"
        privateKey={validPrivateKey}
      />)
      const button = screen.getByRole('button', { name: /save & authenticate/i })
      expect(button).not.toBeDisabled()
    })

    it('calls handleGitHubAppSetup when Save button clicked', async () => {
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
      
      await user.click(screen.getByRole('button', { name: /save & authenticate/i }))
      expect(handleGitHubAppSetup).toHaveBeenCalledOnce()
    })

    it('displays error message when appFormError is set', () => {
      render(<AuthSetup {...defaultProps} 
        showGitHubAppForm={true}
        appFormError="Invalid credentials"
      />)
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('does not display error when appFormError is empty', () => {
      render(<AuthSetup {...defaultProps} showGitHubAppForm={true} appFormError="" />)
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument()
    })
  })
})
