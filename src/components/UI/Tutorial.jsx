import { useState, useEffect } from 'react'
import { Button, IconButton } from '@primer/react'
import { XIcon, ChevronRightIcon, ChevronLeftIcon } from '@primer/octicons-react'
import './Tutorial.css'

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Actions Dashboard! 🎉',
    description: 'This interactive tour will show you how to use the dashboard. You can exit anytime by pressing ESC or clicking the × button.',
    target: null,
    position: 'center'
  },
  {
    title: 'Repository Cards',
    description: 'Each card shows the status of a repository\'s latest GitHub Actions workflow. Green means success, red means failure, yellow means in progress.',
    target: '.repo-card',
    position: 'bottom'
  },
  {
    title: 'Workflow Information',
    description: 'View the workflow name, branch, and commit message. Click the link icon at the bottom to view the full workflow run on GitHub.',
    target: '.repo-card__body',
    position: 'right'
  },
  {
    title: 'Pull Request Badge',
    description: 'When a repository has open pull requests, you\'ll see a red badge in the top-right corner. Click it to view all PRs.',
    target: '.repo-card__pr-badge',
    position: 'bottom',
    optional: true
  },
  {
    title: 'Filters & Sorting',
    description: 'Use the topic and owner filters to narrow down repositories. Sort by last run time, alphabetically, or by status.',
    target: '.dashboard-header-actions',
    position: 'left'
  },
  {
    title: 'Auto-Refresh',
    description: 'Enable auto-refresh to keep your dashboard up-to-date. You can also manually refresh at any time.',
    target: '.dashboard-header-actions',
    position: 'left'
  },
  {
    title: 'Configure Repositories',
    description: 'Click here to select which repositories to monitor. You can add or remove repositories from your dashboard.',
    target: 'button:has-text("Configure Repositories")',
    position: 'bottom',
    selector: '.d-flex.flex-items-center.mb-3 button'
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Press ? to view all available keyboard shortcuts. Quick tip: Press R to refresh, F for fullscreen, and S for settings.',
    target: null,
    position: 'center'
  },
  {
    title: 'Ready to Connect?',
    description: 'You\'re viewing demo data. To monitor your own repositories, logout and connect with a Personal Access Token or GitHub App.',
    target: null,
    position: 'center'
  }
]

export function Tutorial({ onComplete, isDemoMode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [show, setShow] = useState(false)
  const [targetElement, setTargetElement] = useState(null)

  useEffect(() => {
    // Only show tutorial in demo mode if user hasn't seen it
    if (isDemoMode) {
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
      if (!hasSeenTutorial) {
        setShow(true)
      }
    }
  }, [isDemoMode])

  useEffect(() => {
    if (!show) return

    const step = TUTORIAL_STEPS[currentStep]
    
    // Find target element if specified
    if (step.target) {
      let element
      if (step.selector) {
        element = document.querySelector(step.selector)
      } else {
        element = document.querySelector(step.target)
      }
      
      // If element not found and it's optional, skip to next step
      if (!element && step.optional) {
        handleNext()
        return
      }
      
      setTargetElement(element)
      
      // Scroll element into view
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      setTargetElement(null)
    }
  }, [currentStep, show])

  useEffect(() => {
    if (!show) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show, currentStep])

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true')
    setShow(false)
    if (onComplete) onComplete()
  }

  const handleClose = () => {
    localStorage.setItem('hasSeenTutorial', 'true')
    setShow(false)
    if (onComplete) onComplete()
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!show) return null

  const step = TUTORIAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100

  // Calculate position for the tooltip
  const getTooltipStyle = () => {
    if (!targetElement || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002
      }
    }

    const rect = targetElement.getBoundingClientRect()
    const style = { position: 'fixed', zIndex: 10002 }

    switch (step.position) {
      case 'bottom':
        style.top = `${rect.bottom + 20}px`
        style.left = `${rect.left + rect.width / 2}px`
        style.transform = 'translateX(-50%)'
        break
      case 'top':
        style.bottom = `${window.innerHeight - rect.top + 20}px`
        style.left = `${rect.left + rect.width / 2}px`
        style.transform = 'translateX(-50%)'
        break
      case 'left':
        style.top = `${rect.top + rect.height / 2}px`
        style.right = `${window.innerWidth - rect.left + 20}px`
        style.transform = 'translateY(-50%)'
        break
      case 'right':
        style.top = `${rect.top + rect.height / 2}px`
        style.left = `${rect.right + 20}px`
        style.transform = 'translateY(-50%)'
        break
      default:
        style.top = '50%'
        style.left = '50%'
        style.transform = 'translate(-50%, -50%)'
    }

    return style
  }

  return (
    <>
      {/* Overlay */}
      <div className="tutorial-overlay" onClick={handleClose} />
      
      {/* Highlight target element */}
      {targetElement && (
        <div 
          className="tutorial-highlight"
          style={{
            position: 'fixed',
            top: `${targetElement.getBoundingClientRect().top - 4}px`,
            left: `${targetElement.getBoundingClientRect().left - 4}px`,
            width: `${targetElement.getBoundingClientRect().width + 8}px`,
            height: `${targetElement.getBoundingClientRect().height + 8}px`,
            zIndex: 10001
          }}
        />
      )}

      {/* Tooltip */}
      <div className="tutorial-tooltip" style={getTooltipStyle()}>
        <div className="tutorial-tooltip__header">
          <div className="tutorial-tooltip__progress">
            <div 
              className="tutorial-tooltip__progress-bar" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <IconButton
            icon={XIcon}
            variant="invisible"
            aria-label="Close tutorial"
            onClick={handleClose}
            size="small"
          />
        </div>

        <div className="tutorial-tooltip__body">
          <h3 className="tutorial-tooltip__title">{step.title}</h3>
          <p className="tutorial-tooltip__description">{step.description}</p>
        </div>

        <div className="tutorial-tooltip__footer">
          <div className="tutorial-tooltip__counter">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </div>
          <div className="tutorial-tooltip__actions">
            {currentStep === 0 && (
              <Button variant="invisible" size="small" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            {currentStep > 0 && (
              <Button
                variant="invisible"
                size="small"
                onClick={handlePrevious}
                leadingVisual={ChevronLeftIcon}
              >
                Previous
              </Button>
            )}
            <Button
              variant="primary"
              size="small"
              onClick={handleNext}
              trailingVisual={currentStep < TUTORIAL_STEPS.length - 1 ? ChevronRightIcon : undefined}
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Finish'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
