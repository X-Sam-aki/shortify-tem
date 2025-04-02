import { Product } from '@/types/product';
import { TemuExtractor } from './extractors/temuExtractor';

// Mock implementation for AmazonExtractor
class AmazonExtractor {
  async extract(url: string): Promise<Product> {
    return {
      id: 'amazon-mock-123',
      title: 'Amazon Product',
      price: 29.99,
      description: 'This is a mock Amazon product',
      images: ['https://via.placeholder.com/300'],
      rating: 4.5,
      reviews: 123
    };
  }
}

// Mock implementation for WalmartExtractor
class WalmartExtractor {
  async extract(url: string): Promise<Product> {
    return {
      id: 'walmart-mock-123',
      title: 'Walmart Product',
      price: 19.99,
      description: 'This is a mock Walmart product',
      images: ['https://via.placeholder.com/300'],
      rating: 4.2,
      reviews: 87
    };
  }
}

// Simple rate limiter class
class RateLimiter {
  private tokensPerInterval: number;
  private interval: string;
  private tokens: number;
  private lastRefillTime: number;

  constructor(options: { tokensPerInterval: number, interval: string }) {
    this.tokensPerInterval = options.tokensPerInterval;
    this.interval = options.interval;
    this.tokens = options.tokensPerInterval;
    this.lastRefillTime = Date.now();
  }

  async tryRemoveTokens(count: number): Promise<boolean> {
    this.refillTokens();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  private refillTokens(): void {
    const now = Date.now();
    const intervalMs = this.interval === 'second' ? 1000 : 
                      this.interval === 'minute' ? 60000 : 
                      this.interval === 'hour' ? 3600000 : 86400000;
    
    const elapsedTime = now - this.lastRefillTime;
    const tokensToAdd = Math.floor(elapsedTime / intervalMs) * this.tokensPerInterval;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.tokensPerInterval);
      this.lastRefillTime = now;
    }
  }
}

export interface ExtractorResult {
  success: boolean;
  product?: Product;
  error?: string;
}

export class ProductExtractor {
  private static instance: ProductExtractor;
  private rateLimiter: RateLimiter;
  private cache: Map<string, { product: Product; timestamp: number }>;
  private extractors: Map<string, any>;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {
    // Initialize rate limiter: 10 requests per minute
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: 'minute'
    });

    // Initialize cache
    this.cache = new Map();

    // Initialize platform-specific extractors
    this.extractors = new Map([
      ['temu.com', new TemuExtractor()],
      ['amazon.com', new AmazonExtractor()],
      ['walmart.com', new WalmartExtractor()]
    ]);
  }

  public static getInstance(): ProductExtractor {
    if (!ProductExtractor.instance) {
      ProductExtractor.instance = new ProductExtractor();
    }
    return ProductExtractor.instance;
  }

  private getPlatformFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      for (const [platform, _] of this.extractors) {
        if (hostname.includes(platform)) {
          return platform;
        }
      }
      throw new Error('Unsupported platform');
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  private async waitForRateLimit(): Promise<void> {
    const hasToken = await this.rateLimiter.tryRemoveTokens(1);
    if (!hasToken) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.waitForRateLimit();
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      return this.retryWithBackoff(operation, retries - 1);
    }
  }

  private isCacheValid(cachedData: { product: Product; timestamp: number }): boolean {
    return Date.now() - cachedData.timestamp < this.CACHE_DURATION;
  }

  public async extractProduct(url: string): Promise<ExtractorResult> {
    try {
      // Validate URL
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided');
      }

      // Check cache first
      const cachedData = this.cache.get(url);
      if (cachedData && this.isCacheValid(cachedData)) {
        return {
          success: true,
          product: cachedData.product
        };
      }

      // Get platform-specific extractor
      const platform = this.getPlatformFromUrl(url);
      const extractor = this.extractors.get(platform);
      if (!extractor) {
        throw new Error(`No extractor found for platform: ${platform}`);
      }

      // Apply rate limiting
      await this.waitForRateLimit();

      // Extract product data with retry
      const product = await this.retryWithBackoff(async () => {
        return extractor.extract(url);
      });

      // Cache the result
      this.cache.set(url, {
        product,
        timestamp: Date.now()
      });

      return {
        success: true,
        product
      };
    } catch (error: any) {
      console.error('Product extraction error:', error);
      return {
        success: false,
        error: error.message || 'Failed to extract product data'
      };
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }
}
