/**
 * Analytics utility for tracking custom events with Plausible
 * Provides a centralized way to track user interactions throughout the app
 */

/**
 * Track a custom event with optional properties
 * @param {string} eventName - The name of the event to track
 * @param {Object} props - Optional properties to attach to the event
 * @example
 * trackEvent('Repository Added', { source: 'search' })
 * trackEvent('Filter Changed', { filterType: 'topic', value: 'frontend' })
 */
export function trackEvent(eventName, props = {}) {
  if (window.plausible && typeof window.plausible === 'function') {
    try {
      window.plausible(eventName, { props })
    } catch (error) {
      // Silently fail in production, log in development
      if (import.meta.env.DEV) {
        console.warn('Failed to track event:', eventName, error)
      }
    }
  }
}
