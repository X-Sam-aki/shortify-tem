import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { mockIntersectionObserver } from './utils/testHelpers';

// Extend Vitest's expect method with Testing Library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

// Mock IntersectionObserver
mockIntersectionObserver();

// Mock window.fetch
const originalFetch = window.fetch;
window.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();

// Mock process.env
process.env = {
  ...process.env,
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_YOUTUBE_CLIENT_ID: 'test-client-id',
  VITE_YOUTUBE_CLIENT_SECRET: 'test-client-secret',
  VITE_YOUTUBE_REDIRECT_URI: 'http://localhost:5173/auth/youtube/callback',
};

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(() => null),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
    functions: {
      invoke: vi.fn().mockImplementation((functionName, { body }) => {
        if (functionName === 'extract-product') {
          // Handle malformed URLs
          if (!body.url || typeof body.url !== 'string' || !body.url.startsWith('https://www.temu.com/')) {
            return Promise.reject(new Error('Invalid URL format'));
          }

          // Handle network errors
          if (body.url.includes('product-error')) {
            return Promise.reject(new Error('Network error'));
          }

          // Handle timeouts
          if (body.url.includes('product-timeout')) {
            return Promise.reject(new Error('Timeout'));
          }

          // Handle server errors
          if (body.url.includes('product-server-error')) {
            return Promise.resolve({
              data: null,
              error: { message: 'Server Error' }
            });
          }

          // Handle empty responses
          if (body.url.includes('product-empty')) {
            return Promise.resolve({
              data: null,
              error: { message: 'Invalid response format' }
            });
          }

          // Handle rate limiting
          if (body.url.includes('product-rate-limit')) {
            return Promise.reject(new Error('Too many requests'));
          }

          // Handle unexpected errors
          if (body.url.includes('product-unexpected')) {
            return Promise.reject(new Error('Unexpected error occurred'));
          }

          // Return mock product data for valid URLs
          return Promise.resolve({
            data: {
              id: '123',
              title: 'Test Product',
              price: 29.99,
              description: 'A test product description',
              images: ['https://example.com/image1.jpg'],
              rating: 4.5,
              reviews: 100,
              originalPrice: 39.99,
              discount: 25,
              timestamp: new Date().toISOString(),
              url: body.url,
              platform: 'Temu',
              aiEnhanced: true
            },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: null });
      })
    }
  })),
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({
    setDefaultOptions: vi.fn(),
    invalidateQueries: vi.fn(),
    prefetchQuery: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Mock React Router DOM
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
  };
});

// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks();
  window.fetch = originalFetch;
}); 