import { useEffect, useState } from 'react'
import { XIcon } from '@primer/octicons-react'
import { IconButton } from '@primer/react'

export function HotkeyHelper({ isOpen, onClose }) {
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

  const hotkeys = [
    { key: 'H', description: 'Show/hide this hotkey helper' },
    { key: 'R', description: 'Refresh workflow statuses' },
    { key: 'F', description: 'Toggle fullscreen mode' },
    { key: 'T', description: 'Toggle light/dark theme' },
    { key: 'S', description: 'Open settings/repository configuration' },
    { key: 'ESC', description: 'Close this dialog' },
  ]

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
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
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
            Keyboard Shortcuts
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
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hotkeys.map(({ key, description }) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <kbd
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '40px',
                    height: '32px',
                    padding: '0 8px',
                    backgroundColor: 'var(--bgColor-muted)',
                    border: '1px solid var(--borderColor-default)',
                    borderRadius: '6px',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--fgColor-default)',
                    boxShadow: '0 1px 0 var(--borderColor-default)',
                  }}
                >
                  {key}
                </kbd>
                <span className="f5 color-fg-default">{description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--borderColor-default)',
            backgroundColor: 'var(--bgColor-muted)',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <p className="f6 color-fg-muted mb-0 text-center">
            Press <kbd style={{ 
              padding: '2px 6px', 
              backgroundColor: 'var(--bgColor-default)', 
              border: '1px solid var(--borderColor-default)', 
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>H</kbd> anytime to toggle this helper
          </p>
        </div>
      </div>
    </>
  )
}
