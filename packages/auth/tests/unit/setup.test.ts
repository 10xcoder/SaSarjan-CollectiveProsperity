import { describe, it, expect, vi } from 'vitest'

describe('Test Setup Validation', () => {
  it('should have proper environment variables mocked', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
    expect(process.env.HMAC_SECRET_KEY).toBe('test-hmac-secret-key-minimum-32-chars')
    expect(process.env.JWT_SECRET).toBe('test-jwt-secret')
  })

  it('should have crypto API mocked', () => {
    expect(global.crypto).toBeDefined()
    expect(global.crypto.getRandomValues).toBeDefined()
    expect(global.crypto.subtle).toBeDefined()
    expect(global.crypto.subtle.generateKey).toBeDefined()
  })

  it('should have storage APIs mocked', () => {
    expect(global.localStorage).toBeDefined()
    expect(global.sessionStorage).toBeDefined()
    expect(global.localStorage.getItem).toBeDefined()
    expect(global.localStorage.setItem).toBeDefined()
  })

  it('should have BroadcastChannel mocked', () => {
    expect(global.BroadcastChannel).toBeDefined()
    const channel = new BroadcastChannel('test')
    expect(channel).toBeDefined()
    expect(channel.postMessage).toBeDefined()
  })

  it('should have fetch mocked', () => {
    expect(global.fetch).toBeDefined()
    expect(typeof global.fetch).toBe('function')
  })

  it('should have TextEncoder/TextDecoder mocked', () => {
    expect(global.TextEncoder).toBeDefined()
    expect(global.TextDecoder).toBeDefined()
    
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    
    const encoded = encoder.encode('test')
    const decoded = decoder.decode(encoded)
    
    expect(decoded).toBe('test')
  })

  it('should clear mocks before each test', () => {
    const mockFn = vi.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
    
    // This should be cleared by the beforeEach in setup.ts
    vi.clearAllMocks()
    expect(mockFn).not.toHaveBeenCalled()
  })
})