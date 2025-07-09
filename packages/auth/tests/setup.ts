import { vi, beforeEach } from 'vitest'
import 'whatwg-fetch'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
vi.stubEnv('HMAC_SECRET_KEY', 'test-hmac-secret-key-minimum-32-chars')
vi.stubEnv('JWT_SECRET', 'test-jwt-secret')
vi.stubEnv('TOKEN_ENCRYPTION_KEY', 'test-encryption-key-32-chars-min')

// Mock crypto for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    randomUUID: () => '00000000-0000-4000-8000-000000000000',
    subtle: {
      generateKey: vi.fn().mockImplementation(async (algorithm: any, extractable: boolean, keyUsages: string[]) => {
        if (algorithm.name === 'ECDSA') {
          return {
            privateKey: {
              type: 'private',
              algorithm: { name: 'ECDSA', namedCurve: 'P-256' },
              extractable: false,
              usages: ['sign']
            },
            publicKey: {
              type: 'public',
              algorithm: { name: 'ECDSA', namedCurve: 'P-256' },
              extractable: true,
              usages: ['verify']
            }
          }
        }
        return {
          type: 'secret',
          algorithm: { name: algorithm.name },
          extractable,
          usages: keyUsages
        }
      }),
      importKey: vi.fn().mockImplementation(async (format: string, keyData: ArrayBuffer, algorithm: any, extractable: boolean, keyUsages: string[]) => {
        // Create a key object that includes the keyData for comparison
        const keyString = Array.from(new Uint8Array(keyData)).join(',')
        return { 
          type: 'secret', 
          algorithm, 
          extractable, 
          usages: keyUsages,
          _keyData: keyString // Store for comparison
        }
      }),
      encrypt: vi.fn().mockImplementation(async (algorithm: any, key: any, data: ArrayBuffer) => {
        // Create a deterministic "encrypted" result based on input and key
        const input = new Uint8Array(data)
        const keyHash = key._keyData ? key._keyData.split(',').reduce((a: number, b: string) => a + parseInt(b), 0) : 0x42
        const result = new ArrayBuffer(input.length + 16) // Add 16 bytes for auth tag
        const output = new Uint8Array(result)
        
        // Simple XOR "encryption" for testing using key-dependent value
        for (let i = 0; i < input.length; i++) {
          output[i] = input[i] ^ (keyHash & 0xff) // XOR with key-dependent value
        }
        
        // Add fake auth tag that depends on key
        for (let i = input.length; i < input.length + 16; i++) {
          output[i] = (i + keyHash) & 0xff
        }
        
        return result
      }),
      decrypt: vi.fn().mockImplementation(async (algorithm: any, key: any, data: ArrayBuffer) => {
        // Reverse the "encryption" process
        const input = new Uint8Array(data)
        const dataLength = input.length - 16 // Remove auth tag
        const keyHash = key._keyData ? key._keyData.split(',').reduce((a: number, b: string) => a + parseInt(b), 0) : 0x42
        
        // Verify the auth tag first (basic check)
        for (let i = dataLength; i < input.length; i++) {
          if (input[i] !== ((i + keyHash) & 0xff)) {
            throw new Error('Authentication tag verification failed')
          }
        }
        
        const result = new ArrayBuffer(dataLength)
        const output = new Uint8Array(result)
        
        // Simple XOR "decryption" for testing using key-dependent value
        for (let i = 0; i < dataLength; i++) {
          output[i] = input[i] ^ (keyHash & 0xff) // XOR with key-dependent value
        }
        
        return result
      }),
      sign: vi.fn().mockImplementation(async (algorithm: string, key: any, data: ArrayBuffer) => {
        // Create a deterministic signature based on the data content and key
        const dataArray = new Uint8Array(data)
        const dataString = String.fromCharCode(...dataArray)
        const keyHash = key._keyData ? key._keyData.split(',').reduce((a: number, b: string) => a + parseInt(b), 0) : 0x42
        
        let hash = keyHash // Start with key-dependent value
        for (let i = 0; i < dataString.length; i++) {
          const char = dataString.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32-bit integer
        }
        
        // Create a 32-byte ArrayBuffer with the hash repeated
        const result = new ArrayBuffer(32)
        const view = new Uint8Array(result)
        for (let i = 0; i < 32; i++) {
          view[i] = (hash + i) & 0xff
        }
        return result
      }),
      verify: vi.fn().mockImplementation(async (algorithm: string, key: any, signature: ArrayBuffer, data: ArrayBuffer) => {
        // Verify by regenerating the signature and comparing
        const expectedSignature = await global.crypto.subtle.sign(algorithm, key, data)
        const sig1 = new Uint8Array(signature)
        const sig2 = new Uint8Array(expectedSignature)
        
        if (sig1.length !== sig2.length) return false
        
        for (let i = 0; i < sig1.length; i++) {
          if (sig1[i] !== sig2[i]) return false
        }
        
        return true
      }),
      digest: vi.fn().mockImplementation(async (algorithm: string, data: ArrayBuffer) => {
        // Create a deterministic digest based on input
        const input = new Uint8Array(data)
        const result = new ArrayBuffer(32) // SHA-256 length
        const output = new Uint8Array(result)
        
        // Simple hash function for testing
        let hash = 0
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash) + input[i]
          hash = hash & hash // Convert to 32-bit integer
        }
        
        // Fill the output with the hash
        for (let i = 0; i < 32; i++) {
          output[i] = (hash + i) & 0xff
        }
        
        return result
      }),
      deriveKey: vi.fn().mockImplementation(async (algorithm: any, keyMaterial: any, derivedKeyAlgorithm: any, extractable: boolean, keyUsages: string[]) => {
        // Create a key that depends on the salt and keyMaterial
        const saltHash = algorithm.salt ? Array.from(new Uint8Array(algorithm.salt)).reduce((a: number, b: number) => a + b, 0) : 0
        const keyMaterialHash = keyMaterial._keyData ? keyMaterial._keyData.split(',').reduce((a: number, b: string) => a + parseInt(b), 0) : 0
        const combinedHash = saltHash + keyMaterialHash + algorithm.iterations
        
        return { 
          type: 'secret', 
          algorithm: derivedKeyAlgorithm, 
          extractable, 
          usages: keyUsages,
          _keyData: combinedHash.toString()
        }
      })
    }
  }
})

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
})

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
})

// Mock BroadcastChannel
global.BroadcastChannel = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn()
}))

// Mock window.location
Object.defineProperty(global, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    hostname: 'localhost',
    port: '3000',
    protocol: 'http:',
    search: '',
    hash: ''
  }
})

// Mock Navigator API for fingerprinting
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    platform: 'Test Platform',
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 4,
    deviceMemory: 8,
    maxTouchPoints: 0,
    onLine: true
  }
})

// Mock Screen API for fingerprinting
Object.defineProperty(global, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24
  }
})

// Mock Intl API for timezone detection
Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: () => ({
      resolvedOptions: () => ({
        timeZone: 'America/New_York'
      })
    })
  }
})

// Mock HTMLCanvasElement for fingerprinting
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: {
    prototype: {
      getContext: vi.fn().mockImplementation((contextType: string) => {
        if (contextType === 'webgl' || contextType === 'experimental-webgl') {
          return {
            canvas: { width: 200, height: 50 },
            getExtension: vi.fn().mockImplementation((extension: string) => {
              if (extension === 'WEBGL_debug_renderer_info') {
                return {
                  UNMASKED_VENDOR_WEBGL: 37445,
                  UNMASKED_RENDERER_WEBGL: 37446
                }
              }
              return null
            }),
            getParameter: vi.fn().mockImplementation((param: number) => {
              if (param === 37445) return 'Mock WebGL Vendor'
              if (param === 37446) return 'Mock WebGL Renderer'
              return null
            })
          }
        }
        return {
          canvas: { width: 200, height: 50 },
          fillStyle: '',
          font: '',
          textBaseline: '',
          fillText: vi.fn(),
          fillRect: vi.fn(),
          getImageData: vi.fn().mockReturnValue({
            data: new Uint8ClampedArray(40000)
          })
        }
      })
    }
  }
})

// Mock document.createElement for canvas elements
const originalCreateElement = global.document?.createElement
if (global.document) {
  global.document.createElement = vi.fn().mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        getContext: vi.fn().mockImplementation((contextType: string) => {
          if (contextType === 'webgl' || contextType === 'experimental-webgl') {
            return {
              canvas: { width: 200, height: 50 },
              getExtension: vi.fn().mockImplementation((extension: string) => {
                if (extension === 'WEBGL_debug_renderer_info') {
                  return {
                    UNMASKED_VENDOR_WEBGL: 37445,
                    UNMASKED_RENDERER_WEBGL: 37446
                  }
                }
                return null
              }),
              getParameter: vi.fn().mockImplementation((param: number) => {
                if (param === 37445) return 'Mock WebGL Vendor'
                if (param === 37446) return 'Mock WebGL Renderer'
                return null
              })
            }
          }
          return {
            canvas: { width: 200, height: 50 },
            fillStyle: '',
            font: '',
            textBaseline: '',
            fillText: vi.fn(),
            fillRect: vi.fn(),
            getImageData: vi.fn().mockReturnValue({
              data: new Uint8ClampedArray(40000)
            })
          }
        }),
        width: 200,
        height: 50
      }
    }
    return originalCreateElement ? originalCreateElement.call(global.document, tagName) : {}
  })
}

// Mock btoa/atob for base64 encoding/decoding
Object.defineProperty(global, 'btoa', {
  value: (str: string) => Buffer.from(str).toString('base64')
})

Object.defineProperty(global, 'atob', {
  value: (str: string) => Buffer.from(str, 'base64').toString()
})

// Mock window object with document
Object.defineProperty(global, 'window', {
  value: {
    document: global.document,
    navigator: global.navigator,
    screen: global.screen,
    location: global.location,
    localStorage: global.localStorage,
    sessionStorage: global.sessionStorage,
    btoa: global.btoa,
    atob: global.atob,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    postMessage: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    close: vi.fn(),
    open: vi.fn(),
    alert: vi.fn(),
    confirm: vi.fn(),
    prompt: vi.fn(),
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval
  }
})

// Mock fetch
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ ip: '127.0.0.1' }),
    text: () => Promise.resolve('127.0.0.1')
  })
)

// Mock TextEncoder/TextDecoder
global.TextEncoder = class TextEncoder {
  encode(str: string) {
    // Handle both string and other types
    if (typeof str !== 'string') {
      str = String(str)
    }
    return new Uint8Array(str.split('').map(c => c.charCodeAt(0)))
  }
}

global.TextDecoder = class TextDecoder {
  decode(arr: Uint8Array | ArrayBuffer) {
    // Handle both Uint8Array and ArrayBuffer
    if (arr instanceof ArrayBuffer) {
      arr = new Uint8Array(arr)
    }
    return String.fromCharCode(...arr)
  }
}

// Mock additional environment variables
vi.stubEnv('JWT_PRIVATE_KEY', 'test-jwt-private-key')
vi.stubEnv('JWT_PUBLIC_KEY', 'test-jwt-public-key')
vi.stubEnv('NEXT_PUBLIC_COOKIE_DOMAIN', 'localhost')

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  
  // Reset canvas mocks
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockClear()
  if (global.document?.createElement) {
    vi.mocked(global.document.createElement).mockClear()
  }
  
  // Reset window event listeners
  if (global.window?.addEventListener) {
    vi.mocked(global.window.addEventListener).mockClear()
  }
  if (global.window?.removeEventListener) {
    vi.mocked(global.window.removeEventListener).mockClear()
  }
})