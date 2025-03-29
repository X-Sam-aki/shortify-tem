
import { toast } from 'sonner';
import { validateTemuUrl } from '@/utils/productUtils';

/**
 * Test URL validation with different URL formats
 */
export const testUrlValidation = () => {
  const testUrls = [
    { url: 'https://www.temu.com/product-123456.html', expected: true, name: 'Valid product URL' },
    { url: 'https://www.temu.com/products/wireless-earbuds-123456', expected: true, name: 'Valid alternative format' },
    { url: 'https://m.temu.com/us/product-123456.html', expected: true, name: 'Valid mobile URL' },
    { url: 'https://www.temu.com/product.html?pid=123456', expected: true, name: 'Valid URL with query params' },
    { url: 'https://amazon.com/product-123456', expected: false, name: 'Invalid domain' },
    { url: 'https://www.temu.com/', expected: false, name: 'Missing product ID' },
    { url: 'not-a-url', expected: false, name: 'Not a URL' },
    { url: 'https://www.temu.com/collections/deals', expected: false, name: 'Collection page, not product' },
  ];

  console.log('🧪 Testing URL validation...');
  
  const results = testUrls.map(test => {
    const result = validateTemuUrl(test.url);
    const passed = result === test.expected;
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${test.url} => ${result}`);
    
    return passed;
  });
  
  const allPassed = results.every(passed => passed);
  const passedCount = results.filter(r => r).length;
  
  if (allPassed) {
    toast.success(`URL validation tests passed! (${passedCount}/${testUrls.length})`);
  } else {
    toast.error(`Some URL validation tests failed. (${passedCount}/${testUrls.length})`);
  }
  
  return { success: allPassed, total: testUrls.length, passed: passedCount };
};
