import { Product } from '@/types/product';
import { RateLimiter } from 'limiter';
import { TemuExtractor } from './extractors/temuExtractor';
import { AmazonExtractor } from './extractors/amazonExtractor';
import { WalmartExtractor } from './extractors/walmartExtractor';

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