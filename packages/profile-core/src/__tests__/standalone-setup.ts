// Standalone setup for test runner (without vitest dependencies)

// Simple mock function for non-vitest environment
const simpleMock = (impl?: any) => {
  const fn = (impl || (() => {})) as any;
  fn.mockReturnValue = (value: any) => {
    fn._returnValue = value;
    return fn;
  };
  fn.mockImplementation = (impl: any) => {
    fn._implementation = impl;
    return fn;
  };
  fn.mockResolvedValue = (value: any) => {
    fn._resolvedValue = value;
    return fn;
  };
  return fn;
};

// Global test utilities for non-vitest environment
(globalThis as any).createMockSupabaseClient = () => {
  const mockData: any = {};
  
  // Create a chainable query mock that supports all Supabase query methods
  const createChainableQuery = (data: any[], count?: number) => {
    const queryMethods = {
      eq: simpleMock(),
      contains: simpleMock(),
      order: simpleMock(),
      range: simpleMock(),
      single: simpleMock(),
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