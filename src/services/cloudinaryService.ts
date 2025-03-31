
import { VideoTemplate } from '@/types/videoTemplates';

export class CloudinaryService {
  private static instance: CloudinaryService;
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  private constructor() {
    // In a real app, these would be environment variables
    this.cloudName = 'demo';
    this.apiKey = 'demo-key';
    this.apiSecret = 'demo-secret';
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  // Mock implementations that are type-safe
  public async uploadImage(file: string | ArrayBuffer): Promise<string> {
    console.log('Uploading image to Cloudinary (mock)');
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/v1234567890/mock-image.jpg`;
  }

  public async uploadVideo(file: string | ArrayBuffer): Promise<string> {
    console.log('Uploading video to Cloudinary (mock)');
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/v1234567890/mock-video.mp4`;
  }

  public generateVideoFromImages(
    images: string[], 
    options: { 
      duration: number; 
      transitions: string; 
      music?: string; 
      overlays?: any[];
    }
  ): string {
    console.log('Generating video from images (mock)', images, options);
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/v1234567890/generated-video.mp4`;
  }

  public async createVideoWithTemplate(
    template: VideoTemplate | string, 
    data: any
  ): Promise<string> {
    // Convert VideoTemplate enum to string if needed
    const templateName = typeof template === 'string' ? template : String(template);
    console.log(`Creating video with template ${templateName} (mock)`, data);
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/v1234567890/template-${templateName}.mp4`;
  }

  public async optimizeVideo(videoUrl: string, options: any): Promise<string> {
    console.log('Optimizing video (mock)', videoUrl, options);
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/v1234567890/optimized-video.mp4`;
  }

  public getAssetInfo(publicId: string): Promise<any> {
    return Promise.resolve({
      public_id: publicId,
      format: 'mp4',
      version: 1234567890,
      resource_type: 'video',
      type: 'upload',
      created_at: new Date().toISOString(),
      bytes: 1024000,
      duration: 15,
      width: 1280,
      height: 720
    });
  }
}
