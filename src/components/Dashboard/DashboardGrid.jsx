import { useState, useEffect } from 'react'
import { RepoCard } from './RepoCard'
import './DashboardGrid.css'

/**
 * Grid layout component for displaying repository cards
 * Automatically fits as many cards as possible based on viewport width
 */
export function DashboardGrid({ repositories }) {
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    // Remove the initial-load class after animation completes
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 1000) // After all animations complete (longest is ~750ms)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`dashboard-grid ${isInitialLoad ? 'initial-load' : ''}`}>
      {repositories.map(([repoName, status]) => (
        <RepoCard key={repoName} repoName={repoName} status={status} />
      ))}
    </div>
  )
}
