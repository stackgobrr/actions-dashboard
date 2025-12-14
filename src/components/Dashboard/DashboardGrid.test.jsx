import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardGrid } from './DashboardGrid'

describe('DashboardGrid Component - Critical Functionality', () => {
  it('displays all repositories passed to it', () => {
    const repositories = [
      ['repo-one', { status: 'completed', conclusion: 'success', category: 'Frontend', description: 'Test' }],
      ['repo-two', { status: 'in_progress', category: 'Backend', description: 'Test' }],
      ['repo-three', { status: 'completed', conclusion: 'failure', category: 'Services', description: 'Test' }]
    ]
    
    render(<DashboardGrid repositories={repositories} />)
    
    // Critical: All repos must be visible
    expect(screen.getByText('repo-one')).toBeInTheDocument()
    expect(screen.getByText('repo-two')).toBeInTheDocument()
    expect(screen.getByText('repo-three')).toBeInTheDocument()
  })

  it('handles empty repository list without crashing', () => {
    const { container } = render(<DashboardGrid repositories={[]} />)
    
    // Should render container but no cards
    const grid = container.querySelector('.dashboard-grid')
    expect(grid).toBeInTheDocument()
    expect(grid.children).toHaveLength(0)
  })

  it('renders repositories in the order provided (preserves sort)', () => {
    const repositories = [
      ['zulu', { status: 'completed', conclusion: 'success', category: 'Test', description: 'Test' }],
      ['alpha', { status: 'completed', conclusion: 'success', category: 'Test', description: 'Test' }],
      ['mike', { status: 'completed', conclusion: 'success', category: 'Test', description: 'Test' }]
    ]
    
    render(<DashboardGrid repositories={repositories} />)
    
    const repoNames = screen.getAllByText(/zulu|alpha|mike/)
    expect(repoNames[0]).toHaveTextContent('zulu')
    expect(repoNames[1]).toHaveTextContent('alpha')
    expect(repoNames[2]).toHaveTextContent('mike')
  })
})
