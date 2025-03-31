import { describe, it, expect, beforeEach } from 'vitest';
import { extractProductData } from '@/utils/productUtils';
import {
  createMockProduct,
  mockFetch,
  generateTestUrls,
  measureResponseTime,
  simulateLoad
} from '../utils/testHelpers';

describe('Link Extractor Performance Tests', () => {
  beforeEach(() => {
    // Reset mocks and clear cache
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Response Time Tests', () => {
    it('should extract product data within acceptable time limit', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const responseTime = await measureResponseTime(async () => {
        await extractProductData(generateTestUrls()[0]);
      });

      // Response time should be under 1 second
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const concurrentRequests = 5;
      const startTime = performance.now();

      await simulateLoad(
        async () => extractProductData(generateTestUrls()[0]),
        concurrentRequests
      );

      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / concurrentRequests;

      // Average time per request should be under 1.5 seconds
      expect(averageTime).toBeLessThan(1500);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should maintain stable memory usage during repeated operations', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        await extractProductData(generateTestUrls()[0]);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be less than 50MB after 100 iterations
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Cache Performance Tests', () => {
    it('should return cached results faster than fresh requests', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);
      const url = generateTestUrls()[0];

      // First request (no cache)
      const uncachedTime = await measureResponseTime(async () => {
        await extractProductData(url);
      });

      // Second request (cached)
      const cachedTime = await measureResponseTime(async () => {
        await extractProductData(url);
      });

      // Cached response should be at least 50% faster
      expect(cachedTime).toBeLessThan(uncachedTime * 0.5);
    });
  });

  describe('Load Testing', () => {
    it('should handle burst traffic without errors', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const burstSize = 20;
      const results = await simulateLoad(
        async () => extractProductData(generateTestUrls()[0]),
        burstSize
      );

      // All requests should succeed
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });
    });

    it('should maintain performance under sustained load', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const requestsPerBatch = 5;
      const batches = 10;
      const maxAverageTime = 2000; // 2 seconds

      for (let i = 0; i < batches; i++) {
        const startTime = performance.now();
        
        await simulateLoad(
          async () => extractProductData(generateTestUrls()[0]),
          requestsPerBatch
        );

        const batchTime = performance.now() - startTime;
        const averageTime = batchTime / requestsPerBatch;

        expect(averageTime).toBeLessThan(maxAverageTime);
        
        // Wait between batches to simulate real-world usage
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });

  describe('Error Recovery Tests', () => {
    it('should recover performance after error conditions', async () => {
      const mockProduct = createMockProduct();
      const fetchMock = mockFetch(mockProduct);

      // Simulate network errors for first 5 requests
      for (let i = 0; i < 5; i++) {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
      }

      const results = await simulateLoad(
        async () => {
          try {
            return await extractProductData(generateTestUrls()[0]);
          } catch {
            return null;
          }
        },
        10
      );

      // Later requests should succeed
      const successfulRequests = results.filter(r => r !== null);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Resource Usage Tests', () => {
    it('should clean up resources after processing', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      const initialResources = process.memoryUsage();
      
      await extractProductData(generateTestUrls()[0]);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalResources = process.memoryUsage();

      // Resource usage should return to near initial levels
      expect(finalResources.heapUsed - initialResources.heapUsed).toBeLessThan(1024 * 1024); // 1MB
    });
  });
}); 