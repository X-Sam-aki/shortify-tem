
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { VideoGenerationOptions, VideoGenerationResult, generateVideo } from '@/services/videoGenerator';

/**
 * Test video generation functionality
 */
export const testVideoGeneration = async (
  product: Product, 
  options: VideoGenerationOptions
): Promise<{success: boolean, result: VideoGenerationResult | null}> => {
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
