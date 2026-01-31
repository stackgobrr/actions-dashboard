import { 
  CheckCircleIcon, 
  CircleSlashIcon, 
  ClockIcon, 
  AlertIcon,
  BlockedIcon,
  SkipIcon
} from '@primer/octicons-react'

/**
 * Returns the appropriate status icon component based on workflow status
 * @param {Object} status - The workflow status object
 * @returns {JSX.Element} Icon component
 */
export const getStatusIcon = (status) => {
  if (status.error) return <AlertIcon size={18} className="color-fg-danger" />
  if (status.status === 'completed') {
    if (status.conclusion === 'success') return <CheckCircleIcon size={18} className="color-fg-success" />
    if (status.conclusion === 'failure') return <CircleSlashIcon size={18} className="color-fg-danger" />
    if (status.conclusion === 'cancelled' || status.conclusion === 'timed_out') return <SkipIcon size={18} className="color-fg-attention" />
    return <AlertIcon size={18} className="color-fg-attention" />
  }
  if (status.status === 'queued' || status.status === 'pending') return <BlockedIcon size={18} className="color-fg-muted" />
  if (status.status === 'in_progress') return <ClockIcon size={18} className="color-fg-accent" />
  return <AlertIcon size={18} className="color-fg-muted" />
}

/**
 * Returns the CSS class for status styling
 * @param {Object} status - The workflow status object
 * @returns {string} CSS class name
 */
export const getStatusClass = (status) => {
  if (status.error) return 'error'
  if (status.status === 'completed') {
    if (status.conclusion === 'success') return 'success'
    if (status.conclusion === 'failure') return 'failure'
    return 'warning'
  }
  if (status.status === 'queued' || status.status === 'pending') return 'queued'
  if (status.status === 'in_progress') return 'in-progress'
  if (status.status === 'no_runs') return 'no_runs'
  return 'unknown'
}

/**
 * Generates consistent colors for category labels
 * @param {string} category - Category name
 * @returns {Object} Object with text, bg, and border color strings
 */
export const getLabelColor = (category) => {
  // Handle undefined/null/empty category
  if (!category) {
    return {
      textColor: 'var(--fgColor-muted)',
      bgColor: 'var(--bgColor-muted)',
      borderColor: 'var(--borderColor-default)'
    }
  }
  
  // Generate a unique color for each category name (like GitHub labels)
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  
  const hue = (Math.abs(hash) * 137.508) % 360
  const saturation = 60 + (Math.abs(hash) % 20)
  const lightness = 50 + (Math.abs(hash >> 8) % 15)
  const textLightness = 75 + (Math.abs(hash >> 16) % 10)
  const textColor = `hsl(${hue}, ${saturation}%, ${textLightness}%)`
  const bgColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.1)`
  const borderColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.25)`
  
  return { text: textColor, bg: bgColor, border: borderColor }
}

/**
 * Color palette for topics (matches GitHub label colors)
 */
const TOPIC_COLOR_PALETTE = [
  '#0969da', // blue
  '#1a7f37', // green
  '#cf222e', // red
  '#8250df', // purple
  '#bf8700', // yellow
  '#bc4c00', // orange
  '#1b7c83', // teal
  '#622cbc', // indigo
  '#c93c7e', // pink
  '#656d76'  // gray
]

/**
 * Assigns a consistent color to a topic based on its name
 * @param {string} topic - Topic name
 * @returns {string} Hex color code
 */
export const getTopicColor = (topic) => {
  // Handle undefined/null/empty topic
  if (!topic) {
    return TOPIC_COLOR_PALETTE[0] // Return first color as default
  }
  
  // Generate a consistent hash from the topic name
  let hash = 0
  for (let i = 0; i < topic.length; i++) {
    hash = topic.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Use the hash to select a color from the palette
  const index = Math.abs(hash) % TOPIC_COLOR_PALETTE.length
  return TOPIC_COLOR_PALETTE[index]
}
