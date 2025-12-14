import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RefreshButton } from './RefreshButton'

describe('RefreshButton Component - Critical Functionality', () => {
  describe('Refresh Action', () => {
    it('triggers refresh when clicked and not loading', async () => {
      const onRefresh = vi.fn()
      render(<RefreshButton onRefresh={onRefresh} loading={false} disabled={false} />)
      
      await userEvent.click(screen.getByRole('button'))
      expect(onRefresh).toHaveBeenCalledOnce()
    })

    it('prevents refresh when loading (prevents duplicate requests)', async () => {
      const onRefresh = vi.fn()
      render(<RefreshButton onRefresh={onRefresh} loading={true} disabled={false} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      await userEvent.click(button)
      expect(onRefresh).not.toHaveBeenCalled()
    })

    it('prevents refresh when explicitly disabled', async () => {
      const onRefresh = vi.fn()
      render(<RefreshButton onRefresh={onRefresh} loading={false} disabled={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      await userEvent.click(button)
      expect(onRefresh).not.toHaveBeenCalled()
    })

    it('prevents multiple rapid clicks during load', async () => {
      const onRefresh = vi.fn()
      const { rerender } = render(<RefreshButton onRefresh={onRefresh} loading={false} disabled={false} />)
      
      const button = screen.getByRole('button')
      await userEvent.click(button)
      
      // Simulate loading state after click
      rerender(<RefreshButton onRefresh={onRefresh} loading={true} disabled={false} />)
      
      // Try to click again while loading
      await userEvent.click(button)
      
      // Should only be called once
      expect(onRefresh).toHaveBeenCalledOnce()
    })
  })
})
