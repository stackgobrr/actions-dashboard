import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '../utils/logger'

const SSE_ENDPOINT = import.meta.env.VITE_SSE_ENDPOINT || '/api/events/stream'
const HEARTBEAT_TIMEOUT_MS = 45_000 // disconnect if no heartbeat for 45s
const RECONNECT_DELAY_MS = 5_000    // wait 5s before reconnecting

/**
 * Hook that opens a Server-Sent Events stream at /api/events/stream.
 * Falls back to polling when the stream is unavailable or the user is not
 * authenticated with a session cookie (oauth auth method).
 *
 * @param {boolean} enabled - Whether to open the stream (only when OAuth session active)
 * @param {Function} onEvent - Called with each parsed SSE event payload
 * @returns {{ connected: boolean, error: string|null }}
 */
export function useEventStream(enabled, onEvent) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const esRef = useRef(null)
  const heartbeatTimerRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const lastEventTimeRef = useRef(null)
  const onEventRef = useRef(onEvent)

  // Keep onEvent ref current without triggering effect re-runs
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const resetHeartbeatTimer = useCallback(() => {
    clearTimeout(heartbeatTimerRef.current)
    heartbeatTimerRef.current = setTimeout(() => {
      logger.warn('[useEventStream] No heartbeat received — reconnecting')
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
      setConnected(false)
    }, HEARTBEAT_TIMEOUT_MS)
  }, [])

  const openStream = useCallback(() => {
    if (esRef.current) return // already open

    const params = lastEventTimeRef.current
      ? `?since=${lastEventTimeRef.current}`
      : ''

    const es = new EventSource(`${SSE_ENDPOINT}${params}`, { withCredentials: true })
    esRef.current = es

    es.onopen = () => {
      setConnected(true)
      setError(null)
      resetHeartbeatTimer()
      logger.info('[useEventStream] Stream connected')
    }

    es.onmessage = (evt) => {
      resetHeartbeatTimer()
      if (!evt.data || evt.data.trim() === '') return // heartbeat comment line
      try {
        const payload = JSON.parse(evt.data)
        lastEventTimeRef.current = payload.received_at ?? Date.now()
        onEventRef.current?.(payload)
      } catch (err) {
        logger.error('[useEventStream] Failed to parse event:', err, evt.data)
      }
    }

    es.onerror = (err) => {
      logger.warn('[useEventStream] Stream error, scheduling reconnect', err)
      es.close()
      esRef.current = null
      setConnected(false)
      setError('Stream disconnected')
      clearTimeout(heartbeatTimerRef.current)
      // Schedule reconnect
      reconnectTimerRef.current = setTimeout(() => {
        if (enabled) openStream()
      }, RECONNECT_DELAY_MS)
    }
  }, [enabled, resetHeartbeatTimer])

  const closeStream = useCallback(() => {
    clearTimeout(heartbeatTimerRef.current)
    clearTimeout(reconnectTimerRef.current)
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    setConnected(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      closeStream()
      return
    }

    openStream()

    return () => closeStream()
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { connected, error }
}
