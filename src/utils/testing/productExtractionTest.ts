import { toast } from 'sonner';
import { extractProductData } from '@/utils/productUtils';

/**
 * Test product data extraction
 */
export const testProductExtraction = async () => {
  const testUrls = [
    'https://www.temu.com/product-123456.html',
    'https://www.temu.com/products/wireless-earbuds-123456'
  ];
  
  console.log('🧪 Testing product data extraction...');
  
  try {
    // Test with the first URL
    const product = await extractProductData(testUrls[0]);
    
    // Validate product structure
    const validations = [
      { check: !!product.id, name: 'Has ID' },
      { check: !!product.title, name: 'Has title' },
      { check: !!product.price, name: 'Has price' },
      { check: typeof product.price === 'number', name: 'Price is a number' },
      { check: !!product.description, name: 'Has description' },
      { check: Array.isArray(product.images) && product.images.length > 0, name: 'Has images' },
      { check: typeof product.rating === 'number', name: 'Has rating' },
      { check: product.rating >= 0 && product.rating <= 5, name: 'Rating is between 0-5' },
      { check: typeof product.reviews === 'number', name: 'Has reviews' },
      { check: product.reviews >= 0, name: 'Reviews count is valid' }
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
      console.log('📦 Extracted product:', product);
    } else {
      toast.error(`Some product extraction tests failed. (${passedCount}/${validations.length})`);
    }
    
    return { success: allPassed, product, passedCount, total: validations.length };
  } catch (error) {
    console.error('❌ Product extraction test failed with error:', error);
    toast.error('Product extraction test failed with an error.');
    return { success: false, passedCount: 0, total: 0 };
  }
};
