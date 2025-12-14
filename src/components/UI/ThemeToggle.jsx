import { SunIcon, MoonIcon } from '@primer/octicons-react'
import { IconButton } from '@primer/react'

export function ThemeToggle({ theme, onToggle }) {
  return (
    <IconButton 
      onClick={onToggle}
      size="small"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme (T)`}
      icon={theme === 'dark' ? SunIcon : MoonIcon}
    />
  )
}
