import { Product } from '@/types/product';
import { AbstractExtractor } from './baseExtractor';

export class TemuExtractor extends AbstractExtractor {
  protected platformName = 'Temu';
  protected urlPattern = /^https?:\/\/(?:www\.|m\.)?temu\.com(?:\/us)?\/(?:[\w-]+\.html|products\/[\w-]+|product\.html\?pid=[\w-]+)/i;

  public async extract(url: string): Promise<Product> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid Temu URL');
    }

    try {
      // For now, we'll use a mock implementation since we can't use Puppeteer in the browser
      // In a real implementation, this would be handled by a backend service
      const mockProduct = await this.mockExtract(url);
      return mockProduct;
    } catch (error) {
      console.error('Error extracting product data:', error);
      throw new Error('Failed to extract product data');
    }
  }

  private async mockExtract(url: string): Promise<Product> {
    // Generate a consistent product ID from the URL
    const productId = this.extractProductId(url);
    
    // Use the product ID to generate consistent mock data
    const hash = this.hashCode(productId);
    
    const productTypes = [
      'Wireless Earbuds',
      'Smart Watch',
      'Phone Holder',
      'LED Strip Lights',
      'Bluetooth Speaker',
      'Power Bank',
      'Phone Case',
      'USB Cable',
      'Wall Charger',
      'Screen Protector'
    ];

    const productIndex = Math.abs(hash) % productTypes.length;
    const basePrice = 10 + (Math.abs(hash) % 40); // Price between $10 and $50
    const reviewCount = 50 + (Math.abs(hash) % 450); // Reviews between 50 and 500
    const rating = 3.5 + (Math.abs(hash) % 15) / 10; // Rating between 3.5 and 5.0

    const mockProduct: Product = {
      id: productId,
      title: `${productTypes[productIndex]} - Premium Quality`,
      price: basePrice,
      description: `High-quality ${productTypes[productIndex].toLowerCase()} with premium features. Perfect for everyday use with long battery life and durable construction.`,
      images: [
        `https://picsum.photos/seed/${productId}/800/800`,
        `https://picsum.photos/seed/${productId}2/800/800`,
        `https://picsum.photos/seed/${productId}3/800/800`
      ],
      rating: rating,
      reviews: reviewCount,
      originalPrice: (basePrice * 1.5).toFixed(2),
      discount: '33%',
      url: url,
      platform: 'Temu',
      timestamp: Date.now()
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockProduct;
  }

  private extractProductId(url: string): string {
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
      
      // Fallback: use the last part of the path
      return pathParts[pathParts.length - 1].replace('.html', '');
    } catch (error) {
      console.error('Error extracting product ID:', error);
      return Math.random().toString(36).substring(2, 9);
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
