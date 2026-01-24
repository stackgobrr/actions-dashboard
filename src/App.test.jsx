import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import App from './App'

// Helper to render App with Router context
const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

describe('App Component - Smoke Tests', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear()
    localStorage.getItem.mockClear()
    localStorage.setItem.mockClear()
  })

  it('should render without crashing', () => {
    renderApp()
    expect(document.body).toBeTruthy()
  })

  it('should show landing page when no token is present', () => {
    localStorage.getItem.mockReturnValue(null)
    renderApp()

    // Should show landing page with header button
    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i })
    expect(getStartedButtons.length).toBeGreaterThan(0)
    // Check that Actions Dashboard text appears at least once
    const dashboardTexts = screen.getAllByText(/Actions Dashboard/i)
    expect(dashboardTexts.length).toBeGreaterThan(0)
  })

  it('should show authentication setup after clicking Get Started', async () => {
    localStorage.getItem.mockReturnValue(null)
    const user = userEvent.setup()
    renderApp()

    // Click the first Get Started button (header button)
    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i })
    await user.click(getStartedButtons[0])

    // Should now show authentication setup
    expect(screen.getByRole('heading', { name: /authentication/i })).toBeInTheDocument()
    expect(screen.getByText(/choose.*authentication.*method/i)).toBeInTheDocument()
  })

  it('should have both auth options visible after clicking Get Started', async () => {
    localStorage.getItem.mockReturnValue(null)
    const user = userEvent.setup()
    renderApp()
    
    // Click the first Get Started button (header button)
    const getStartedButtons = screen.getAllByRole('button', { name: /Get Started/i })
    await user.click(getStartedButtons[0])
    
    // Should show both GitHub App and PAT options by their configure buttons
    expect(screen.getByRole('button', { name: /configure.*github app/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save.*token/i })).toBeInTheDocument()
  })
})
