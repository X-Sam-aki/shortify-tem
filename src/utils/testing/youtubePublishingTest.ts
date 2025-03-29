
import { toast } from 'sonner';

/**
 * Test YouTube publishing capabilities
 */
export const testYouTubePublishing = async (
  videoUrl: string, 
  metadata: any
): Promise<{success: boolean, result: any | null}> => {
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
