import { useState, useEffect } from 'react'
import { RepoCard } from './RepoCard'
import { INITIAL_LOAD_ANIMATION_DURATION } from '../../constants/timing'
import './DashboardGrid.css'

/**
 * Grid layout component for displaying repository cards
 * Automatically fits as many cards as possible based on viewport width
 */
export function DashboardGrid({ repositories }) {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [pinnedRepos, setPinnedRepos] = useState(() => {
    const saved = localStorage.getItem('pinnedRepos')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    // Remove the initial-load class after animation completes
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, INITIAL_LOAD_ANIMATION_DURATION) // After all animations complete (longest is ~750ms)

    return () => clearTimeout(timer)
  }, [])

  const togglePin = (repoName) => {
    setPinnedRepos(prev => {
      const newPinned = prev.includes(repoName)
        ? prev.filter(name => name !== repoName)
        : [...prev, repoName]
      localStorage.setItem('pinnedRepos', JSON.stringify(newPinned))
      return newPinned
    })
  }

  // Sort repositories: pinned first, then regular
  const sortedRepositories = [...repositories].sort(([nameA], [nameB]) => {
    const aIsPinned = pinnedRepos.includes(nameA)
    const bIsPinned = pinnedRepos.includes(nameB)
    if (aIsPinned && !bIsPinned) return -1
    if (!aIsPinned && bIsPinned) return 1
    return 0
  })

  return (
    <div className={`dashboard-grid ${isInitialLoad ? 'initial-load' : ''}`}>
      {sortedRepositories.map(([repoName, status]) => (
        <RepoCard 
          key={repoName} 
          repoName={repoName} 
          status={status}
          onTogglePin={togglePin}
          isPinned={pinnedRepos.includes(repoName)}
        />
      ))}
    </div>
  )
}
