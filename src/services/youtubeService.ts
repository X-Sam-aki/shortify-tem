
import '../utils/process-polyfill'; // Import the process polyfill first
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

// Mock implementation of the YouTube API for browser environments
// This avoids the need for server-only dependencies like googleapis
export class YouTubeService {
  private static instance: YouTubeService;
  private oauth2Client: any;
  private youtube: any;
  private isInitialized: boolean = false;

  private constructor() {
    const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_YOUTUBE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('YouTube API credentials not configured');
    }

    // Create a simplified OAuth client for browser usage
    this.oauth2Client = {
      generateAuthUrl: (options: any) => {
        // Generate a YouTube OAuth URL with appropriate scopes
        const scopes = encodeURIComponent(options.scope.join(' '));
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=${options.access_type}&prompt=consent`;
      },
      getToken: async (code: string) => {
        // In a real implementation, you would exchange the code for tokens
        // For browser-based apps, this usually requires a backend proxy
        // Here we'll mock it for demonstration purposes
        const mockTokens = {
          access_token: `mock_access_token_${Date.now()}`,
          refresh_token: `mock_refresh_token_${Date.now()}`,
          expiry_date: Date.now() + 3600 * 1000
        };
        
        // In a real implementation, this would be:
        // const response = await fetch('/api/youtube/token', {
        //   method: 'POST',
        //   body: JSON.stringify({ code }),
        //   headers: { 'Content-Type': 'application/json' }
        // });
        // const tokens = await response.json();
        
        return { tokens: mockTokens };
      },
      setCredentials: (tokens: any) => {
        // Store the tokens for later use
        this.oauth2Client.credentials = tokens;
      },
      credentials: null
    };

    // Create a simplified YouTube API client
    this.youtube = {
      videos: {
        insert: async (params: any, options: any) => {
          // Mock the video upload - in a real app, this would call the YouTube API
          console.log('Mocking YouTube video upload with params:', params);
          
          // Simulate upload progress
          if (options.onUploadProgress) {
            const totalBytes = params.media.body.size || 1000000;
            let bytesUploaded = 0;
            
            const progressInterval = setInterval(() => {
              bytesUploaded += totalBytes * 0.2;
              options.onUploadProgress({
                bytesRead: bytesUploaded,
                contentLength: totalBytes
              });
              
              if (bytesUploaded >= totalBytes) {
                clearInterval(progressInterval);
              }
            }, 500);
          }
          
          // Simulate API response after a delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return {
            data: {
              id: `youtube_video_${Date.now()}`,
              snippet: {
                title: params.requestBody.snippet.title,
                description: params.requestBody.snippet.description
              },
              status: {
                uploadStatus: 'processed',
                privacyStatus: params.requestBody.status.privacyStatus
              }
            }
          };
        },
        list: async (params: any) => {
          // Mock video listing/stats
          console.log('Mocking YouTube video list with params:', params);
          
          // Simulate API response after a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (params.id && params.id.length > 0) {
            const videoId = params.id[0];
            return {
              data: {
                items: [{
                  id: videoId,
                  statistics: {
                    viewCount: '1024',
                    likeCount: '512',
                    commentCount: '64'
                  },
                  contentDetails: {
                    duration: 'PT1M30S' // 1 minute 30 seconds
                  },
                  status: {
                    privacyStatus: 'public',
                    uploadStatus: 'processed'
                  }
                }]
              }
            };
          }
          
          return { data: { items: [] } };
        }
      },
      channels: {
        list: async (params: any) => {
          // Mock channel info
          console.log('Mocking YouTube channel list with params:', params);
          
          // Simulate API response after a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return {
            data: {
              items: [{
                id: 'channel_id_123',
                snippet: {
                  title: 'Demo Channel',
                  description: 'This is a mock YouTube channel for demonstration purposes.',
                  thumbnails: {
                    default: { url: 'https://via.placeholder.com/88x88' },
                    medium: { url: 'https://via.placeholder.com/240x240' },
                    high: { url: 'https://via.placeholder.com/800x800' }
                  }
                },
                statistics: {
                  subscriberCount: '10000',
                  viewCount: '500000',
                  videoCount: '50'
                }
              }]
            }
          };
        }
      }
    };
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
        return await response.blob();
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

      const videoId = res.data.id as string;
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

  public async getChannelInfo(): Promise<any | null> {
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

  public async getVideoStats(videoId: string): Promise<any | null> {
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
