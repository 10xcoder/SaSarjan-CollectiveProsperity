import { describe, it, expect, beforeEach, vi } from 'vitest'
import { csrfProtection, withCsrfProtection, getCsrfToken } from '@/server/csrf-middleware'
import type { CsrfOptions } from '@/server/csrf-middleware'
import { createCookieHandler } from '@/server/cookie-handler'

// Mock Node.js request/response objects with cookie simulation
const createMockRequestResponse = (headers: Record<string, string> = {}, cookies: Record<string, string> = {}) => {
  const cookieString = Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
  const cookieJar = { ...cookies }
  
  const mockRequest = {
    headers: {
      cookie: cookieString,
      ...headers
    },
    method: 'POST',
    url: '/api/test',
    path: '/api/test',
    body: {},
    query: {}
  }
  
  const mockResponse = {
    getHeader: (name: string) => {
      if (name === 'Set-Cookie') return undefined
      return undefined
    },
    setHeader: (name: string, value: string | string[]) => {
      if (name === 'Set-Cookie') {
        // Simulate setting cookies by parsing Set-Cookie headers
        const cookieHeaders = Array.isArray(value) ? value : [value]
        cookieHeaders.forEach(cookieHeader => {
          const [nameValue] = cookieHeader.split(';')
          const [cookieName, cookieValue] = nameValue.split('=')
          if (cookieName && cookieValue) {
            cookieJar[cookieName] = cookieValue
            // Update the request cookie header
            const newCookieString = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ')
            mockRequest.headers.cookie = newCookieString
          }
        })
      }
    },
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  }
  
  return { mockRequest, mockResponse }
}

const createMockRequest = (headers: Record<string, string> = {}, cookies: Record<string, string> = {}) => {
  return createMockRequestResponse(headers, cookies).mockRequest
}

const createMockResponse = () => {
  return createMockRequestResponse().mockResponse
}

describe('CSRF Protection', () => {
  let csrfOptions: CsrfOptions
  let mockRequest: any
  let mockResponse: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    csrfOptions = {
      excludePaths: ['/api/auth/login'],
      tokenName: 'sasarjan-csrf-token',
      headerName: 'x-csrf-token',
      cookieOptions: {
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600
      }
    }

    mockRequest = createMockRequest()
    mockResponse = createMockResponse()
  })

  describe('csrfProtection middleware', () => {
    it('should allow GET requests without CSRF token', () => {
      const getRequest = {
        ...mockRequest,
        method: 'GET'
      }
      
      // Initialize cookie handler
      getRequest.cookies = createCookieHandler(getRequest, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(getRequest, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })

    it('should allow HEAD requests without CSRF token', () => {
      const headRequest = {
        ...mockRequest,
        method: 'HEAD'
      }
      
      // Initialize cookie handler
      headRequest.cookies = createCookieHandler(headRequest, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(headRequest, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })

    it('should allow OPTIONS requests without CSRF token', () => {
      const optionsRequest = {
        ...mockRequest,
        method: 'OPTIONS'
      }
      
      // Initialize cookie handler
      optionsRequest.cookies = createCookieHandler(optionsRequest, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(optionsRequest, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })

    it('should reject POST requests without CSRF token', () => {
      // Initialize cookie handler
      mockRequest.cookies = createCookieHandler(mockRequest, mockResponse)
      
      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(mockRequest, mockResponse, next)

      expect(next).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh the page and try again.'
      })
    })

    it('should reject POST requests with invalid CSRF token', () => {
      const requestWithInvalidToken = createMockRequest({
        'x-csrf-token': 'invalid-token'
      }, {
        'sasarjan-csrf-token': 'valid-cookie-token'
      })
      
      // Initialize cookie handler
      requestWithInvalidToken.cookies = createCookieHandler(requestWithInvalidToken, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(requestWithInvalidToken, mockResponse, next)

      expect(next).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh the page and try again.'
      })
    })

    it('should allow POST requests with valid CSRF token', () => {
      // Create request-response pair with cookie simulation
      const { mockRequest, mockResponse } = createMockRequestResponse()
      mockRequest.cookies = createCookieHandler(mockRequest, mockResponse)
      
      // Generate a valid CSRF token
      const csrfToken = mockRequest.cookies.getCsrfToken()
      
      // Update request with the token
      mockRequest.headers['x-csrf-token'] = csrfToken

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(mockRequest, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })

    it('should reject requests with mismatched header and cookie tokens', () => {
      const requestWithMismatchedTokens = createMockRequest({
        'x-csrf-token': 'header-token'
      }, {
        'sasarjan-csrf-token': 'cookie-token'
      })
      
      // Initialize cookie handler
      requestWithMismatchedTokens.cookies = createCookieHandler(requestWithMismatchedTokens, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(requestWithMismatchedTokens, mockResponse, next)

      expect(next).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh the page and try again.'
      })
    })

    it('should handle custom header names', () => {
      const customOptions = {
        ...csrfOptions,
        headerName: 'x-custom-csrf-token'
      }

      const { mockRequest, mockResponse } = createMockRequestResponse()
      mockRequest.cookies = createCookieHandler(mockRequest, mockResponse)
      
      const csrfToken = mockRequest.cookies.getCsrfToken()
      mockRequest.headers['x-custom-csrf-token'] = csrfToken

      const middleware = csrfProtection(customOptions)
      const next = vi.fn()

      middleware(mockRequest, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })

    it('should handle custom token names', () => {
      const customOptions = {
        ...csrfOptions,
        tokenName: 'custom-csrf-token'
      }

      const requestWithCustomToken = createMockRequest()
      requestWithCustomToken.cookies = createCookieHandler(requestWithCustomToken, mockResponse)
      
      // Mock the token name in the cookie handler
      const originalGetCsrfToken = requestWithCustomToken.cookies.getCsrfToken
      requestWithCustomToken.cookies.getCsrfToken = () => 'test-token'
      requestWithCustomToken.cookies.validateCsrfToken = (token: string) => token === 'test-token'
      
      requestWithCustomToken.headers['x-csrf-token'] = 'test-token'

      const middleware = csrfProtection(customOptions)
      const next = vi.fn()

      middleware(requestWithCustomToken, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('withCsrfProtection wrapper', () => {
    it('should wrap handlers with CSRF protection', async () => {
      const { mockRequest, mockResponse } = createMockRequestResponse()
      mockRequest.cookies = createCookieHandler(mockRequest, mockResponse)
      
      const csrfToken = mockRequest.cookies.getCsrfToken()
      mockRequest.headers['x-csrf-token'] = csrfToken

      const originalHandler = vi.fn().mockResolvedValue(undefined)
      const wrappedHandler = withCsrfProtection(originalHandler, csrfOptions)

      await wrappedHandler(mockRequest, mockResponse)

      expect(originalHandler).toHaveBeenCalledWith(mockRequest, mockResponse)
    })

    it('should reject requests without valid CSRF tokens', async () => {
      const requestWithoutToken = createMockRequest()
      requestWithoutToken.cookies = createCookieHandler(requestWithoutToken, mockResponse)

      const originalHandler = vi.fn().mockResolvedValue(undefined)
      const wrappedHandler = withCsrfProtection(originalHandler, csrfOptions)

      await wrappedHandler(requestWithoutToken, mockResponse)

      expect(originalHandler).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(403)
    })
  })

  describe('getCsrfToken', () => {
    it('should generate valid CSRF tokens', () => {
      const mockReq = createMockRequest()
      mockReq.cookies = createCookieHandler(mockReq, mockResponse)
      
      const token = getCsrfToken(mockReq)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate different tokens each time', () => {
      const mockReq1 = createMockRequest()
      mockReq1.cookies = createCookieHandler(mockReq1, mockResponse)
      
      const mockReq2 = createMockRequest()
      mockReq2.cookies = createCookieHandler(mockReq2, mockResponse)
      
      const token1 = getCsrfToken(mockReq1)
      const token2 = getCsrfToken(mockReq2)

      expect(token1).not.toBe(token2)
    })

    it('should generate tokens that can be verified', () => {
      const { mockRequest, mockResponse } = createMockRequestResponse()
      mockRequest.cookies = createCookieHandler(mockRequest, mockResponse)
      
      const token = getCsrfToken(mockRequest)
      
      // Add token to request headers
      mockRequest.headers['x-csrf-token'] = token

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(mockRequest, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('Token Timing Attacks', () => {
    it('should use constant-time comparison for token verification', () => {
      const { mockRequest: requestWithValidToken, mockResponse: mockResponse1 } = createMockRequestResponse()
      requestWithValidToken.cookies = createCookieHandler(requestWithValidToken, mockResponse1)
      
      const validToken = requestWithValidToken.cookies.getCsrfToken()
      const invalidToken = 'a'.repeat(validToken.length)
      
      requestWithValidToken.headers['x-csrf-token'] = validToken

      const { mockRequest: requestWithInvalidToken, mockResponse: mockResponse2 } = createMockRequestResponse({
        'x-csrf-token': invalidToken
      }, {
        'sasarjan-csrf-token': validToken
      })
      requestWithInvalidToken.cookies = createCookieHandler(requestWithInvalidToken, mockResponse2)

      const middleware = csrfProtection(csrfOptions)
      const next1 = vi.fn()
      const next2 = vi.fn()

      // Both should take similar time to process
      const start1 = performance.now()
      middleware(requestWithValidToken, mockResponse1, next1)
      const time1 = performance.now() - start1

      const start2 = performance.now()
      middleware(requestWithInvalidToken, mockResponse2, next2)
      const time2 = performance.now() - start2

      // Time difference should be minimal (accounting for test environment variance)
      const timeDiff = Math.abs(time1 - time2)
      expect(timeDiff).toBeLessThan(5) // 5ms tolerance
      
      expect(next1).toHaveBeenCalled()
      expect(next2).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed tokens gracefully', () => {
      const requestWithMalformedToken = createMockRequest({
        'x-csrf-token': 'not-a-valid-token-format'
      }, {
        'sasarjan-csrf-token': 'not-a-valid-token-format'
      })
      
      requestWithMalformedToken.cookies = createCookieHandler(requestWithMalformedToken, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(requestWithMalformedToken, mockResponse, next)

      expect(next).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh the page and try again.'
      })
    })

    it('should handle missing cookie gracefully', () => {
      const requestWithMissingCookie = createMockRequest({
        'x-csrf-token': 'header-token'
      }, {
        // No csrf-token cookie
      })
      
      requestWithMissingCookie.cookies = createCookieHandler(requestWithMissingCookie, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(requestWithMissingCookie, mockResponse, next)

      expect(next).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh the page and try again.'
      })
    })

    it('should handle excluded paths', () => {
      const requestToExcludedPath = createMockRequest()
      requestToExcludedPath.path = '/api/auth/login'
      requestToExcludedPath.url = '/api/auth/login'
      requestToExcludedPath.cookies = createCookieHandler(requestToExcludedPath, mockResponse)

      const middleware = csrfProtection(csrfOptions)
      const next = vi.fn()

      middleware(requestToExcludedPath, mockResponse, next)

      expect(next).toHaveBeenCalled()
    })
  })
})