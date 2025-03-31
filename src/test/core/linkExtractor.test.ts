import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractProductData, validateTemuUrl } from '@/utils/productUtils';
import {
  createMockProduct,
  mockFetch,
  generateTestUrls,
  generateInvalidUrls,
  expectProductShape,
  simulateNetworkError,
  simulateTimeout
} from '../utils/testHelpers';

describe('Link Extractor Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Validation', () => {
    it('should validate correct Temu URLs', () => {
      const validUrls = generateTestUrls();
      validUrls.forEach(url => {
        expect(validateTemuUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = generateInvalidUrls();
      invalidUrls.forEach(url => {
        expect(validateTemuUrl(url)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      const edgeCases = [
        'https://www.temu.com/product-123.html?ref=abc',
        'https://temu.com/products/item-with-spaces%20123',
        'https://m.temu.com/product-123.html'
      ];
      edgeCases.forEach(url => {
        expect(validateTemuUrl(url)).toBe(true);
      });
    });
  });

  describe('Product Data Extraction', () => {
    it('should extract product data successfully', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const url = generateTestUrls()[0];
      const result = await extractProductData(url);

      expectProductShape(result);
      expect(result).toEqual(mockProduct);
    });

    it('should handle missing optional fields', async () => {
      const mockProduct = createMockProduct({
        originalPrice: undefined,
        discount: undefined
      });
      mockFetch(mockProduct);

      const url = generateTestUrls()[0];
      const result = await extractProductData(url);

      expectProductShape(result);
      expect(result.originalPrice).toBeUndefined();
      expect(result.discount).toBeUndefined();
    });

    it('should handle network errors', async () => {
      simulateNetworkError();
      const url = generateTestUrls()[0];

      await expect(extractProductData(url)).rejects.toThrow('Network error');
    });

    it('should handle timeouts', async () => {
      simulateTimeout(5000);
      const url = generateTestUrls()[0];

      await expect(extractProductData(url)).rejects.toThrow('Timeout');
    });

    it('should handle invalid responses', async () => {
      mockFetch({ invalid: 'data' });
      const url = generateTestUrls()[0];

      await expect(extractProductData(url)).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should validate price format', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const result = await extractProductData(generateTestUrls()[0]);
      expect(typeof result.price).toBe('number');
      expect(result.price).toBeGreaterThan(0);
    });

    it('should validate rating range', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const result = await extractProductData(generateTestUrls()[0]);
      expect(result.rating).toBeGreaterThanOrEqual(0);
      expect(result.rating).toBeLessThanOrEqual(5);
    });

    it('should validate review count', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const result = await extractProductData(generateTestUrls()[0]);
      expect(Number.isInteger(result.reviews)).toBe(true);
      expect(result.reviews).toBeGreaterThanOrEqual(0);
    });

    it('should validate image URLs', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const result = await extractProductData(generateTestUrls()[0]);
      result.images.forEach(url => {
        expect(url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Error Cases', () => {
    it('should handle malformed URLs', async () => {
      await expect(extractProductData('not-a-url')).rejects.toThrow();
    });

    it('should handle empty responses', async () => {
      mockFetch(null);
      await expect(extractProductData(generateTestUrls()[0])).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      mockFetch({ error: 'Server Error' });
      await expect(extractProductData(generateTestUrls()[0])).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      const mockProduct = createMockProduct();
      const fetchMock = mockFetch(mockProduct);

      const promises = Array(10).fill(null).map(() => 
        extractProductData(generateTestUrls()[0])
      );

      await Promise.all(promises);
      expect(fetchMock).toHaveBeenCalledTimes(10);
    });
  });
}); 