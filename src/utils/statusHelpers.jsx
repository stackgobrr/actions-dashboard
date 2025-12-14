import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  AlertIcon
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
    if (status.conclusion === 'failure') return <XCircleIcon size={18} className="color-fg-danger" />
    return <AlertIcon size={18} className="color-fg-attention" />
  }
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
