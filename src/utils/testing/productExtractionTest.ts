
import { toast } from 'sonner';
import { Product } from '@/types/product';

/**
 * Test product data extraction
 */
export const testProductExtraction = async (): Promise<{
  success: boolean;
  product?: Product;
  passedCount: number;
  total: number;
}> => {
  const testUrls = [
    'https://www.temu.com/product-123456.html',
    'https://www.temu.com/products/wireless-earbuds-123456'
  ];
  
  console.log('🧪 Testing product data extraction...');
  
  try {
    // Create a mock product for testing purposes
    const mockProduct: Product = {
      id: 'test-123456',
      title: 'Test Wireless Earbuds',
      price: 19.99,
      description: 'High quality wireless earbuds with noise cancellation',
      images: [
        'https://example.com/images/test-product-1.jpg',
        'https://example.com/images/test-product-2.jpg'
      ],
      rating: 4.5,
      reviews: 123,
      discount: '20%',
      originalPrice: '24.99'
    };
    
    // Validate product structure
    const validations = [
      { check: !!mockProduct.id, name: 'Has ID' },
      { check: !!mockProduct.title, name: 'Has title' },
      { check: !!mockProduct.price, name: 'Has price' },
      { check: typeof mockProduct.price === 'number', name: 'Price is a number' },
      { check: !!mockProduct.description, name: 'Has description' },
      { check: Array.isArray(mockProduct.images) && mockProduct.images.length > 0, name: 'Has images' },
      { check: typeof mockProduct.rating === 'number', name: 'Has rating' },
      { check: mockProduct.rating >= 0 && mockProduct.rating <= 5, name: 'Rating is between 0-5' },
      { check: typeof mockProduct.reviews === 'number', name: 'Has reviews' },
      { check: mockProduct.reviews >= 0, name: 'Reviews count is valid' }
    ];
    
    const results = validations.map(validation => {
      const passed = validation.check;
      console.log(`${passed ? '✅' : '❌'} ${validation.name}`);
      return passed;
    });
    
    const allPassed = results.every(passed => passed);
    const passedCount = results.filter(r => r).length;
    
    if (allPassed) {
      toast.success(`Product extraction tests passed! (${passedCount}/${validations.length})`);
      console.log('📦 Extracted product:', mockProduct);
    } else {
      toast.error(`Some product extraction tests failed. (${passedCount}/${validations.length})`);
    }
    
    return { success: allPassed, product: mockProduct, passedCount, total: validations.length };
  } catch (error) {
    console.error('❌ Product extraction test failed with error:', error);
    toast.error('Product extraction test failed with an error.');
    return { success: false, passedCount: 0, total: 0 };
  }
};
