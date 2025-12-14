import { SyncIcon } from '@primer/octicons-react'

export function RefreshButton({ onRefresh, loading, disabled }) {
  return (
    <button 
      onClick={onRefresh}
      disabled={disabled || loading}
      className="btn btn-sm" 
      title="Refresh all repos (R)"
    >
      <SyncIcon 
        size={16} 
        className={loading ? 'spinning' : ''} 
      />
    </button>
  )
}
