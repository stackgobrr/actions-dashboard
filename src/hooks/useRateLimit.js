import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to fetch and monitor GitHub API rate limit
 * Polls every 10 seconds when enabled
 */
export function useRateLimit(getActiveToken, authMethod, enabled = false) {
  const [rateLimit, setRateLimit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRateLimit = useCallback(async () => {
    if (!enabled || authMethod === 'demo' || authMethod === 'none') {
      return
    }

    setLoading(true)
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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getActiveToken, authMethod, enabled])

  useEffect(() => {
    if (enabled) {
      fetchRateLimit()
      // Refresh every 10 seconds
      const interval = setInterval(fetchRateLimit, 10000)
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
