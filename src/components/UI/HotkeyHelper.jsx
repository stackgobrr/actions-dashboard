import { Modal } from './Modal'

export function HotkeyHelper({ isOpen, onClose }) {
  const hotkeys = [
    { key: 'H', description: 'Show/hide this hotkey helper' },
    { key: 'R', description: 'Refresh workflow statuses' },
    { key: 'F', description: 'Toggle fullscreen mode' },
    { key: 'T', description: 'Toggle light/dark theme' },
    { key: 'S', description: 'Open settings/repository configuration' },
    { key: 'A', description: 'Show/hide GitHub API rate limit' },
    { key: 'ESC', description: 'Close this dialog' },
  ]

  const footer = (
    <p className="f6 color-fg-muted mb-0 text-center">
      Press <kbd style={{ 
        padding: '2px 6px', 
        backgroundColor: 'var(--bgColor-default)', 
        border: '1px solid var(--borderColor-default)', 
        borderRadius: '3px',
        fontFamily: 'monospace'
      }}>H</kbd> anytime to toggle this helper
    </p>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" footer={footer}>
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
              className="f5 text-semibold"
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
    </Modal>
  )
}
