import { useState, useEffect, useMemo } from 'react'
import ReactGridLayout, { useContainerWidth } from 'react-grid-layout'
import { RepoCard } from './RepoCard'
import { INITIAL_LOAD_ANIMATION_DURATION } from '../../constants/timing'
import './DashboardGrid.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const CARD_WIDTH = 280
const MARGIN = 16

export function DashboardGrid({ repositories, getActiveToken, selectedRepos, isDemoMode, onDataUpdate }) {
  const { width, containerRef, mounted } = useContainerWidth()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [expandedRepo, setExpandedRepo] = useState(null)
  const [pinnedRepos, setPinnedRepos] = useState(() => {
    const saved = localStorage.getItem('pinnedRepos')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, INITIAL_LOAD_ANIMATION_DURATION)
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

  const handleCardClick = (repoName) => {
    setExpandedRepo(expandedRepo === repoName ? null : repoName)
  }

  // Sort repositories: pinned first, then maintain original sort order
  const sortedRepositories = useMemo(() => {
    // Separate pinned and unpinned repos to preserve sort order
    const pinned = repositories.filter(([name]) => pinnedRepos.includes(name))
    const unpinned = repositories.filter(([name]) => !pinnedRepos.includes(name))
    return [...pinned, ...unpinned]
  }, [repositories, pinnedRepos])

  // Calculate columns based on container width
  const cols = useMemo(() => {
    return Math.max(1, Math.floor((width + MARGIN) / (CARD_WIDTH + MARGIN)))
  }, [width])

  // Generate layout with smart reflowing around expanded cards
  const layout = useMemo(() => {
    // Calculate base positions for all cards (as if 1x1)
    const basePositions = []
    let x = 0
    let y = 0
    
    sortedRepositories.forEach(([repoName]) => {
      if (x >= cols) {
        x = 0
        y++
      }
      basePositions.push({ repoName, baseX: x, baseY: y })
      x++
    })
    
    // Find expanded card and mark its occupied space
    const expandedIndex = sortedRepositories.findIndex(([name]) => name === expandedRepo)
    const occupied = new Set() // Track occupied cells as "x,y"
    const result = []
    
    if (expandedIndex !== -1) {
      const { baseX, baseY } = basePositions[expandedIndex]
      const expandedW = Math.min(2, cols)
      
      // Adjust x position if card would overflow the grid
      let adjustedX = baseX
      if (adjustedX + expandedW > cols) {
        adjustedX = cols - expandedW
      }
      
      result.push({
        i: expandedRepo,
        x: adjustedX,
        y: baseY,
        w: expandedW,
        h: 2,
        static: true
      })
      
      // Mark occupied cells by expanded card
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < expandedW; dx++) {
          occupied.add(`${adjustedX + dx},${baseY + dy}`)
        }
      }
    }
    
    // Place all other cards in order, filling available space
    sortedRepositories.forEach(([repoName]) => {
      if (repoName === expandedRepo) return
      
      // Find next available position (scan left-to-right, top-to-bottom)
      let placed = false
      for (let scanY = 0; scanY < 50 && !placed; scanY++) {
        for (let scanX = 0; scanX < cols && !placed; scanX++) {
          if (!occupied.has(`${scanX},${scanY}`)) {
            result.push({ i: repoName, x: scanX, y: scanY, w: 1, h: 1, static: true })
            occupied.add(`${scanX},${scanY}`)
            placed = true
          }
        }
      }
    })
    
    return result
  }, [sortedRepositories, expandedRepo, cols])

  return (
    <div ref={containerRef} className={`dashboard-grid-wrapper ${isInitialLoad ? 'initial-load' : ''}`}>
      {mounted && (
        <ReactGridLayout
          className="dashboard-grid"
          layout={layout}
          width={width}
          gridConfig={{ 
            cols, 
            rowHeight: 250,
            margin: [MARGIN, MARGIN]
          }}
          dragConfig={{ enable: false }}
          resizeConfig={{ enable: false }}
          compactor={null}
          isDraggable={false}
          isResizable={false}
          static={true}
        >
          {sortedRepositories.map(([repoName, status]) => {
            const repo = selectedRepos?.find(r => r.name === repoName)
            return (
              <div key={repoName}>
                <RepoCard 
                  repoName={repoName} 
                  repoOwner={repo?.owner || 'unknown'}
                  status={status}
                  onTogglePin={togglePin}
                  isPinned={pinnedRepos.includes(repoName)}
                  isExpanded={expandedRepo === repoName}
                  onToggleExpand={() => handleCardClick(repoName)}
                  getActiveToken={getActiveToken}
                  isDemoMode={isDemoMode}
                  onDataUpdate={onDataUpdate}
                />
              </div>
            )
          })}
        </ReactGridLayout>
      )}
    </div>
  )
}
