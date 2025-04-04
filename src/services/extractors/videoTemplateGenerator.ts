
import { Product } from '@/types/product';
import { CloudinaryService, VideoTemplate } from '@/services/cloudinaryService';

export interface VideoTemplateOptions {
  template: string;
  music?: string;
  textOverlays?: Array<string>;
  fontStyle?: string;
  colorScheme?: string;
  animation?: string;
}

export class VideoTemplateGenerator {
  private static instance: VideoTemplateGenerator;
  private cloudinary: CloudinaryService;

  private constructor() {
    this.cloudinary = CloudinaryService.getInstance();
  }

  public static getInstance(): VideoTemplateGenerator {
    if (!VideoTemplateGenerator.instance) {
      VideoTemplateGenerator.instance = new VideoTemplateGenerator();
    }
    return VideoTemplateGenerator.instance;
  }

  /**
   * Generate a video based on product data and template options
   */
  public async generateVideo(product: Product, options: VideoTemplateOptions): Promise<string> {
    try {
      // Map template string to CloudinaryService.VideoTemplate enum
      const templateType = this.mapTemplateType(options.template);
      
      // Prepare data for template generation
      const templateData = {
        product: {
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          description: product.description,
          rating: product.rating,
          reviews: product.reviews,
          images: product.images,
        },
        settings: {
          music: options.music || 'upbeat',
          fontStyle: options.fontStyle || 'montserrat',
          textColor: this.getTextColorFromScheme(options.colorScheme),
          animation: options.animation || 'fade',
          textOverlays: options.textOverlays || [],
        }
      };
      
      // Generate the video using Cloudinary
      const videoUrl = await this.cloudinary.createVideoWithTemplate(templateType, templateData);
      
      return videoUrl;
    } catch (error) {
      console.error('Error generating video template:', error);
      throw new Error('Failed to generate video');
    }
  }

  /**
   * Map template string to VideoTemplate enum
   */
  private mapTemplateType(template: string): VideoTemplate {
    switch (template) {
      case 'flash-deal':
        return VideoTemplate.ProductShowcase;
      case 'testimonial':
        return VideoTemplate.ReviewHighlight;
      case 'before-after':
        return VideoTemplate.FeatureDemo;
      case 'product-showcase':
      default:
        return VideoTemplate.ProductShowcase;
    }
  }

  /**
   * Get text color based on color scheme
   */
  private getTextColorFromScheme(colorScheme?: string): string {
    switch (colorScheme) {
      case 'red':
        return '#FF4C4C';
      case 'blue':
        return '#4C7CFF';
      case 'green':
        return '#4CAF50';
      case 'purple':
      default:
        return '#9C27B0';
    }
  }
  
  /**
   * Optimize the generated video for YouTube Shorts
   */
  public async optimizeForYouTubeShorts(videoUrl: string): Promise<string> {
    try {
      // YouTube Shorts format: 9:16 aspect ratio, resolution at least 600x1067
      const optimizedUrl = await this.cloudinary.optimizeVideo(videoUrl, {
        aspectRatio: '9:16',
        minWidth: 600,
        minHeight: 1067,
        format: 'mp4',
        quality: 'auto',
      });
      
      return optimizedUrl;
    } catch (error) {
      console.error('Error optimizing video:', error);
      throw new Error('Failed to optimize video for YouTube Shorts');
    }
  }
}
