import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { overlay } from '@cloudinary/url-gen/actions/overlay';
import { text } from '@cloudinary/url-gen/qualifiers/text';
import { position } from '@cloudinary/url-gen/qualifiers/position';
import { Product } from '@/types/product';
import { VideoTemplate } from '@/types/templates';

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

export class CloudinaryService {
  private static instance: CloudinaryService;
  private cloudinary: Cloudinary;

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
    const jobId = `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const video = this.cloudinary.video(jobId);
    
    // Apply base video transformations
    video.resize(fill().width(1080).height(1920));

    // Add product title overlay
    if (product.title) {
      video.overlay(
        overlay()
          .source(
            text(product.title)
              .fontFamily('Arial')
              .fontSize(60)
              .fontWeight('bold')
              .textColor('white')
          )
          .position(position().gravity('north').offsetY(50))
      );
    }

    return {
      videoUrl: video.toURL(),
      thumbnailUrl: product.images[0],
      jobId
    };
  }

  public async checkVideoStatus(jobId: string): Promise<CloudinaryVideoResult> {
    const video = this.cloudinary.video(jobId);
    return {
      videoUrl: video.toURL(),
      thumbnailUrl: video.toURL().replace('.mp4', '.jpg'),
      jobId
    };
  }
} 