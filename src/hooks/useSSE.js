import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '../utils/logger'

// SSE Lambda endpoint URL (from Terraform outputs)
// Set VITE_SSE_ENDPOINT in your .env file or deployment environment
const SSE_ENDPOINT = import.meta.env.VITE_SSE_ENDPOINT || ''

/**
 * Connection states for SSE
 */
export const SSE_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting'
}

/**
 * Custom hook to manage Server-Sent Events (SSE) connection for real-time workflow updates
 *
 * @param {string|null} installationId - GitHub App installation ID for multi-tenant filtering
 * @param {boolean} enabled - Whether SSE connection should be active
 * @returns {Object} SSE state and methods
 */
export function useSSE(installationId, enabled = true) {
  const [status, setStatus] = useState(SSE_STATUS.DISCONNECTED)
  const [lastEvent, setLastEvent] = useState(null)
  const [error, setError] = useState(null)

  const eventSourceRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const eventCallbacksRef = useRef([])

  // Exponential backoff for reconnection (1s, 2s, 4s, 8s, 16s, max 30s)
  const getReconnectDelay = useCallback(() => {
    const baseDelay = 1000
    const maxDelay = 30000
    const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), maxDelay)
    return delay
  }, [])

  /**
   * Subscribe to SSE events
   * @param {Function} callback - Callback function to receive events
   * @returns {Function} Unsubscribe function
   */
  const subscribe = useCallback((callback) => {
    eventCallbacksRef.current.push(callback)
    logger.debug('[SSE] Subscriber added, total:', eventCallbacksRef.current.length)

    return () => {
      eventCallbacksRef.current = eventCallbacksRef.current.filter(cb => cb !== callback)
      logger.debug('[SSE] Subscriber removed, remaining:', eventCallbacksRef.current.length)
    }
  }, [])

  /**
   * Broadcast event to all subscribers
   */
  const broadcastEvent = useCallback((event) => {
    eventCallbacksRef.current.forEach(callback => {
      try {
        callback(event)
      } catch (err) {
        logger.error('[SSE] Error in event callback:', err)
      }
    })
  }, [])

  /**
   * Connect to SSE endpoint
   */
  const connect = useCallback(() => {
    if (!SSE_ENDPOINT) {
      logger.warn('[SSE] SSE endpoint not configured, set VITE_SSE_ENDPOINT environment variable')
      setStatus(SSE_STATUS.DISCONNECTED)
      return
    }

    if (!installationId) {
      logger.debug('[SSE] No installation ID, skipping connection')
      setStatus(SSE_STATUS.DISCONNECTED)
      return
    }

    if (!enabled) {
      logger.debug('[SSE] SSE disabled, skipping connection')
      return
    }

    // Don't reconnect if already connecting or connected
    if (status === SSE_STATUS.CONNECTING || status === SSE_STATUS.CONNECTED) {
      logger.debug('[SSE] Already connecting/connected, skipping')
      return
    }

    setStatus(SSE_STATUS.CONNECTING)
    setError(null)

    try {
      const url = `${SSE_ENDPOINT}?installation_id=${installationId}`
      logger.info('[SSE] Connecting to:', url)

      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        logger.info('[SSE] Connection opened')
        setStatus(SSE_STATUS.CONNECTED)
        setError(null)
        reconnectAttemptsRef.current = 0 // Reset reconnect counter on successful connection
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          logger.debug('[SSE] Received event:', data.type, data.repository)

          setLastEvent({
            ...data,
            receivedAt: new Date().toISOString()
          })

          // Broadcast to subscribers
          broadcastEvent(data)
        } catch (err) {
          logger.error('[SSE] Error parsing event data:', err)
        }
      }

      eventSource.onerror = (err) => {
        logger.error('[SSE] Connection error:', err)
        setStatus(SSE_STATUS.ERROR)
        setError('Connection failed')

        // Close the connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }

        // Attempt reconnection with exponential backoff
        if (enabled) {
          const delay = getReconnectDelay()
          reconnectAttemptsRef.current += 1

          logger.info(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`)
          setStatus(SSE_STATUS.RECONNECTING)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }
    } catch (err) {
      logger.error('[SSE] Failed to create EventSource:', err)
      setStatus(SSE_STATUS.ERROR)
      setError(err.message)
    }
  }, [installationId, enabled, status, broadcastEvent, getReconnectDelay])

  /**
   * Disconnect from SSE endpoint
   */
  const disconnect = useCallback(() => {
    logger.info('[SSE] Disconnecting')

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Close EventSource connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setStatus(SSE_STATUS.DISCONNECTED)
    setError(null)
    reconnectAttemptsRef.current = 0
  }, [])

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => connect(), 100)
  }, [disconnect, connect])

  // Auto-connect when installationId changes or enabled state changes
  useEffect(() => {
    if (enabled && installationId) {
      connect()
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [installationId, enabled]) // Note: connect/disconnect are stable via useCallback

  return {
    status,
    lastEvent,
    error,
    isConnected: status === SSE_STATUS.CONNECTED,
    isConnecting: status === SSE_STATUS.CONNECTING || status === SSE_STATUS.RECONNECTING,
    subscribe,
    reconnect,
    disconnect
  }
}
