import { vi, beforeEach } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

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
      digest: vi.fn().mockImplementation(async (algorithm: string, data: ArrayBuffer) => {
        const input = new Uint8Array(data)
        const result = new ArrayBuffer(32) // SHA-256 length
        const output = new Uint8Array(result)
        
        // Simple hash function for testing
        let hash = 0
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash) + input[i]
          hash = hash & hash // Convert to 32-bit integer
        }
        
        for (let i = 0; i < 32; i++) {
          output[i] = (hash + i) & 0xff
        }
        
        return result
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

// Mock fetch
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
)

// Mock TextEncoder/TextDecoder
global.TextEncoder = class TextEncoder {
  encode(str: string) {
    if (typeof str !== 'string') {
      str = String(str)
    }
    return new Uint8Array(str.split('').map(c => c.charCodeAt(0)))
  }
}

global.TextDecoder = class TextDecoder {
  decode(arr: Uint8Array | ArrayBuffer) {
    if (arr instanceof ArrayBuffer) {
      arr = new Uint8Array(arr)
    }
    return String.fromCharCode(...arr)
  }
}

// Mock Date for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z')
vi.setSystemTime(mockDate)

// Mock dependencies commonly used in job-board
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signIn: vi.fn(() => Promise.resolve({ data: null, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        download: vi.fn(() => Promise.resolve({ data: null, error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    },
  })),
}))

// Mock nanoid for consistent IDs
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123'),
}))

// Mock date-fns functions
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === 'yyyy-MM-dd') return '2024-01-01'
    if (formatStr === 'PPP') return 'January 1st, 2024'
    return date.toISOString()
  }),
  formatDistance: vi.fn(() => 'about 1 hour ago'),
  parseISO: vi.fn((str: string) => new Date(str)),
  isValid: vi.fn(() => true),
  differenceInDays: vi.fn(() => 1),
  addDays: vi.fn((date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: vi.fn((date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
}))

// Mock Fuse.js for search functionality
vi.mock('fuse.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    search: vi.fn(() => [
      { item: { id: '1', title: 'Test Job' }, score: 0.1 },
      { item: { id: '2', title: 'Another Job' }, score: 0.3 },
    ]),
  })),
}))

// Mock ml-matrix for matching algorithms
vi.mock('ml-matrix', () => ({
  Matrix: vi.fn().mockImplementation(() => ({
    dot: vi.fn(() => ({
      get: vi.fn(() => 0.85),
    })),
    transpose: vi.fn(() => ({})),
    to2DArray: vi.fn(() => [[1, 0], [0, 1]]),
  })),
}))

// Mock natural for text processing
vi.mock('natural', () => ({
  PorterStemmer: {
    stem: vi.fn((word: string) => word.toLowerCase()),
  },
  TfIdf: vi.fn().mockImplementation(() => ({
    addDocument: vi.fn(),
    tfidfs: vi.fn((term: string, callback: (i: number, measure: number) => void) => {
      callback(0, 0.5)
    }),
  })),
  WordTokenizer: vi.fn().mockImplementation(() => ({
    tokenize: vi.fn((text: string) => text.split(' ')),
  })),
  SentimentAnalyzer: {
    getSentiment: vi.fn(() => 0.7),
  },
}))

// Mock compromise for text analysis
vi.mock('compromise', () => ({
  default: vi.fn().mockImplementation(() => ({
    match: vi.fn(() => ({
      out: vi.fn(() => ['skill1', 'skill2']),
    })),
    nouns: vi.fn(() => ({
      out: vi.fn(() => ['developer', 'engineer']),
    })),
  })),
}))

// Mock lodash utilities
vi.mock('lodash', () => ({
  debounce: vi.fn((fn: Function) => fn),
  throttle: vi.fn((fn: Function) => fn),
  uniq: vi.fn((arr: any[]) => [...new Set(arr)]),
  sortBy: vi.fn((arr: any[], key: string) => [...arr].sort((a, b) => a[key] - b[key])),
  groupBy: vi.fn((arr: any[], key: string) => {
    const groups: any = {}
    arr.forEach(item => {
      const group = item[key]
      if (!groups[group]) groups[group] = []
      groups[group].push(item)
    })
    return groups
  }),
  pick: vi.fn((obj: any, keys: string[]) => {
    const result: any = {}
    keys.forEach(key => {
      if (key in obj) result[key] = obj[key]
    })
    return result
  }),
  omit: vi.fn((obj: any, keys: string[]) => {
    const result = { ...obj }
    keys.forEach(key => delete result[key])
    return result
  }),
  cloneDeep: vi.fn((obj: any) => JSON.parse(JSON.stringify(obj))),
  isEqual: vi.fn((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)),
}))

// Mock currency.js for salary calculations
vi.mock('currency.js', () => ({
  default: vi.fn().mockImplementation((value: number) => ({
    value,
    format: vi.fn(() => `$${value.toFixed(2)}`),
    add: vi.fn(() => ({ value: value + 100 })),
    subtract: vi.fn(() => ({ value: Math.max(0, value - 100) })),
    multiply: vi.fn(() => ({ value: value * 2 })),
    divide: vi.fn(() => ({ value: value / 2 })),
  })),
}))

// Mock validator for input validation
vi.mock('validator', () => ({
  isEmail: vi.fn((email: string) => email.includes('@')),
  isURL: vi.fn((url: string) => url.startsWith('http')),
  isLength: vi.fn((str: string, options: any) => {
    if (options.min && str.length < options.min) return false
    if (options.max && str.length > options.max) return false
    return true
  }),
  isAlpha: vi.fn((str: string) => /^[a-zA-Z]+$/.test(str)),
  isNumeric: vi.fn((str: string) => /^[0-9]+$/.test(str)),
  isDecimal: vi.fn((str: string) => /^[0-9]+(\.[0-9]+)?$/.test(str)),
  normalizeEmail: vi.fn((email: string) => email.toLowerCase()),
  escape: vi.fn((str: string) => str.replace(/[<>"'&]/g, '')),
}))

// Mock mime-types for file handling
vi.mock('mime-types', () => ({
  lookup: vi.fn((filename: string) => {
    if (filename.endsWith('.pdf')) return 'application/pdf'
    if (filename.endsWith('.doc')) return 'application/msword'
    if (filename.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    return 'application/octet-stream'
  }),
  extension: vi.fn((mimeType: string) => {
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType === 'application/msword') return 'doc'
    return 'bin'
  }),
}))

// Skip mocking @sasarjan/database for now

// Skip mocking @sasarjan/profile-core for now

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  
  // Reset system time
  vi.setSystemTime(mockDate)
})