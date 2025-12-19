import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>
  }

  it('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    await userEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const { container } = render(<Modal {...defaultProps} onClose={onClose} />)
    
    const backdrop = container.firstChild
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders optional footer when provided', () => {
    const footer = <div>Footer Content</div>
    render(<Modal {...defaultProps} footer={footer} />)
    
    expect(screen.getByText('Footer Content')).toBeInTheDocument()
  })

  it('does not render footer when not provided', () => {
    render(<Modal {...defaultProps} />)
    
    const footerElement = screen.queryByText('Footer Content')
    expect(footerElement).not.toBeInTheDocument()
  })

  it('applies custom maxWidth when provided', () => {
    const { container } = render(<Modal {...defaultProps} maxWidth="800px" />)
    
    const modalElement = container.querySelector('[style*="maxWidth"]')
    expect(modalElement).toHaveStyle({ maxWidth: '800px' })
  })

  it('uses default maxWidth when not provided', () => {
    const { container } = render(<Modal {...defaultProps} />)
    
    const modalElement = container.querySelector('[style*="maxWidth"]')
    expect(modalElement).toHaveStyle({ maxWidth: '500px' })
  })
})
