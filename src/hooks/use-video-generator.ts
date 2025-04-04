
import { useState } from 'react';
import { Product } from '@/types/product';
import { VideoGenerationOptions, VideoGenerationResult, generateVideo } from '@/services/videoGenerator';

export function useVideoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);

  /**
   * Generate a video based on product data and template options
   */
  const generateProductVideo = async (
    product: Product, 
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult> => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const result = await generateVideo(product, options);
      setVideoResult(result);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      
      return {
        status: 'error',
        errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Reset the video generation state
   */
  const resetVideoGeneration = () => {
    setVideoResult(null);
    setGenerationError(null);
  };

  return {
    generateProductVideo,
    resetVideoGeneration,
    isGenerating,
    generationError,
    videoResult
  };
}
