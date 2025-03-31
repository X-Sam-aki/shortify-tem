import { describe, it, expect, beforeEach } from 'vitest';
import { TemuExtractor } from '@/services/extractors/temuExtractor';
import { measurePerformance, createMockProduct, mockApiResponse } from '../utils/testHelpers';

describe('Link Extractor Performance Tests', () => {
  let extractor: TemuExtractor;

  beforeEach(() => {
    extractor = new TemuExtractor();
  });

  describe('Response Time', () => {
    it('should extract product data within acceptable time limit', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      global.fetch = jest.fn().mockImplementation(() => mockApiResponse(mockProduct));

      const { duration } = await measurePerformance(async () => {
        return await extractor.extract(url);
      });

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const urls = Array.from({ length: 10 }, (_, i) => 
        `https://www.temu.com/product-${i}.html`
      );
      
      const mockProducts = urls.map((_, i) => 
        createMockProduct({ id: String(i) })
      );
      
      let requestCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        const product = mockProducts[requestCount++];
        return mockApiResponse(product);
      });

      const { duration } = await measurePerformance(async () => {
        return await Promise.all(urls.map(url => extractor.extract(url)));
      });

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(requestCount).toBe(urls.length);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage during extraction', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      global.fetch = jest.fn().mockImplementation(() => mockApiResponse(mockProduct));

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform multiple extractions
      for (let i = 0; i < 100; i++) {
        await extractor.extract(url);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Cache Performance', () => {
    it('should return cached results faster than initial requests', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      global.fetch = jest.fn().mockImplementation(() => mockApiResponse(mockProduct));

      // Initial request
      const { duration: initialDuration } = await measurePerformance(async () => {
        return await extractor.extract(url);
      });

      // Cached request
      const { duration: cachedDuration } = await measurePerformance(async () => {
        return await extractor.extract(url);
      });

      expect(cachedDuration).toBeLessThan(initialDuration);
    });

    it('should handle cache eviction efficiently', async () => {
      // Generate many unique URLs
      const urls = Array.from({ length: 1000 }, (_, i) => 
        `https://www.temu.com/product-${i}.html`
      );
      
      const mockProducts = urls.map((_, i) => 
        createMockProduct({ id: String(i) })
      );
      
      let requestCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        const product = mockProducts[requestCount++];
        return mockApiResponse(product);
      });

      const { duration } = await measurePerformance(async () => {
        for (const url of urls) {
          await extractor.extract(url);
        }
      });

      // Should handle many requests without significant slowdown
      expect(duration / urls.length).toBeLessThan(10); // Average 10ms per request
    });
  });

  describe('Load Testing', () => {
    it('should handle burst of concurrent requests', async () => {
      const concurrentRequests = 50;
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      
      let failedRequests = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        // Simulate occasional failures under load
        if (Math.random() < 0.1) {
          failedRequests++;
          return Promise.reject(new Error('Service unavailable'));
        }
        return mockApiResponse(mockProduct);
      });

      const { duration } = await measurePerformance(async () => {
        const requests = Array.from({ length: concurrentRequests }, () => 
          extractor.extract(url).catch(() => null)
        );
        return await Promise.all(requests);
      });

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(failedRequests).toBeLessThan(concurrentRequests * 0.2); // Less than 20% failure rate
    });
  });

  describe('Error Recovery', () => {
    it('should recover quickly from failures', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      
      let failureCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        if (failureCount++ < 2) {
          return Promise.reject(new Error('Service unavailable'));
        }
        return mockApiResponse(mockProduct);
      });

      const { duration } = await measurePerformance(async () => {
        try {
          await extractor.extract(url);
        } catch {
          await extractor.extract(url);
        }
      });

      expect(duration).toBeLessThan(2000); // Should recover within 2 seconds
    });
  });

  describe('Resource Usage', () => {
    it('should clean up resources after extraction', async () => {
      const url = 'https://www.temu.com/product-123.html';
      const mockProduct = createMockProduct({ id: '123' });
      global.fetch = jest.fn().mockImplementation(() => mockApiResponse(mockProduct));

      const initialResources = process.memoryUsage();
      
      // Perform extraction with cleanup
      await extractor.extract(url);
      
      const finalResources = process.memoryUsage();
      
      // Check various resource metrics
      expect(finalResources.heapUsed - initialResources.heapUsed).toBeLessThan(1024 * 1024); // Less than 1MB increase
      expect(finalResources.external - initialResources.external).toBeLessThan(1024 * 100); // Less than 100KB external memory increase
    });
  });
}); 