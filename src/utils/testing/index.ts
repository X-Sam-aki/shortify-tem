
import { toast } from 'sonner';
import { testUrlValidation } from './urlValidationTest';
import { testProductExtraction } from './productExtractionTest';
import { testVideoGeneration } from './videoGenerationTest';
import { testTemplateRendering } from './templateRenderingTest';
import { testYouTubePublishing } from './youtubePublishingTest';
import { VideoGenerationOptions } from '@/services/videoGenerator';

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

// Re-export all the individual test functions
export {
  testUrlValidation,
  testProductExtraction,
  testVideoGeneration,
  testTemplateRendering,
  testYouTubePublishing
};
