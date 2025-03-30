import { v2 as cloudinary } from 'cloudinary';
import { DatabaseService } from './databaseService';

interface StorageOptions {
  folder?: string;
  resource_type?: 'auto' | 'image' | 'video' | 'raw';
  transformation?: any[];
  format?: string;
  quality?: number;
}

export class StorageService {
  private static instance: StorageService;
  private cloudinary;
  private databaseService: DatabaseService;
  private readonly DEFAULT_QUALITY = 80;
  private readonly COLD_STORAGE_THRESHOLD_DAYS = 30;
  private readonly MAX_STORAGE_SIZE = 100 * 1024 * 1024; // 100MB

  private constructor() {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    this.databaseService = DatabaseService.getInstance();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Upload operations
  public async uploadFile(
    file: Buffer | string,
    options: StorageOptions = {}
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || 'default',
        resource_type: options.resource_type || 'auto',
        transformation: options.transformation,
        format: options.format,
        quality: options.quality || this.DEFAULT_QUALITY
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  public async uploadVideo(
    video: Buffer | string,
    options: StorageOptions = {}
  ): Promise<{ url: string; thumbnailUrl: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(video, {
        folder: options.folder || 'videos',
        resource_type: 'video',
        transformation: [
          { quality: options.quality || this.DEFAULT_QUALITY },
          { fetch_format: 'auto' }
        ]
      });

      const thumbnailUrl = cloudinary.url(result.public_id, {
        format: 'jpg',
        transformation: [
          { width: 1280, height: 720, crop: 'fill' },
          { quality: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        thumbnailUrl,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error('Failed to upload video');
    }
  }

  // Storage optimization
  public async optimizeStorage(): Promise<void> {
    try {
      // Get all videos older than threshold
      const oldVideos = await this.databaseService.getVideosByDate(
        new Date(Date.now() - this.COLD_STORAGE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000)
      );

      for (const video of oldVideos) {
        // Move to cold storage if not already
        if (!video.metadata?.cold_storage) {
          await this.moveToColdStorage(video.cloudinary_url);
          await this.databaseService.updateVideo(video.id, {
            metadata: {
              ...video.metadata,
              cold_storage: true,
              cold_storage_date: new Date().toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('Storage optimization error:', error);
      throw new Error('Failed to optimize storage');
    }
  }

  private async moveToColdStorage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.explicit(publicId, {
        resource_type: 'video',
        type: 'private',
        access_mode: 'authenticated'
      });
    } catch (error) {
      console.error('Cold storage error:', error);
      throw new Error('Failed to move to cold storage');
    }
  }

  // Cleanup operations
  public async cleanupUnusedAssets(): Promise<void> {
    try {
      // Get all assets from Cloudinary
      const { resources } = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500
      });

      // Get all active videos from database
      const activeVideos = await this.databaseService.getAllActiveVideos();

      // Find unused assets
      const unusedAssets = resources.filter(
        resource => !activeVideos.some(video => video.cloudinary_url.includes(resource.public_id))
      );

      // Delete unused assets
      for (const asset of unusedAssets) {
        await cloudinary.uploader.destroy(asset.public_id);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      throw new Error('Failed to cleanup unused assets');
    }
  }

  // Compression operations
  public async compressVideo(publicId: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.explicit(publicId, {
        resource_type: 'video',
        transformation: [
          { quality: 'auto:low' },
          { fetch_format: 'auto' }
        ]
      });

      return result.secure_url;
    } catch (error) {
      console.error('Compression error:', error);
      throw new Error('Failed to compress video');
    }
  }

  // Storage analytics
  public async getStorageStats(): Promise<{
    totalSize: number;
    videoCount: number;
    imageCount: number;
    coldStorageSize: number;
  }> {
    try {
      const { resources } = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500
      });

      const stats = resources.reduce(
        (acc, resource) => {
          acc.totalSize += resource.bytes;
          if (resource.resource_type === 'video') {
            acc.videoCount++;
            if (resource.access_mode === 'authenticated') {
              acc.coldStorageSize += resource.bytes;
            }
          } else if (resource.resource_type === 'image') {
            acc.imageCount++;
          }
          return acc;
        },
        { totalSize: 0, videoCount: 0, imageCount: 0, coldStorageSize: 0 }
      );

      return stats;
    } catch (error) {
      console.error('Storage stats error:', error);
      throw new Error('Failed to get storage stats');
    }
  }

  // Error handling
  private handleError(error: any): never {
    console.error('Storage error:', error);
    throw new Error(error.message || 'Storage operation failed');
  }
} 