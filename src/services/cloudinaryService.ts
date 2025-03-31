
import { Product } from '@/types/product';
import { VideoTemplate } from '@/types/templates';

// Try to import Cloudinary packages, but provide fallbacks if they fail
let Cloudinary: any;
let fill: any;
let Overlay: any;
let Text: any;
let Position: any;

try {
  const urlGen = require('@cloudinary/url-gen');
  Cloudinary = urlGen.Cloudinary;
  fill = require('@cloudinary/url-gen/actions/resize').fill;
  Overlay = require('@cloudinary/url-gen/actions/overlay').Overlay;
  Text = require('@cloudinary/url-gen/qualifiers/text').Text;
  Position = require('@cloudinary/url-gen/qualifiers/position').Position;
} catch (err) {
  console.warn('Cloudinary packages not found, using mock implementations');
  // Create mock implementations
  Cloudinary = class MockCloudinary {
    constructor() { console.log('Using Mock Cloudinary'); }
    video() { return { resize: () => this, overlay: () => this, toURL: () => 'https://mock-video-url.mp4' }; }
  };
  fill = () => ({ width: () => ({ height: () => ({}) }) });
  Overlay = () => ({ source: () => ({ position: () => ({}) }) });
  Text = class MockText {
    constructor() {}
    fontFamily() { return this; }
    fontSize() { return this; }
    fontWeight() { return this; }
    textColor() { return this; }
  };
  Position = () => ({ gravity: () => ({ offsetY: () => ({}) }) });
}

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
  },
  url: {
    secure: true
  }
});

export interface CloudinaryVideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  jobId: string;
}

interface TemplateSettings {
  titleFontSize: number;
  priceFontSize: number;
  titlePosition: { gravity: string; offsetY: number };
  pricePosition: { gravity: string; offsetY?: number };
  watermarkPosition: { gravity: string; offsetY: number };
}

export class CloudinaryService {
  private static instance: CloudinaryService;
  private cloudinary: any;

  // Template styles configuration
  private readonly templates: Record<string, TemplateSettings> = {
    basic: {
      titleFontSize: 60,
      priceFontSize: 80,
      titlePosition: { gravity: 'north', offsetY: 50 },
      pricePosition: { gravity: 'center' },
      watermarkPosition: { gravity: 'south', offsetY: 50 }
    },
    modern: {
      titleFontSize: 70,
      priceFontSize: 90,
      titlePosition: { gravity: 'north', offsetY: 100 },
      pricePosition: { gravity: 'center', offsetY: 50 },
      watermarkPosition: { gravity: 'south', offsetY: 100 }
    },
    minimal: {
      titleFontSize: 50,
      priceFontSize: 70,
      titlePosition: { gravity: 'north', offsetY: 30 },
      pricePosition: { gravity: 'center', offsetY: -30 },
      watermarkPosition: { gravity: 'south', offsetY: 30 }
    }
  };

  private constructor() {
    this.cloudinary = cld;
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  public async generateVideo(
    product: Product,
    template: VideoTemplate,
    options: {
      fontStyle?: string;
      colorScheme?: string;
      animation?: string;
      watermark?: boolean;
    }
  ): Promise<CloudinaryVideoResult> {
    try {
      const jobId = `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const video = this.cloudinary.video(jobId);
      
      // Get template settings
      const templateSettings = this.templates[template as string];
      
      // Apply base video transformations
      video.resize(fill().width(1080).height(1920));

      // Add product title overlay
      if (product.title) {
        video.overlay(
          Overlay()
            .source(
              Text(product.title)
                .fontFamily('Arial')
                .fontSize(templateSettings.titleFontSize)
                .fontWeight('bold')
                .textColor('white')
            )
            .position(Position().gravity(templateSettings.titlePosition.gravity).offsetY(templateSettings.titlePosition.offsetY))
        );
      }

      return {
        videoUrl: video.toURL(),
        thumbnailUrl: product.images[0],
        jobId
      };
    } catch (error) {
      console.error('Error generating video:', error);
      throw new Error('Failed to generate video');
    }
  }

  public async checkVideoStatus(jobId: string): Promise<CloudinaryVideoResult> {
    try {
      const video = this.cloudinary.video(jobId);
      return {
        videoUrl: video.toURL(),
        thumbnailUrl: video.toURL().replace('.mp4', '.jpg'),
        jobId
      };
    } catch (error) {
      console.error('Error checking video status:', error);
      throw new Error('Failed to check video status');
    }
  }
}
