
import { Product } from '@/types/product';
import { AbstractExtractor } from './baseExtractor';

// Define a proper cheerio mock
const cheerio = {
  load: (html: string) => {
    // This returns a function that can be called like $('selector')
    const $ = (selector: string) => {
      // Return an object with chainable methods
      return {
        text: () => "Mock Text for " + selector,
        find: (childSelector: string) => $(`${selector} ${childSelector}`),
        attr: (attrName: string) => "mock-attribute",
        each: (callback: (i: number, el: any) => void) => {
          // Mock each by calling the callback a few times with mock elements
          for (let i = 0; i < 3; i++) {
            callback(i, { 
              tagName: 'div', 
              getAttribute: (name: string) => `mock-${name}-${i}` 
            });
          }
        }
      };
    };
    
    // Add properties from the mock to the function
    Object.assign($, {
      text: () => "Mock Text",
      find: () => ({ text: () => "Mock Found Text" }),
      attr: () => "mock-attribute",
      each: (callback: Function) => {
        for (let i = 0; i < 3; i++) callback(i, {});
      }
    });
    
    return $;
  }
};

export class TemuExtractor extends AbstractExtractor {
  protected platformName = 'Temu';
  protected urlPattern = /^https?:\/\/(www\.)?temu\.com\/[a-zA-Z0-9-]+\.html/;

  public async extract(url: string): Promise<Product> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid Temu URL');
    }

    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);

    // Extract product title
    const title = $('h1.product-title').text().trim();
    if (!title) {
      throw new Error('Product title not found');
    }

    // Extract price
    const priceText = $('.product-price').text().trim();
    const price = this.extractPrice(priceText);

    // Extract rating and reviews
    const ratingText = $('.product-rating').text().trim();
    const rating = this.extractRating(ratingText);
    const reviewsText = $('.product-reviews-count').text().trim();
    const reviews = this.extractReviews(reviewsText);

    // Extract images
    const images: string[] = [];
    $('.product-gallery img').each((_, element) => {
      const src = element.getAttribute('src') || "";
      if (src) {
        images.push(src);
      }
    });

    // Extract description
    const description = $('.product-description').text().trim();

    // Extract original price and discount
    const originalPrice = $('.original-price').text().trim() || undefined;
    const discount = $('.discount-badge').text().trim() || undefined;

    // Create the Product object based on the Product interface
    return {
      id: this.generateProductId(url),
      title,
      price,
      description,
      images,
      rating,
      reviews,
      originalPrice,
      discount
    };
  }

  private generateProductId(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1].replace('.html', '');
  }

  protected override async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Temu page: ${response.statusText}`);
      }

      return response.text();
    } catch (error) {
      console.error('Error fetching page:', error);
      return '';
    }
  }
}
