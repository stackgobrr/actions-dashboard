import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle Component - Critical Functionality', () => {
  it('toggles theme when clicked', async () => {
    const onToggle = vi.fn()
    render(<ThemeToggle theme="dark" onToggle={onToggle} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('is accessible via keyboard', async () => {
    const onToggle = vi.fn()
    render(<ThemeToggle theme="dark" onToggle={onToggle} />)
    
    const button = screen.getByRole('button')
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
