
import { Product } from '@/types/product';

export abstract class AbstractExtractor {
  protected abstract platformName: string;
  protected abstract urlPattern: RegExp;

  /**
   * Validates if a URL matches the platform's URL pattern
   */
  public validateUrl(url: string): boolean {
    return this.urlPattern.test(url);
  }
  
  /**
   * Alias for validateUrl to maintain backward compatibility
   */
  public canHandle(url: string): boolean {
    return this.validateUrl(url);
  }

  /**
   * Extracts product data from a URL
   * This method must be implemented by all concrete extractors
   */
  public abstract extract(url: string, options?: { timeout?: number }): Promise<Product>;
}
