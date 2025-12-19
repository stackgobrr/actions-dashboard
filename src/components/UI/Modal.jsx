import { useEffect } from 'react'
import { XIcon } from '@primer/octicons-react'
import { IconButton } from '@primer/react'

/**
 * Shared Modal component for consistent dialog styling
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} maxWidth - Maximum width of modal (default: '500px')
 * @param {ReactNode} footer - Optional footer content
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = '500px', footer }) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--bgColor-default)',
          border: '1px solid var(--borderColor-default)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          maxWidth,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--borderColor-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
            {title}
          </h2>
          <IconButton
            icon={XIcon}
            onClick={onClose}
            aria-label="Close"
            size="medium"
            className="color-fg-muted"
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--borderColor-default)',
              backgroundColor: 'var(--bgColor-muted)',
              borderRadius: '0 0 12px 12px',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
