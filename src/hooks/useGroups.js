import { useState, useCallback } from 'react'
import { logger } from '../utils/logger'
import { trackEvent } from '../utils/analytics'

/**
 * Hook to manage group membership and shared group configs via /api/groups.
 *
 * @param {boolean} authenticated - Whether the user has an active session
 * @returns {Object} Groups state and CRUD helpers
 */
export function useGroups(authenticated) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /** Fetch all groups the current user belongs to */
  const fetchGroups = useCallback(async () => {
    if (!authenticated) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/groups', { credentials: 'include' })
      if (!res.ok) throw new Error(`Failed to fetch groups: ${res.status}`)
      const data = await res.json()
      setGroups(data)
    } catch (err) {
      logger.error('[useGroups] fetchGroups error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [authenticated])

  /**
   * Create a new group.
   * @param {string} name
   * @returns {Promise<object|null>} Created group or null on failure
   */
  const createGroup = useCallback(async (name) => {
    setError(null)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error(`Failed to create group: ${res.status}`)
      const group = await res.json()
      setGroups(prev => [...prev, group])
      trackEvent('Group Created')
      return group
    } catch (err) {
      logger.error('[useGroups] createGroup error:', err)
      setError(err.message)
      return null
    }
  }, [])

  /**
   * Invite a user to a group by their GitHub login.
   * @param {string|number} groupId
   * @param {string} login
   * @param {'member'|'owner'} role
   */
  const inviteMember = useCallback(async (groupId, login, role = 'member') => {
    setError(null)
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, role })
      })
      if (!res.ok) throw new Error(`Failed to invite member: ${res.status}`)
      trackEvent('Group Member Invited')
    } catch (err) {
      logger.error('[useGroups] inviteMember error:', err)
      setError(err.message)
    }
  }, [])

  /**
   * Remove a member from a group (or leave yourself).
   * @param {string|number} groupId
   * @param {string|number} githubId
   */
  const removeMember = useCallback(async (groupId, githubId) => {
    setError(null)
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${githubId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error(`Failed to remove member: ${res.status}`)
      trackEvent('Group Member Removed')
    } catch (err) {
      logger.error('[useGroups] removeMember error:', err)
      setError(err.message)
    }
  }, [])

  /**
   * Fetch shared config for a group.
   * @param {string|number} groupId
   * @returns {Promise<object|null>}
   */
  const getGroupConfig = useCallback(async (groupId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/config`, { credentials: 'include' })
      if (!res.ok) throw new Error(`Failed to get group config: ${res.status}`)
      return await res.json()
    } catch (err) {
      logger.error('[useGroups] getGroupConfig error:', err)
      setError(err.message)
      return null
    }
  }, [])

  /**
   * Update shared config for a group.
   * @param {string|number} groupId
   * @param {object} config
   */
  const updateGroupConfig = useCallback(async (groupId, config) => {
    setError(null)
    try {
      const res = await fetch(`/api/groups/${groupId}/config`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (!res.ok) throw new Error(`Failed to update group config: ${res.status}`)
      trackEvent('Group Config Updated')
    } catch (err) {
      logger.error('[useGroups] updateGroupConfig error:', err)
      setError(err.message)
    }
  }, [])

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    inviteMember,
    removeMember,
    getGroupConfig,
    updateGroupConfig
  }
}
