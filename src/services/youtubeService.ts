import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '@/utils/logger';

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
  scheduledTime?: Date;
}

export interface YouTubeUploadResult {
  videoId: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface YouTubeAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  averageViewDuration: number;
  retentionRate: number;
  clickThroughRate: number;
  conversionRate: number;
  estimatedRevenue: number;
}

export interface ChannelAnalytics {
  totalSubscribers: number;
  totalViews: number;
  totalVideos: number;
  averageViewsPerVideo: number;
  subscriberGrowth: number;
  engagementRate: number;
  revenue: number;
}

interface RetryOptions {
  maxRetries: number;
  delayMs: number;
}

export class YouTubeService {
  private static instance: YouTubeService;
  private oauth2Client: OAuth2Client;
  private youtube: youtube_v3.Youtube;
  private isInitialized: boolean = false;

  private constructor() {
    const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_YOUTUBE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('YouTube API credentials not configured');
    }

    this.oauth2Client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  public static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  public async initialize(): Promise<boolean> {
    try {
      const tokens = localStorage.getItem('youtube_tokens');
      if (tokens) {
        const parsedTokens = JSON.parse(tokens);
        this.oauth2Client.setCredentials(parsedTokens);
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to initialize YouTube service:', error);
      return false;
    }
  }

  public getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ]
    });
  }

  public async handleAuthCallback(code: string): Promise<boolean> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      localStorage.setItem('youtube_tokens', JSON.stringify(tokens));
      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to handle YouTube auth callback:', error);
      return false;
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    options: RetryOptions = { maxRetries: 3, delayMs: 1000 }
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (error.message?.includes('invalid_grant') || 
            error.message?.includes('invalid_token') ||
            error.message?.includes('unauthorized')) {
          this.isInitialized = false;
          localStorage.removeItem('youtube_tokens');
          throw error;
        }

        if (attempt === options.maxRetries) {
          break;
        }

        await new Promise(resolve => 
          setTimeout(resolve, options.delayMs * Math.pow(2, attempt - 1))
        );
      }
    }

    throw lastError;
  }

  public async uploadVideo(
    videoUrl: string,
    metadata: YouTubeVideoMetadata,
    onProgress?: (progress: number) => void
  ): Promise<YouTubeUploadResult> {
    if (!this.isInitialized) {
      return {
        videoId: '',
        videoUrl: '',
        thumbnailUrl: '',
        status: 'error',
        errorMessage: 'YouTube service not initialized'
      };
    }

    try {
      const videoBlob = await this.retryWithBackoff(async () => {
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
        }
        return response.blob();
      });

      const res = await this.retryWithBackoff(async () => {
        return this.youtube.videos.insert({
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: metadata.title,
              description: metadata.description,
              tags: metadata.tags,
              categoryId: this.getCategoryId(metadata.category)
            },
            status: {
              privacyStatus: metadata.privacyStatus,
              publishAt: metadata.scheduledTime?.toISOString()
            }
          },
          media: {
            body: videoBlob
          }
        }, {
          onUploadProgress: (evt: any) => {
            const progress = (evt.bytesRead / evt.contentLength) * 100;
            onProgress?.(progress);
          }
        });
      });

      const videoId = res.data.id;
      return {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        status: 'success'
      };
    } catch (error: any) {
      logger.error('Failed to upload video:', error);
      return {
        videoId: '',
        videoUrl: '',
        thumbnailUrl: '',
        status: 'error',
        errorMessage: error.message || 'Failed to upload video'
      };
    }
  }

  private getCategoryId(category: string): string {
    const categories: Record<string, string> = {
      entertainment: '24',
      gaming: '20',
      howto: '26',
      music: '10',
      news: '25',
      people: '22',
      sports: '17',
      technology: '28'
    };
    return categories[category.toLowerCase()] || '22'; // Default to People & Blogs
  }

  public async getChannelInfo(): Promise<youtube_v3.Schema$Channel | null> {
    if (!this.isInitialized) return null;

    try {
      const response = await this.retryWithBackoff(() =>
        this.youtube.channels.list({
          part: ['snippet', 'statistics'],
          mine: true
        })
      );

      return response.data.items?.[0] || null;
    } catch (error) {
      logger.error('Failed to get channel info:', error);
      return null;
    }
  }

  public async getVideoStats(videoId: string): Promise<youtube_v3.Schema$Video | null> {
    if (!this.isInitialized) return null;

    try {
      const response = await this.retryWithBackoff(() =>
        this.youtube.videos.list({
          part: ['statistics', 'status'],
          id: [videoId]
        })
      );

      return response.data.items?.[0] || null;
    } catch (error) {
      logger.error('Failed to get video stats:', error);
      return null;
    }
  }

  public async getVideoAnalytics(
    videoId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<YouTubeAnalytics | null> {
    if (!this.isInitialized) return null;

    try {
      const [videoStats, videoAnalytics] = await Promise.all([
        this.retryWithBackoff(() =>
          this.youtube.videos.list({
            part: ['statistics'],
            id: [videoId]
          })
        ),
        this.retryWithBackoff(() =>
          this.youtube.videos.list({
            part: ['contentDetails', 'statistics'],
            id: [videoId]
          })
        )
      ]);

      if (!videoStats.data.items?.[0] || !videoAnalytics.data.items?.[0]) {
        throw new Error('Video not found');
      }

      const stats = videoStats.data.items[0].statistics;
      const analytics = videoAnalytics.data.items[0];

      // Calculate engagement metrics
      const views = parseInt(stats?.viewCount || '0');
      const likes = parseInt(stats?.likeCount || '0');
      const comments = parseInt(stats?.commentCount || '0');
      const shares = 0; // YouTube API doesn't provide share count
      const averageViewDuration = 0; // This would come from YouTube Analytics API
      const retentionRate = 0; // This would come from YouTube Analytics API
      const clickThroughRate = 0; // This would come from YouTube Analytics API
      const conversionRate = 0; // This would come from YouTube Analytics API
      const estimatedRevenue = 0; // This would come from YouTube Analytics API

      return {
        views,
        likes,
        comments,
        shares,
        averageViewDuration,
        retentionRate,
        clickThroughRate,
        conversionRate,
        estimatedRevenue
      };
    } catch (error) {
      logger.error('Failed to get video analytics:', error);
      return null;
    }
  }

  public async getChannelAnalytics(
    dateRange?: { start: Date; end: Date }
  ): Promise<ChannelAnalytics | null> {
    if (!this.isInitialized) return null;

    try {
      const channelInfo = await this.getChannelInfo();
      if (!channelInfo) {
        throw new Error('Channel not found');
      }

      const stats = channelInfo.statistics;
      if (!stats) {
        throw new Error('Channel statistics not available');
      }

      // Calculate channel metrics
      const totalSubscribers = parseInt(stats.subscriberCount || '0');
      const totalViews = parseInt(stats.viewCount || '0');
      const totalVideos = parseInt(stats.videoCount || '0');
      const averageViewsPerVideo = totalViews / totalVideos;
      const subscriberGrowth = 0; // This would come from YouTube Analytics API
      const engagementRate = 0; // This would come from YouTube Analytics API
      const revenue = 0; // This would come from YouTube Analytics API

      return {
        totalSubscribers,
        totalViews,
        totalVideos,
        averageViewsPerVideo,
        subscriberGrowth,
        engagementRate,
        revenue
      };
    } catch (error) {
      logger.error('Failed to get channel analytics:', error);
      return null;
    }
  }
} 