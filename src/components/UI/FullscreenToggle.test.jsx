import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FullscreenToggle } from './FullscreenToggle'

describe('FullscreenToggle Component - Critical Functionality', () => {
  it('toggles fullscreen when clicked', async () => {
    const onToggle = vi.fn()
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('exits fullscreen when already in fullscreen mode', async () => {
    const onToggle = vi.fn()
    render(<FullscreenToggle isFullscreen={true} onToggle={onToggle} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('is keyboard accessible', async () => {
    const onToggle = vi.fn()
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} />)
    
    const button = screen.getByRole('button')
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
