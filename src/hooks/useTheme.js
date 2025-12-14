import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    // Set Primer CSS theme attributes correctly
    document.documentElement.setAttribute('data-color-mode', theme)
    if (theme === 'light') {
      document.documentElement.setAttribute('data-light-theme', 'light')
    } else {
      document.documentElement.setAttribute('data-dark-theme', 'dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  return [theme, setTheme]
}
