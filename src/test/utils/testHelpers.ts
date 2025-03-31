import { Product } from '@/types/product';
import { vi } from 'vitest';

// Mock product data generator
export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'test-123',
  title: 'Test Product',
  price: 29.99,
  description: 'Test product description',
  images: ['https://example.com/image1.jpg'],
  rating: 4.5,
  reviews: 100,
  originalPrice: '39.99',
  discount: '25%',
  url: 'https://www.temu.com/test-product-123.html',
  platform: 'Temu',
  timestamp: Date.now(),
  ...overrides
});

// Mock response generator
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data))
});

// Mock fetch implementation
export const mockFetch = (response: any) => {
  const fetchMock = vi.fn().mockResolvedValue(createMockResponse(response));
  global.fetch = fetchMock;
  return fetchMock;
};

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