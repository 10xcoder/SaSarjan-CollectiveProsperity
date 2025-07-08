import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn()
          }))
        })),
        single: vi.fn()
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      })),
      unsubscribe: vi.fn()
    }))
  }))
}));

// Global test utilities
(globalThis as any).createMockSupabaseClient = () => {
  const mockData: any = {};
  
  return {
    from: (table: string) => ({
      select: (columns?: string, options?: any) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: mockData[table]?.[0], error: null }),
          order: (column: string, options?: any) => ({
            range: async (start: number, end: number) => ({
              data: mockData[table] || [],
              error: null,
              count: mockData[table]?.length || 0
            })
          })
        }),
        single: async () => ({ data: mockData[table]?.[0], error: null })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ 
            data: { ...data, id: 'mock-id', createdAt: new Date(), updatedAt: new Date() }, 
            error: null 
          })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => ({ 
              data: { ...data, updatedAt: new Date() }, 
              error: null 
            })
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          execute: async () => ({ error: null })
        })
      })
    }),
    _setMockData: (table: string, data: any[]) => {
      mockData[table] = data;
    }
  };
};