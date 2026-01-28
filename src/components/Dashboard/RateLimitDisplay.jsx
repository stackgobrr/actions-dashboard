import { useState, useEffect } from 'react'
import { AlertIcon } from '@primer/octicons-react'

export function RateLimitDisplay({ rateLimit, loading, error }) {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    if (!rateLimit) return

    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000)
      const resetTime = rateLimit.reset
      const secondsRemaining = resetTime - now

      if (secondsRemaining <= 0) {
        setTimeRemaining('resetting...')
        return
      }

      const hours = Math.floor(secondsRemaining / 3600)
      const minutes = Math.floor((secondsRemaining % 3600) / 60)
      const seconds = secondsRemaining % 60

      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [rateLimit])

  if (loading) {
    return (
      <div className="d-flex flex-items-center color-fg-muted f6">
        Loading rate limit...
      </div>
    )
  }

  if (error) {
    return (
      <div className="d-flex flex-items-center color-fg-danger f6">
        <AlertIcon size={16} style={{ marginRight: '4px' }} />
        Failed to fetch rate limit
      </div>
    )
  }

  if (!rateLimit) {
    return null
  }

  const percentage = (rateLimit.remaining / rateLimit.limit) * 100
  const isLow = percentage < 20

  return (
    <div className={`d-flex flex-items-center f6 ${isLow ? 'color-fg-danger' : 'color-fg-muted'}`}>
      {isLow && <AlertIcon size={16} style={{ marginRight: '4px' }} />}
      <span>
        GitHub API: {rateLimit.remaining}/{rateLimit.limit} • resets in {timeRemaining}
      </span>
    </div>
  )
}
