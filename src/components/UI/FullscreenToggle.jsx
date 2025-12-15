import { ScreenFullIcon, ScreenNormalIcon } from '@primer/octicons-react'
import { IconButton } from '@primer/react'

export function FullscreenToggle({ isFullscreen, onToggle }) {
  const label = isFullscreen ? "Exit Fullscreen" : "Fullscreen"
  
  return (
    <IconButton 
      onClick={onToggle}
      size="medium"
      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen (F)"}
      aria-label={label}
      icon={isFullscreen ? ScreenNormalIcon : ScreenFullIcon}
    />
  )
}
