import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = vi.fn()

// Mock adoptedStyleSheets for Primer React components
Object.defineProperty(document, 'adoptedStyleSheets', {
  writable: true,
  value: []
})

// Mock ShadowRoot adoptedStyleSheets
if (typeof ShadowRoot !== 'undefined') {
  Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
    get() { return [] },
    set() {}
  })
}
