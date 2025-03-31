import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthContext';
import { Product } from '@/types/product';
import { vi } from 'vitest';
import React, { ReactElement } from 'react';

// Create a fresh QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

// Wrapper for rendering components with all providers
export function renderWithProviders(ui: ReactElement) {
  const testQueryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Mock product data generator
export const createMockProduct = (overrides = {}): Product => ({
  id: 'test-product-1',
  title: 'Test Product',
  price: 29.99,
  description: 'A test product description',
  images: ['https://example.com/image1.jpg'],
  rating: 4.5,
  reviews: 100,
  originalPrice: 39.99,
  discount: 25,
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Mock video generation options
export const createMockVideoOptions = (overrides = {}) => ({
  template: 'flash-deal',
  music: 'upbeat',
  fontStyle: 'modern',
  colorScheme: 'light',
  animation: 'slide',
  textOverlays: ['Save Now!'],
  ...overrides,
});

// Mock API response helper
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

// Mock error response helper
export const mockApiError = (status = 500, message = 'Internal Server Error') => {
  return Promise.reject({
    status,
    message,
  });
};

// Wait for element helper
export const waitForElement = (callback: () => any, timeout = 2000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const result = callback();
      if (result) {
        resolve(result);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for element'));
      } else {
        setTimeout(check, 50);
      }
    };
    
    check();
  });
};

// Local storage mock
export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
  };
};

// Mock Intersection Observer
export const mockIntersectionObserver = () => {
  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      setTimeout(() => callback([], this), 0);
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
  }
  
  window.IntersectionObserver = MockIntersectionObserver as any;
};

// Performance measurement helper
export const measurePerformance = async (callback: () => Promise<any>) => {
  const start = performance.now();
  const result = await callback();
  const end = performance.now();
  
  return {
    duration: end - start,
    result,
  };
};

// Mock window.fetch
export const mockFetch = (response: any) => {
  const originalFetch = window.fetch;
  window.fetch = vi.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response)
    })
  );
  return () => { window.fetch = originalFetch; };
};

// Mock response generator
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data))
});

// Route testing helper
export const testRoute = async (path: string) => {
  const response = await fetch(`http://localhost:8080${path}`);
  return {
    status: response.status,
    data: await response.json()
  };
};

// UI testing helpers
export const fillInput = (input: HTMLElement, value: string) => {
  const event = new Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', { value: { value } });
  input.dispatchEvent(event);
};

export const clickButton = (button: HTMLElement) => {
  const event = new MouseEvent('click', { bubbles: true });
  button.dispatchEvent(event);
};

// Performance testing helpers
export const measureResponseTime = async (fn: () => Promise<any>) => {
  const start = performance.now();
  await fn();
  return performance.now() - start;
};

export const simulateLoad = async (
  fn: () => Promise<any>,
  concurrency: number
) => {
  const promises = Array(concurrency)
    .fill(null)
    .map(() => fn());
  const results = await Promise.all(promises);
  return results;
};

// Error simulation helpers
export const simulateNetworkError = () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
};

export const simulateTimeout = (ms: number) => {
  global.fetch = vi.fn().mockImplementation(() => new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  }));
};

// Test data generators
export const generateTestUrls = () => [
  'https://www.temu.com/product-123.html',
  'https://www.temu.com/products/wireless-earbuds-456',
  'https://www.temu.com/product.html?pid=789'
];

export const generateInvalidUrls = () => [
  'https://example.com/product',
  'not-a-url',
  'https://temu.com',
  ''
];

// Assertion helpers
export const expectProductShape = (product: any) => {
  expect(product).toHaveProperty('id');
  expect(product).toHaveProperty('title');
  expect(product).toHaveProperty('price');
  expect(product).toHaveProperty('description');
  expect(product).toHaveProperty('images');
  expect(Array.isArray(product.images)).toBe(true);
  expect(product).toHaveProperty('rating');
  expect(typeof product.rating).toBe('number');
  expect(product).toHaveProperty('reviews');
  expect(typeof product.reviews).toBe('number');
}; 