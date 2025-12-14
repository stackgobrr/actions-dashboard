import { SunIcon, MoonIcon } from '@primer/octicons-react'

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button 
      onClick={onToggle}
      className="btn btn-sm" 
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme (T)`}
    >
      {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  )
}
