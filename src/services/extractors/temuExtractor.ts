import { Product } from '@/types/product';
import { AbstractExtractor } from './baseExtractor';

interface CacheEntry {
  product: Product;
  timestamp: number;
}

export class TemuExtractor extends AbstractExtractor {
  protected platformName = 'Temu';
  protected urlPattern = /^https?:\/\/(?:www\.|m\.)?temu\.com(?:\/us)?\/(?:[\w-]+\.html|products\/[\w-]+|product\.html\?pid=[\w-]+)/i;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  public async extract(url: string, options: { timeout?: number } = {}): Promise<Product> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid Temu URL');
    }

    // Check cache first
    const cachedProduct = this.getCachedProduct(url);
    if (cachedProduct) {
      return cachedProduct;
    }

    try {
      // For now, we'll use a mock implementation since we can't use Puppeteer in the browser
      // In a real implementation, this would be handled by a backend service
      const mockProduct = await this.mockExtract(url, options);
      
      // Cache the result
      this.cacheProduct(url, mockProduct);
      
      return mockProduct;
    } catch (error) {
      console.error('Error extracting product data:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to extract product data');
    }
  }

  private getCachedProduct(url: string): Product | null {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.product;
    }
    return null;
  }

  private cacheProduct(url: string, product: Product): void {
    this.cache.set(url, {
      product,
      timestamp: Date.now()
    });
  }

  private async mockExtract(url: string, options: { timeout?: number } = {}): Promise<Product> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/extract-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ url }),
        signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const product = await response.json();
      
      // Validate required fields
      if (!product.title || !product.price || !product.images?.length) {
        throw new Error('Invalid product data received');
      }

      return {
        ...product,
        url,
        platform: 'Temu',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error extracting product data:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to extract product data');
    }
  }

  public extractProductId(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // For paths like: /product-123456.html
      const productFileMatch = pathParts[pathParts.length - 1].match(/product-([a-zA-Z0-9]+)\.html/);
      if (productFileMatch) {
        return productFileMatch[1];
      }
      
      // For paths like: /products/123456
      if (pathParts.includes('products') && pathParts.length > 2) {
        return pathParts[pathParts.indexOf('products') + 1];
      }
      
      // For paths with query parameters like: /product.html?pid=123456
      const pid = urlObj.searchParams.get('pid');
      if (pid) {
        return pid;
      }
      
      throw new Error('Could not extract product ID from URL');
    } catch (error) {
      console.error('Error extracting product ID:', error);
      throw new Error('Invalid URL format');
    }
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
}
