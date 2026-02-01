/**
 * Timing constants for animations, intervals, and timeouts
 */

// Refresh intervals (in seconds)
// With GraphQL batching (1-2 queries vs 100+ REST calls), we can poll more frequently
export const DEFAULT_REFRESH_INTERVAL = 5  // Reduced from 10s - GraphQL makes this efficient
export const MIN_REFRESH_INTERVAL = 1      // Minimum safe interval
export const MAX_REFRESH_INTERVAL = 300

// Available refresh interval options (in seconds)
export const REFRESH_INTERVAL_OPTIONS = [1, 2, 3, 5, 10]

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = 1000
export const INITIAL_LOAD_ANIMATION_DURATION = 1000

// Timeouts (in milliseconds)
export const FULLSCREEN_TRANSITION_TIMEOUT = 100
