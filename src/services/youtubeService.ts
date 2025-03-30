import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { toast } from 'sonner';

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
  averageViewPercentage: number;
  subscriberGained: number;
  subscriberLost: number;
  estimatedRevenue: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface RetryOptions {
  maxRetries: number;
  delayMs: number;
}

export class YouTubeService {
  private static instance: YouTubeService;
  private oauth2Client: OAuth2Client;
  private youtube: any;
  private isInitialized: boolean = false;

  private constructor() {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.VITE_YOUTUBE_CLIENT_ID,
      clientSecret: process.env.VITE_YOUTUBE_CLIENT_SECRET,
      redirectUri: `${window.location.origin}/auth/youtube/callback`
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
      // Check if we have stored tokens
      const tokens = localStorage.getItem('youtube_tokens');
      if (tokens) {
        const parsedTokens = JSON.parse(tokens);
        this.oauth2Client.setCredentials(parsedTokens);
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize YouTube service:', error);
      return false;
    }
  }

  public getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
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
      console.error('Failed to handle YouTube auth callback:', error);
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
        
        // Don't retry on certain errors
        if (error.message?.includes('invalid_grant') || 
            error.message?.includes('invalid_token') ||
            error.message?.includes('unauthorized')) {
          throw error;
        }

        if (attempt === options.maxRetries) {
          break;
        }

        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, options.delayMs * Math.pow(2, attempt - 1))
        );
      }
    }

    throw lastError;
  }

  public async uploadVideo(
    videoUrl: string,
    metadata: YouTubeVideoMetadata
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
      // First, download the video file with retry
      const videoBlob = await this.retryWithBackoff(async () => {
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
        }
        return response.blob();
      });

      // Upload to YouTube with retry
      const res = await this.retryWithBackoff(async () => {
        return this.youtube.videos.insert(
          {
            part: 'snippet,status',
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
          },
          {
            onUploadProgress: (evt: any) => {
              const progress = (evt.bytesRead / evt.contentLength) * 100;
              console.log(`Upload progress: ${progress}%`);
            }
          }
        );
      });

      const videoId = res.data.id;
      return {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        status: 'success'
      };
    } catch (error: any) {
      console.error('Failed to upload video to YouTube:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload video';
      if (error.message?.includes('quotaExceeded')) {
        errorMessage = 'YouTube API quota exceeded. Please try again later.';
      } else if (error.message?.includes('invalid_grant')) {
        errorMessage = 'Authentication expired. Please reconnect your YouTube account.';
      } else if (error.message?.includes('fileSizeLimitExceeded')) {
        errorMessage = 'Video file size exceeds YouTube limit. Please compress the video.';
      }

      return {
        videoId: '',
        videoUrl: '',
        thumbnailUrl: '',
        status: 'error',
        errorMessage
      };
    }
  }

  private getCategoryId(category: string): string {
    const categories: Record<string, string> = {
      'Shopping': '22',
      'Entertainment': '24',
      'People & Blogs': '22',
      'Howto & Style': '26',
      'Education': '27',
      'Science & Technology': '28'
    };
    return categories[category] || '22'; // Default to People & Blogs
  }

  public async getVideoAnalytics(
    videoId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<YouTubeAnalytics> {
    if (!this.isInitialized) {
      throw new Error('YouTube service not initialized');
    }

    return this.retryWithBackoff(async () => {
      const defaultEnd = new Date();
      const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

      const startDate = dateRange?.start || defaultStart;
      const endDate = dateRange?.end || defaultEnd;

      const [videoStats, analytics] = await Promise.all([
        this.youtube.videos.list({
          part: 'statistics',
          id: videoId
        }),
        this.youtube.videos.get({
          part: 'snippet,statistics',
          id: videoId
        })
      ]);

      const stats = videoStats.data.items[0].statistics;
      const snippet = analytics.data.items[0].snippet;

      return {
        views: parseInt(stats.viewCount) || 0,
        likes: parseInt(stats.likeCount) || 0,
        comments: parseInt(stats.commentCount) || 0,
        shares: 0,
        averageViewDuration: 0,
        averageViewPercentage: 0,
        subscriberGained: 0,
        subscriberLost: 0,
        estimatedRevenue: 0,
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    });
  }

  public async getChannelAnalytics(
    dateRange?: { start: Date; end: Date }
  ): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('YouTube service not initialized');
    }

    return this.retryWithBackoff(async () => {
      const defaultEnd = new Date();
      const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

      const startDate = dateRange?.start || defaultStart;
      const endDate = dateRange?.end || defaultEnd;

      const channel = await this.youtube.channels.list({
        part: 'statistics',
        mine: true
      });

      return {
        totalSubscribers: parseInt(channel.data.items[0].statistics.subscriberCount) || 0,
        totalViews: parseInt(channel.data.items[0].statistics.viewCount) || 0,
        totalVideos: parseInt(channel.data.items[0].statistics.videoCount) || 0,
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    });
  }
} 