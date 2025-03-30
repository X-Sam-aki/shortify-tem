import { Product } from '@/types/product';

export interface BaseExtractor {
  extract(url: string): Promise<Product>;
  validateUrl(url: string): boolean;
  getPlatformName(): string;
}

export abstract class AbstractExtractor implements BaseExtractor {
  protected abstract platformName: string;
  protected abstract urlPattern: RegExp;

  public abstract extract(url: string): Promise<Product>;

  public validateUrl(url: string): boolean {
    try {
      return this.urlPattern.test(url);
    } catch {
      return false;
    }
  }

  public getPlatformName(): string {
    return this.platformName;
  }

  protected async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    return response.text();
  }

  protected extractPrice(priceText: string): number {
    const price = priceText.replace(/[^0-9.]/g, '');
    return parseFloat(price) || 0;
  }

  protected extractRating(ratingText: string): number {
    const rating = ratingText.replace(/[^0-9.]/g, '');
    return parseFloat(rating) || 0;
  }

  protected extractReviews(reviewsText: string): number {
    const reviews = reviewsText.replace(/[^0-9]/g, '');
    return parseInt(reviews) || 0;
  }
} 