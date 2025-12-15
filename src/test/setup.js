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

// Mock window.matchMedia for Primer React ActionMenu
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
