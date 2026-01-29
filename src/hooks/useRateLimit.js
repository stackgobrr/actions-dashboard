import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook to fetch and monitor GitHub API rate limit
 * Polls every 30 seconds when enabled
 */
export function useRateLimit(getActiveToken, authMethod, enabled = false) {
  const [rateLimit, setRateLimit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const hasLoadedRef = useRef(false)

  const fetchRateLimit = useCallback(async () => {
    if (!enabled || authMethod === 'demo' || authMethod === 'none') {
      return
    }

    // Only show loading on initial fetch (when we don't have data yet)
    if (!hasLoadedRef.current) {
      setLoading(true)
    }
    setError(null)

    try {
      const token = await getActiveToken()
      if (!token) {
        setError('No token available')
        return
      }

      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `token ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch rate limit: ${response.status}`)
      }

      const data = await response.json()
      setRateLimit(data.rate)
      hasLoadedRef.current = true
    } catch (err) {
      setError(err.message)
    } finally {
      if (!hasLoadedRef.current) {
        setLoading(false)
      }
    }
  }, [getActiveToken, authMethod, enabled])

  useEffect(() => {
    if (enabled) {
      fetchRateLimit()
      // Refresh every 30 seconds
      const interval = setInterval(fetchRateLimit, 30000)
      return () => clearInterval(interval)
    }
  }, [enabled, fetchRateLimit])

  return {
    rateLimit,
    loading,
    error,
    refresh: fetchRateLimit
  }
}
