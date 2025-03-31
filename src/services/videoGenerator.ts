import { Product } from '@/types/product';

// Define the types for video generation
export interface VideoGenerationOptions {
  template: string;
  music: string;
  fontStyle?: string;
  colorScheme?: string;
  animation?: string;
  textOverlays?: Array<{
    text: string;
    position: string;
    style: string;
  }>;
}

export interface VideoGenerationResult {
  status: 'success' | 'error';
  videoUrl?: string;
  thumbnailUrl?: string;
  jobId?: string;
  errorMessage?: string;
}

// Check if Cloudinary package is available and use a mock implementation if not
let cloudinaryImported = false;
let Cloudinary: any;

try {
  // Dynamic import to avoid errors in browser environments
  // @ts-ignore
  import('@cloudinary/url-gen').then(module => {
    Cloudinary = module.Cloudinary;
    cloudinaryImported = true;
    console.info('Cloudinary package loaded successfully');
  }).catch(error => {
    console.warn('Cloudinary package not found, using mock implementation');
    cloudinaryImported = false;
  });
} catch (e) {
  console.warn('Cloudinary package not found, using mock implementation');
  cloudinaryImported = false;
}

// Mock Cloudinary in browser
let cld: any;

if (cloudinaryImported && Cloudinary) {
  cld = new Cloudinary({
    cloud: {
      cloudName: 'demo'
    },
    url: {
      secure: true
    }
  });
} else {
  console.info('Using Mock Cloudinary');
  // Mock implementation
  cld = {
    video: (id: string) => ({
      toURL: () => `https://res.cloudinary.com/demo/video/upload/${id}`
    }),
    image: (id: string) => ({
      toURL: () => `https://res.cloudinary.com/demo/image/upload/${id}`
    })
  };
}

// Helper function to create a video URL with Cloudinary transformations
const createVideoUrl = (product: Product, options: VideoGenerationOptions): string => {
  // Base Cloudinary URL (you would replace this with your actual Cloudinary cloud name)
  const cloudName = 'demo';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

  // Create transformation parameters
  const transformations = [
    'c_fill',  // Crop mode
    'g_center', // Gravity center
    'w_1080',  // Width for vertical video
    'h_1920',  // Height for vertical video
    'f_mp4',   // Format MP4
    'q_auto',  // Auto quality
  ];

  // Add template-specific transformations
  switch (options.template) {
    case 'flash-deal':
      transformations.push(
        'l_text:Arial_80:Hot%20Deal,co_white,g_north,y_100',
        `l_text:Arial_60:${encodeURIComponent(product.title)},co_white,g_center`,
        'e_brightness:-30'
      );
      break;
    case 'product-showcase':
      transformations.push(
        `l_text:Arial_60:${encodeURIComponent(product.title)},co_white,g_south,y_100`,
        'e_art:athena'
      );
      break;
    default:
      transformations.push(
        `l_text:Arial_60:${encodeURIComponent(product.title)},co_white,g_south,y_100`
      );
  }

  // Add animation effect
  if (options.animation) {
    transformations.push('e_loop');
  }

  // Combine transformations
  const transformationString = transformations.join(',');

  // Use the first product image as the base
  const imageId = encodeURIComponent(product.images[0]);

  // Generate a unique identifier for this video
  const uniqueId = Math.random().toString(36).substring(2, 15);

  return `${baseUrl}/${transformationString}/v1/${uniqueId}/${imageId}`;
};

/**
 * Generates a YouTube Short video based on product data and customization options
 */
export const generateVideo = async (
  product: Product, 
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> => {
  try {
    console.log('Generating video for product:', product.title);
    console.log('With options:', options);

    // Create video URL with transformations
    const videoUrl = createVideoUrl(product, options);

    // Create a thumbnail URL (using the first product image)
    const thumbnailUrl = product.images[0];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      status: 'success',
      videoUrl,
      thumbnailUrl,
      jobId: Math.random().toString(36).substring(2, 15)
    };
  } catch (error) {
    console.error('Video generation error:', error);
    return {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Checks the status of a video generation job
 */
export const checkVideoGenerationStatus = async (jobId: string): Promise<VideoGenerationResult> => {
  try {
    // In a real implementation, you would call your video processing service API
    // For demo purposes, we'll just return success
    return {
      status: 'success',
      videoUrl: `https://res.cloudinary.com/demo/video/upload/${jobId}.mp4`,
      thumbnailUrl: `https://res.cloudinary.com/demo/image/upload/${jobId}.jpg`,
      jobId
    };
  } catch (error) {
    console.error('Error checking video status:', error);
    return {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Failed to check video status',
      jobId
    };
  }
};
