import { beforeEach, vi } from 'vitest';

// Mock Supabase client
vi.mock('@sasarjan/database', () => ({
  createSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      overlaps: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

// Mock nanoid with counter to ensure unique IDs
let nanoidCounter = 0;
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => `mock-id-${++nanoidCounter}`),
}));

// Mock slugify
vi.mock('slugify', () => ({
  default: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock DOM APIs
global.DOMParser = class DOMParser {
  parseFromString(html: string, mimeType: string) {
    return {
      querySelector: vi.fn().mockReturnValue(null),
      querySelectorAll: vi.fn().mockReturnValue([]),
    } as any;
  }
};

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});