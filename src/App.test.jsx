import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component - Smoke Tests', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear()
    localStorage.getItem.mockClear()
    localStorage.setItem.mockClear()
  })

  it('should render without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('should show authentication setup when no token is present', () => {
    localStorage.getItem.mockReturnValue(null)
    render(<App />)
    
    // Should show GitHub Authentication header
    expect(screen.getByText(/GitHub Authentication/i)).toBeInTheDocument()
  })

  it('should show the correct app title in auth screen', () => {
    localStorage.getItem.mockReturnValue(null)
    render(<App />)
    
    expect(screen.getByText(/Choose an authentication method/i)).toBeInTheDocument()
  })

  it('should have both auth options visible', () => {
    localStorage.getItem.mockReturnValue(null)
    render(<App />)
    
    // Should show both GitHub App and PAT options
    expect(screen.getByText(/GitHub App \(Recommended\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Personal Access Token/i)).toBeInTheDocument()
  })
})
