import { SyncIcon } from '@primer/octicons-react'
import { IconButton } from '@primer/react'

export function RefreshButton({ onRefresh, loading, disabled }) {
  return (
    <IconButton 
      onClick={onRefresh}
      disabled={disabled || loading}
      size="small"
      aria-label="Refresh all repos"
      title="Refresh all repos (R)"
      icon={SyncIcon}
      sx={loading ? { animation: 'rotate 1s linear infinite', '@keyframes rotate': { '100%': { transform: 'rotate(360deg)' } } } : undefined}
    />
  )
}
