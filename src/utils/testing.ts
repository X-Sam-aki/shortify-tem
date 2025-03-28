
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { validateTemuUrl, extractProductData } from '@/utils/productUtils';
import { VideoGenerationOptions, VideoGenerationResult, generateVideo } from '@/services/videoGenerator';

/**
 * Test URL validation with different URL formats
 */
export const testUrlValidation = () => {
  const testUrls = [
    { url: 'https://www.temu.com/product-123456.html', expected: true, name: 'Valid product URL' },
    { url: 'https://www.temu.com/products/wireless-earbuds-123456', expected: true, name: 'Valid alternative format' },
    { url: 'https://amazon.com/product-123456', expected: false, name: 'Invalid domain' },
    { url: 'https://www.temu.com/', expected: false, name: 'Missing product ID' },
    { url: 'not-a-url', expected: false, name: 'Not a URL' },
  ];

  console.log('🧪 Testing URL validation...');
  
  const results = testUrls.map(test => {
    const result = validateTemuUrl(test.url);
    const passed = result === test.expected;
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${test.url} => ${result}`);
    
    return passed;
  });
  
  const allPassed = results.every(passed => passed);
  
  if (allPassed) {
    toast.success('URL validation tests passed!');
  } else {
    toast.error('Some URL validation tests failed. Check console for details.');
  }
  
  return { success: allPassed, total: testUrls.length, passed: results.filter(r => r).length };
};

/**
 * Test product data extraction
 */
export const testProductExtraction = () => {
  const testUrl = 'https://www.temu.com/product-123456.html';
  
  console.log('🧪 Testing product data extraction...');
  
  try {
    const product = extractProductData(testUrl);
    
    // Validate product structure
    const validations = [
      { check: !!product.id, name: 'Has ID' },
      { check: !!product.title, name: 'Has title' },
      { check: !!product.price, name: 'Has price' },
      { check: !!product.description, name: 'Has description' },
      { check: Array.isArray(product.images) && product.images.length > 0, name: 'Has images' },
      { check: typeof product.rating === 'number', name: 'Has rating' },
      { check: typeof product.reviews === 'number', name: 'Has reviews' }
    ];
    
    const results = validations.map(validation => {
      const passed = validation.check;
      console.log(`${passed ? '✅' : '❌'} ${validation.name}`);
      return passed;
    });
    
    const allPassed = results.every(passed => passed);
    
    if (allPassed) {
      toast.success('Product extraction tests passed!');
      console.log('📦 Extracted product:', product);
    } else {
      toast.error('Some product extraction tests failed. Check console for details.');
    }
    
    return { success: allPassed, product };
  } catch (error) {
    console.error('❌ Product extraction test failed with error:', error);
    toast.error('Product extraction test failed with an error.');
    return { success: false, error };
  }
};

/**
 * Test video generation functionality
 */
export const testVideoGeneration = async (product: Product, options: VideoGenerationOptions): Promise<{success: boolean, result?: VideoGenerationResult}> => {
  console.log('🧪 Testing video generation...');
  console.log('📦 Using product:', product);
  console.log('⚙️ Using options:', options);
  
  const startTime = Date.now();
  
  try {
    const result = await generateVideo(product, options);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // in seconds
    
    const validations = [
      { check: result.status === 'success', name: 'Success status' },
      { check: !!result.videoUrl, name: 'Has video URL' },
      { check: !!result.thumbnailUrl, name: 'Has thumbnail URL' },
      { check: duration < 30, name: 'Completed in under 30 seconds' }
    ];
    
    const results = validations.map(validation => {
      const passed = validation.check;
      console.log(`${passed ? '✅' : '❌'} ${validation.name}`);
      return passed;
    });
    
    const allPassed = results.every(passed => passed);
    
    if (allPassed) {
      toast.success(`Video generation tests passed! Completed in ${duration.toFixed(1)}s`);
    } else {
      toast.error('Some video generation tests failed. Check console for details.');
    }
    
    return { success: allPassed, result };
  } catch (error) {
    console.error('❌ Video generation test failed with error:', error);
    toast.error('Video generation test failed with an error.');
    return { success: false, error };
  }
};

/**
 * Run all available tests
 */
export const runAllTests = async () => {
  console.log('🧪 Running all tests...');
  
  // Test URL validation
  const urlResults = testUrlValidation();
  
  // Test product extraction
  const productResults = testProductExtraction();
  
  if (productResults.success && productResults.product) {
    // Test video generation with default options
    const videoOptions: VideoGenerationOptions = {
      template: 'flash-deal',
      music: 'upbeat',
      fontStyle: 'montserrat',
      colorScheme: 'purple',
      animation: 'fade'
    };
    
    await testVideoGeneration(productResults.product, videoOptions);
  }
  
  const allPassed = urlResults.success && productResults.success;
  
  if (allPassed) {
    toast.success('All tests completed successfully!');
  } else {
    toast.error('Some tests failed. Check console for details.');
  }
  
  return { success: allPassed };
};
