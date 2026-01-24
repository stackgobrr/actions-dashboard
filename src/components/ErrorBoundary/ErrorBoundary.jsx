import { Component } from 'react'
import { Button } from '@primer/react'
import { AlertIcon } from '@primer/octicons-react'
import { trackEvent } from '../../utils/analytics'
import './ErrorBoundary.css'

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
    
    this.setState({
      error,
      errorInfo
    })
    
    // Track error event in Plausible
    trackEvent('Error Occurred', {
      errorMessage: error.toString(),
      errorType: error.name || 'Unknown',
      componentStack: errorInfo?.componentStack?.split('\n')[1]?.trim() || 'Unknown'
    })
    
    // Future: Send error to error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <AlertIcon size={48} className="error-boundary__icon" />
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__message">
              We're sorry, but something unexpected happened. You can try refreshing the page or going back.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-boundary__stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-boundary__actions">
              <Button variant="primary" onClick={this.handleReload}>
                Reload Page
              </Button>
              <Button onClick={this.handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
