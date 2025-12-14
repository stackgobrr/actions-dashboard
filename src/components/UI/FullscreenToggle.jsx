import { ScreenFullIcon, ScreenNormalIcon } from '@primer/octicons-react'

export function FullscreenToggle({ isFullscreen, onToggle }) {
  const label = isFullscreen ? "Exit Fullscreen" : "Fullscreen"
  
  return (
    <button 
      onClick={onToggle}
      className="btn btn-sm" 
      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen (F)"}
      aria-label={label}
    >
      {isFullscreen ? <ScreenNormalIcon size={16} /> : <ScreenFullIcon size={16} />}
    </button>
  )
}
