import { ProductExtractor } from '../productExtractor';
import { TemuExtractor } from '../extractors/temuExtractor';
import { Product } from '@/types/product';

describe('ProductExtractor', () => {
  let extractor: ProductExtractor;
  let temuExtractor: TemuExtractor;

  beforeEach(() => {
    extractor = ProductExtractor.getInstance();
    temuExtractor = new TemuExtractor();
  });

  describe('URL Validation', () => {
    it('should validate Temu URLs correctly', () => {
      const validUrls = [
        'https://www.temu.com/product-123.html',
        'https://temu.com/another-product.html',
        'http://www.temu.com/product.html'
      ];

      const invalidUrls = [
        'https://amazon.com/product',
        'invalid-url',
        'https://temu.com',
        'https://temu.com/product'
      ];

      validUrls.forEach(url => {
        expect(temuExtractor.validateUrl(url)).toBe(true);
      });

      invalidUrls.forEach(url => {
        expect(temuExtractor.validateUrl(url)).toBe(false);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      const startTime = Date.now();
      const urls = Array(15).fill('https://www.temu.com/product-123.html');

      const results = await Promise.all(
        urls.map(url => extractor.extractProduct(url))
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 1 minute due to rate limiting (10 requests per minute)
      expect(duration).toBeGreaterThanOrEqual(60000);
    });
  });

  describe('Caching', () => {
    it('should cache results and return cached data', async () => {
      const url = 'https://www.temu.com/product-123.html';
      
      // First request
      const result1 = await extractor.extractProduct(url);
      
      // Second request should use cache
      const result2 = await extractor.extractProduct(url);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.product).toEqual(result2.product);
    });

    it('should clear cache when requested', async () => {
      const url = 'https://www.temu.com/product-123.html';
      
      await extractor.extractProduct(url);
      expect(extractor.getCacheSize()).toBe(1);
      
      extractor.clearCache();
      expect(extractor.getCacheSize()).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs', async () => {
      const result = await extractor.extractProduct('invalid-url');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });

    it('should handle unsupported platforms', async () => {
      const result = await extractor.extractProduct('https://unsupported-platform.com/product');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unsupported platform');
    });

    it('should handle network errors', async () => {
      const result = await extractor.extractProduct('https://www.temu.com/non-existent-product.html');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch page');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      const url = 'https://www.temu.com/product-123.html';
      
      // Mock fetch to fail twice then succeed
      let attempts = 0;
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts <= 2) {
          throw new Error('Network error');
        }
        return {
          ok: true,
          text: () => Promise.resolve('<html><body>Success</body></html>')
        };
      });

      const result = await extractor.extractProduct(url);
      
      expect(attempts).toBe(3);
      expect(result.success).toBe(true);
      
      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Platform-Specific Extraction', () => {
    it('should extract Temu product data correctly', async () => {
      const mockHtml = `
        <html>
          <body>
            <h1 class="product-title">Test Product</h1>
            <div class="product-price">$19.99</div>
            <div class="product-rating">4.5</div>
            <div class="product-reviews-count">123 reviews</div>
            <div class="product-gallery">
              <img src="image1.jpg">
              <img src="image2.jpg">
            </div>
            <div class="product-description">Test description</div>
            <table class="product-specifications">
              <tr><th>Color</th><td>Red</td></tr>
            </table>
            <div class="free-shipping"></div>
            <div class="estimated-delivery">2-5 days</div>
            <div class="seller-name">Test Seller</div>
            <div class="seller-rating">4.8</div>
            <div class="seller-response-rate">98%</div>
          </body>
        </html>
      `;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await extractor.extractProduct('https://www.temu.com/test-product.html');

      expect(result.success).toBe(true);
      expect(result.product).toEqual({
        id: 'test-product',
        title: 'Test Product',
        price: 19.99,
        rating: 4.5,
        reviews: 123,
        images: ['image1.jpg', 'image2.jpg'],
        description: 'Test description',
        specifications: { Color: 'Red' },
        shipping: {
          free: true,
          estimatedDelivery: '2-5 days'
        },
        seller: {
          name: 'Test Seller',
          rating: 4.8,
          responseRate: '98%'
        },
        url: 'https://www.temu.com/test-product.html',
        platform: 'Temu',
        timestamp: expect.any(Number)
      });

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
}); 