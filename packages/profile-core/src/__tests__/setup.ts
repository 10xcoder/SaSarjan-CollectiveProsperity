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
  
  // Create a chainable query mock that supports all Supabase query methods
  const createChainableQuery = (data: any[], count?: number) => {
    const queryMethods = {
      eq: vi.fn(),
      contains: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
      single: vi.fn(),
      data: data || [],
      error: null,
      count: count || data?.length || 0
    };

    // Make all methods return the chainable object to support chaining
    queryMethods.eq.mockReturnValue(queryMethods);
    queryMethods.contains.mockReturnValue(queryMethods);
    queryMethods.order.mockReturnValue(queryMethods);
    queryMethods.range.mockImplementation((start: number, end: number) => {
      // Range should return the chainable query object, not a Promise
      return queryMethods;
    });
    
    // Single method for getting single record
    queryMethods.single.mockResolvedValue({
      data: data?.[0] || null,
      error: null
    });

    // Make the object itself thenable (for await query)
    (queryMethods as any).then = (resolve: any) => {
      resolve({
        data: data || [],
        error: null,
        count: count || data?.length || 0
      });
    };
    
    return queryMethods;
  };
  
  return {
    from: (table: string) => ({
      select: (columns?: string, options?: any) => {
        const tableData = mockData[table] || [];
        const count = options?.count === 'exact' ? tableData.length : undefined;
        
        // Return chainable query for search operations
        return createChainableQuery(tableData, count);
      },
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