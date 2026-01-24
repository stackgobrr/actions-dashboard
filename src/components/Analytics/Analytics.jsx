import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Analytics component to track pageviews on route changes
 * Uses Plausible Analytics for privacy-friendly tracking
 */
export function Analytics() {
  const location = useLocation()

  useEffect(() => {
    // Track pageview when route changes
    if (window.plausible) {
      window.plausible('pageview')
    }
  }, [location.pathname])

  return null
}
