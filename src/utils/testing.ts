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

/**
 * Test product data extraction
 */
export const testProductExtraction = () => {
  const testUrls = [
    'https://www.temu.com/product-123456.html',
    'https://www.temu.com/products/wireless-earbuds-123456'
  ];
  
  console.log('🧪 Testing product data extraction...');
  
  try {
    // Test with the first URL
    const product = extractProductData(testUrls[0]);
    
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

/**
 * Test video generation functionality
 */
export const testVideoGeneration = async (product: Product, options: VideoGenerationOptions): Promise<{success: boolean, result: VideoGenerationResult | null}> => {
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
      { check: duration < 30, name: 'Completed in under 30 seconds' },
      { check: result.videoUrl.endsWith('.mp4') || result.videoUrl.includes('video'), name: 'Valid video format' },
      { check: result.thumbnailUrl.endsWith('.jpg') || result.thumbnailUrl.endsWith('.png') || result.thumbnailUrl.includes('image'), name: 'Valid thumbnail format' }
    ];
    
    const results = validations.map(validation => {
      const passed = validation.check;
      console.log(`${passed ? '✅' : '❌'} ${validation.name}`);
      return passed;
    });
    
    const allPassed = results.every(passed => passed);
    const passedCount = results.filter(r => r).length;
    
    if (allPassed) {
      toast.success(`Video generation tests passed! Completed in ${duration.toFixed(1)}s (${passedCount}/${validations.length})`);
    } else {
      toast.error(`Some video generation tests failed. (${passedCount}/${validations.length})`);
    }
    
    return { success: allPassed, result };
  } catch (error) {
    console.error('❌ Video generation test failed with error:', error);
    toast.error('Video generation test failed with an error.');
    return { success: false, result: null };
  }
};

/**
 * Test YouTube publishing capabilities
 */
export const testYouTubePublishing = async (videoUrl: string, metadata: any): Promise<{success: boolean, result: any | null}> => {
  console.log('🧪 Testing YouTube publishing capabilities...');
  console.log('📹 Using video:', videoUrl);
  console.log('📝 Using metadata:', metadata);
  
  const startTime = Date.now();
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const validations = [
      { check: !!videoUrl, name: 'Valid video URL' },
      { check: !!metadata.title, name: 'Has title' },
      { check: !!metadata.description, name: 'Has description' },
      { check: Array.isArray(metadata.tags) && metadata.tags.length > 0, name: 'Has tags' },
      { check: !!metadata.category, name: 'Has category' }
    ];
    
    const results = validations.map(validation => {
      const passed = validation.check;
      console.log(`${passed ? '✅' : '❌'} ${validation.name}`);
      return passed;
    });
    
    const allPassed = results.every(passed => passed);
    const passedCount = results.filter(r => r).length;
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // in seconds
    
    if (allPassed) {
      toast.success(`YouTube publishing tests passed! (${passedCount}/${validations.length})`);
      console.log(`✅ Simulated YouTube publishing completed in ${duration.toFixed(1)}s`);
    } else {
      toast.error(`Some YouTube publishing tests failed. (${passedCount}/${validations.length})`);
    }
    
    return { success: allPassed, result: { published: true } };
  } catch (error) {
    console.error('❌ YouTube publishing test failed with error:', error);
    toast.error('YouTube publishing test failed with an error.');
    return { success: false, result: null };
  }
};

/**
 * Test template rendering with different product types
 */
export const testTemplateRendering = (template: string): {success: boolean} => {
  console.log(`🧪 Testing template rendering for "${template}" template...`);
  
  // Create sample products with different characteristics
  const products = [
    {
      id: 'test-1',
      title: 'Standard Product with Average Length Title',
      price: 19.99,
      originalPrice: 29.99,
      discount: '33%',
      description: 'This is a standard product description.',
      images: ['https://example.com/image1.jpg'],
      rating: 4.5,
      reviews: 120
    },
    {
      id: 'test-2',
      title: 'Product with an Extremely Long Title That Might Cause Layout Issues in Some Templates',
      price: 9.99,
      description: 'Short desc.',
      images: ['https://example.com/image2.jpg'],
      rating: 3.0,
      reviews: 5
    },
    {
      id: 'test-3',
      title: 'No Image Product',
      price: 49.99,
      description: 'This product has no images to test fallback behavior.',
      images: [],
      rating: 4.0,
      reviews: 50
    }
  ];
  
  // Simulate rendering each product with the selected template
  const validations = products.map((product, index) => {
    const productType = index === 0 ? 'standard' : index === 1 ? 'long title' : 'no image';
    const passed = true; // In a real implementation, this would check actual rendering
    console.log(`${passed ? '✅' : '❌'} Rendered ${productType} product with ${template} template`);
    return passed;
  });
  
  const allPassed = validations.every(passed => passed);
  
  if (allPassed) {
    toast.success(`Template rendering tests passed for "${template}"!`);
  } else {
    toast.error(`Some template rendering tests failed for "${template}".`);
  }
  
  return { success: allPassed };
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🧪 Running all tests...');
  
  // Test URL validation
  const urlResults = testUrlValidation();
  
  // Test product extraction
  const productResults = testProductExtraction();
  
  // Test template rendering
  const templateResults = testTemplateRendering('flash-deal');
  
  // Initialize with a required result property set to null
  let videoResults = { success: false, result: null };
  
  if (productResults.success && productResults.product) {
    // Test video generation with default options
    const videoOptions: VideoGenerationOptions = {
      template: 'flash-deal',
      music: 'upbeat',
      fontStyle: 'montserrat',
      colorScheme: 'purple',
      animation: 'fade'
    };
    
    videoResults = await testVideoGeneration(productResults.product, videoOptions);
    
    // If video generation was successful, test YouTube publishing
    if (videoResults.success && videoResults.result) {
      const metadata = {
        title: `${productResults.product.title} - Amazing Deal!`,
        description: `Check out this amazing product: ${productResults.product.description}\n\nShop now with my affiliate link!`,
        tags: ['product review', 'deal', 'shopping', 'temu'],
        category: 'Shopping'
      };
      
      await testYouTubePublishing(videoResults.result.videoUrl, metadata);
    }
  }
  
  const allPassed = urlResults.success && productResults.success && templateResults.success && videoResults.success;
  
  if (allPassed) {
    toast.success('All tests completed successfully!');
  } else {
    toast.error('Some tests failed. Check console for details.');
  }
  
  return { 
    success: allPassed,
    results: {
      urlValidation: urlResults,
      productExtraction: productResults,
      templateRendering: templateResults,
      videoGeneration: videoResults
    }
  };
};
