import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Common test data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  location: 'Test Location',
  age_group: '26-35',
  profession: 'Software Engineer',
  bio: 'Test bio',
  wallet_balance: 1000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockApp = {
  id: 'test-app-id',
  name: 'Test App',
  description: 'Test app description',
  category: 'productivity',
  price: 99.99,
  developer: 'Test Developer',
  version: '1.0.0',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockRevenue = {
  id: 'test-revenue-id',
  amount: 1000,
  currency: 'INR',
  date: '2024-01-01',
  app_id: 'test-app-id',
  user_id: 'test-user-id',
};

// Mock handlers for common operations
export const mockHandlers = {
  loginSuccess: vi.fn(),
  loginError: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  loadUsers: vi.fn(),
  loadApps: vi.fn(),
  loadRevenue: vi.fn(),
};

// Helper to create mock form events
export const createMockFormEvent = (values: Record<string, string>) => ({
  preventDefault: vi.fn(),
  target: {
    elements: Object.keys(values).reduce((acc, key) => {
      acc[key] = { value: values[key] };
      return acc;
    }, {} as Record<string, { value: string }>),
  },
});

// Helper to wait for async operations
export const waitForAsyncOperations = () => new Promise(resolve => setTimeout(resolve, 0));