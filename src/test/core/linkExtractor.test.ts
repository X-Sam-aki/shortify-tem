import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractProductData, validateTemuUrl } from '@/utils/productUtils';
import {
  createMockProduct,
  mockFetch,
  generateTestUrls,
  generateInvalidUrls,
  expectProductShape,
  simulateNetworkError,
  simulateTimeout,
  mockApiResponse,
  mockApiError
} from '../utils/testHelpers';
import { TemuExtractor } from '@/services/extractors/temuExtractor';

describe('Link Extractor Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Validation', () => {
    it('should validate correct Temu URLs', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const result = await extractProductData(url);
      expect(result).toBeDefined();
      expect(result.title).toBe('Test Product');
    });

    it('should reject invalid URLs', async () => {
      const url = undefined;
      await expect(extractProductData(url)).rejects.toThrow('Invalid URL format');
    });

    it('should handle edge cases', async () => {
      const url = '';
      await expect(extractProductData(url)).rejects.toThrow('Invalid URL format');
    });
  });

  describe('Product Data Extraction', () => {
    it('should extract product data successfully', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const result = await extractProductData(url);
      expect(result).toEqual(expect.objectContaining({
        id: '123',
        title: 'Test Product',
        price: 29.99,
        description: 'A test product description',
        images: ['https://example.com/image1.jpg'],
        rating: 4.5,
        reviews: 100,
        url: url,
        platform: 'Temu',
        aiEnhanced: true
      }));
    });

    it('should handle missing optional fields', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const result = await extractProductData(url);
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
    });

    it('should handle network errors', async () => {
      const url = 'https://www.temu.com/product-error.html';
      await expect(extractProductData(url)).rejects.toThrow('Network error');
    });

    it('should handle timeouts', async () => {
      const url = 'https://www.temu.com/product-timeout.html';
      await expect(extractProductData(url)).rejects.toThrow('Timeout');
    });

    it('should handle invalid responses', async () => {
      const url = 'https://www.temu.com/product-empty.html';
      await expect(extractProductData(url)).rejects.toThrow('Invalid response format');
    });

    it('should handle server errors', async () => {
      const url = 'https://www.temu.com/product-server-error.html';
      await expect(extractProductData(url)).rejects.toThrow('Server Error');
    });
  });

  describe('Data Validation', () => {
    it('should validate price format', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const result = await extractProductData(url);
      expect(result.price).toBeTypeOf('number');
      expect(result.price).toBeGreaterThan(0);
    });

    it('should validate rating range', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const result = await extractProductData(url);
      expect(result.rating).toBeGreaterThanOrEqual(0);
      expect(result.rating).toBeLessThanOrEqual(5);
    });

    it('should validate review count', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const result = await extractProductData(url);
      expect(result.reviews).toBeTypeOf('number');
      expect(result.reviews).toBeGreaterThanOrEqual(0);
    });

    it('should validate image URLs', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const result = await extractProductData(url);
      expect(result.images).toBeInstanceOf(Array);
      expect(result.images.length).toBeGreaterThan(0);
      expect(result.images[0]).toMatch(/^https?:\/\//);
    });
  });

  describe('Error Cases', () => {
    it('should handle malformed URLs', async () => {
      const url = 'not-a-url';
      await expect(extractProductData(url)).rejects.toThrow('Invalid URL format');
    });

    it('should handle rate limiting', async () => {
      const url = 'https://www.temu.com/product-rate-limit.html';
      await expect(extractProductData(url)).rejects.toThrow('Too many requests');
    });

    it('should handle unexpected errors', async () => {
      const url = 'https://www.temu.com/product-unexpected.html';
      await expect(extractProductData(url)).rejects.toThrow('Unexpected error occurred');
    });
  });
});

describe('TemuExtractor', () => {
  let extractor: TemuExtractor;

  beforeEach(() => {
    extractor = new TemuExtractor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('URL Validation', () => {
    it('should validate correct Temu URLs', () => {
      const validUrls = [
        'https://www.temu.com/product.html',
        'https://www.temu.com/product-123.html',
        'https://www.temu.com/goods-detail.html?id=123',
      ];

      validUrls.forEach(url => {
        expect(extractor.canHandle(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://www.amazon.com/product',
        'https://temu.fake.com/product.html',
        'https://www.temu.com',
        '',
        'invalid-url',
      ];

      invalidUrls.forEach(url => {
        expect(extractor.canHandle(url)).toBe(false);
      });
    });
  });

  describe('Product ID Extraction', () => {
    it('should extract product ID from URL path', () => {
      const url = 'https://www.temu.com/product-123.html';
      const id = extractor.extractProductId(url);
      expect(id).toBe('123');
    });

    it('should extract product ID from query parameters', () => {
      const url = 'https://www.temu.com/goods-detail.html?id=456';
      const id = extractor.extractProductId(url);
      expect(id).toBe('456');
    });

    it('should throw error for invalid URLs', () => {
      const url = 'https://www.temu.com/invalid';
      expect(() => extractor.extractProductId(url)).toThrow();
    });
  });

  describe('Product Extraction', () => {
    it('should extract product data successfully', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      global.fetch = vi.fn().mockImplementation(() => mockApiResponse(mockProduct));

      const result = await extractor.extract(url);
      expect(result).toEqual(mockProduct);
    });

    it('should handle extraction errors gracefully', async () => {
      const url = 'https://www.temu.com/product-error.html';
      global.fetch = vi.fn().mockImplementation(() => mockApiError(500));

      await expect(extractor.extract(url)).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      const url = 'https://www.temu.com/product-123.html';
      global.fetch = vi.fn().mockImplementation(() => mockApiError(429, 'Rate limited'));

      await expect(extractor.extract(url)).rejects.toThrow('Rate limited');
    });
  });

  describe('Cache Behavior', () => {
    it('should cache extracted products', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      const fetchMock = vi.fn().mockImplementation(() => mockApiResponse(mockProduct));
      global.fetch = fetchMock;

      // First call should make an API request
      const result1 = await extractor.extract(url);
      expect(result1).toEqual(mockProduct);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call should use cached data
      const result2 = await extractor.extract(url);
      expect(result2).toEqual(mockProduct);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after expiry', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      const fetchMock = vi.fn().mockImplementation(() => mockApiResponse(mockProduct));
      global.fetch = fetchMock;

      // First call
      await extractor.extract(url);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Simulate cache expiry
      vi.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 hours

      // Second call should make a new request
      await extractor.extract(url);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Cases', () => {
    it('should handle network errors', async () => {
      const url = 'https://www.temu.com/product-error.html';
      await expect(extractor.extract(url)).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      const url = 'https://www.temu.com/product-123.html';
      global.fetch = vi.fn().mockImplementation(() => mockApiResponse({ invalid: 'data' }));

      await expect(extractor.extract(url)).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const url = 'https://www.temu.com/product-timeout.html';
      global.fetch = vi.fn().mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve(mockApiResponse({})), 5000);
      }));

      await expect(extractor.extract(url, { timeout: 1000 })).rejects.toThrow('Timeout');
    });
  });
}); 