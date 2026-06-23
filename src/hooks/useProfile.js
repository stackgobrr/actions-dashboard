import { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/logger'
import { trackEvent } from '../utils/analytics'

const CACHE_KEY = 'profile_cache'
const CACHE_VERSION_KEY = 'profile_cache_version'

/**
 * Hook to manage remote user profile state via /api/profile.
 * Keeps localStorage as an optimistic cache with version tracking.
 *
 * @param {boolean} authenticated - Whether the user is authenticated
 * @returns {Object} Profile state and update helpers
 */
export function useProfile(authenticated) {
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /** Persist profile to localStorage as optimistic cache */
  const persistCache = useCallback((data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_VERSION_KEY, Date.now().toString())
    } catch (err) {
      logger.error('[useProfile] Failed to write cache:', err)
    }
  }, [])

  /** Fetch profile from server, hydrate state and cache */
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 401) {
          // Session cookie gone — clear cache, caller handles re-auth
          localStorage.removeItem(CACHE_KEY)
          setProfile(null)
          return null
        }
        throw new Error(`Profile fetch failed: ${res.status}`)
      }
      const data = await res.json()
      setProfile(data)
      persistCache(data)
      return data
    } catch (err) {
      logger.error('[useProfile] fetchProfile error:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [persistCache])

  /**
   * Persist settings and selected_repos to server.
   * Optimistically updates local state before awaiting the response.
   *
   * @param {{ settings?: object, selected_repos?: Array }} updates
   */
  const updateProfile = useCallback(async (updates) => {
    const optimistic = { ...profile, ...updates }
    setProfile(optimistic)
    persistCache(optimistic)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        throw new Error(`Profile update failed: ${res.status}`)
      }
      const updated = await res.json()
      setProfile(updated)
      persistCache(updated)
      trackEvent('Profile Updated', { keys: Object.keys(updates) })
    } catch (err) {
      logger.error('[useProfile] updateProfile error:', err)
      // Roll back optimistic update on failure
      setProfile(profile)
      persistCache(profile)
      setError(err.message)
    }
  }, [profile, persistCache])

  // Fetch profile on mount when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchProfile()
    } else {
      setProfile(null)
    }
  }, [authenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  }
}
