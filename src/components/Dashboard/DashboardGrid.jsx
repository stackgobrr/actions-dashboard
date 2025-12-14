import { RepoCard } from './RepoCard'
import './DashboardGrid.css'

/**
 * Grid layout component for displaying repository cards
 * Automatically fits as many cards as possible based on viewport width
 */
export function DashboardGrid({ repositories }) {
  return (
    <div className="dashboard-grid">
      {repositories.map(([repoName, status]) => (
        <RepoCard key={repoName} repoName={repoName} status={status} />
      ))}
    </div>
  )
}
