import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Create a flexible mock query builder that chains methods
const createMockQuery = (finalResult = { data: null, error: null }) => {
  const mockQuery = {
    eq: vi.fn(() => mockQuery),
    neq: vi.fn(() => mockQuery),
    contains: vi.fn(() => mockQuery),
    order: vi.fn(() => mockQuery),
    limit: vi.fn(() => mockQuery),
    range: vi.fn(() => Promise.resolve(finalResult)),
    single: vi.fn(() => Promise.resolve(finalResult)),
    then: vi.fn((callback) => Promise.resolve(finalResult).then(callback)),
  };
  return mockQuery;
};

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn(() => {
    const mockTable = {
      select: vi.fn(() => createMockQuery()),
      insert: vi.fn(() => ({
        select: vi.fn(() => createMockQuery()),
      })),
      update: vi.fn(() => createMockQuery()),
      delete: vi.fn(() => createMockQuery()),
      upsert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    };
    return mockTable;
  }),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/image.jpg' } })),
      remove: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
  },
};

// Mock database module
vi.mock('@sasarjan/database', () => ({
  createSupabaseClient: () => mockSupabaseClient,
}));

// Mock axios for API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Mock cron jobs
vi.mock('cron', () => ({
  CronJob: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

// Store mock client globally for test access
(globalThis as any).mockSupabaseClient = mockSupabaseClient;