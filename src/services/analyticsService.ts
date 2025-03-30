import { YouTubeService } from './youtubeService';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { 
  VideoAnalytics, 
  ChannelAnalytics, 
  OptimizationSuggestion, 
  VideoOptimizationHistory 
} from '@/types/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private youtubeService: YouTubeService;

  private constructor() {
    this.youtubeService = YouTubeService.getInstance();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async fetchVideoAnalytics(videoId: string): Promise<VideoAnalytics | null> {
    try {
      // Fetch analytics from YouTube API
      const youtubeAnalytics = await this.youtubeService.getVideoAnalytics(videoId);
      if (!youtubeAnalytics) {
        throw new Error('Failed to fetch YouTube analytics');
      }

      // Store analytics in database
      const { data, error } = await supabase
        .from('video_analytics')
        .insert({
          video_id: videoId,
          views: youtubeAnalytics.views,
          likes: youtubeAnalytics.likes,
          comments: youtubeAnalytics.comments,
          shares: youtubeAnalytics.shares,
          average_view_duration: youtubeAnalytics.averageViewDuration,
          retention_rate: youtubeAnalytics.retentionRate,
          click_through_rate: youtubeAnalytics.clickThroughRate,
          conversion_rate: youtubeAnalytics.conversionRate,
          estimated_revenue: youtubeAnalytics.estimatedRevenue
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapVideoAnalyticsFromDB(data);
    } catch (error) {
      logger.error('Failed to fetch video analytics:', error);
      return null;
    }
  }

  public async fetchChannelAnalytics(): Promise<ChannelAnalytics | null> {
    try {
      // Fetch analytics from YouTube API
      const youtubeAnalytics = await this.youtubeService.getChannelAnalytics();
      if (!youtubeAnalytics) {
        throw new Error('Failed to fetch YouTube channel analytics');
      }

      // Store analytics in database
      const { data, error } = await supabase
        .from('channel_analytics')
        .insert({
          total_subscribers: youtubeAnalytics.totalSubscribers,
          total_views: youtubeAnalytics.totalViews,
          total_videos: youtubeAnalytics.totalVideos,
          average_views_per_video: youtubeAnalytics.averageViewsPerVideo,
          subscriber_growth: youtubeAnalytics.subscriberGrowth,
          engagement_rate: youtubeAnalytics.engagementRate,
          revenue: youtubeAnalytics.revenue
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapChannelAnalyticsFromDB(data);
    } catch (error) {
      logger.error('Failed to fetch channel analytics:', error);
      return null;
    }
  }

  public async getOptimizationSuggestions(videoId: string): Promise<OptimizationSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('optimization_suggestions')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(this.mapOptimizationSuggestionFromDB);
    } catch (error) {
      logger.error('Failed to fetch optimization suggestions:', error);
      return [];
    }
  }

  public async getOptimizationHistory(videoId: string): Promise<VideoOptimizationHistory[]> {
    try {
      const { data, error } = await supabase
        .from('video_optimization_history')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(this.mapOptimizationHistoryFromDB);
    } catch (error) {
      logger.error('Failed to fetch optimization history:', error);
      return [];
    }
  }

  public async applyOptimizationSuggestion(
    videoId: string,
    suggestionId: string,
    beforeMetrics: VideoAnalytics
  ): Promise<boolean> {
    try {
      // Start a transaction
      const { data: suggestion, error: suggestionError } = await supabase
        .from('optimization_suggestions')
        .select('*')
        .eq('id', suggestionId)
        .single();

      if (suggestionError || !suggestion) {
        throw suggestionError;
      }

      // Apply the suggestion (this would be implemented based on the suggestion type)
      await this.applySuggestionToVideo(videoId, suggestion);

      // Fetch updated metrics
      const afterMetrics = await this.fetchVideoAnalytics(videoId);
      if (!afterMetrics) {
        throw new Error('Failed to fetch updated metrics');
      }

      // Calculate improvement percentage
      const improvementPercentage = this.calculateImprovementPercentage(beforeMetrics, afterMetrics);

      // Record the optimization history
      const { error: historyError } = await supabase
        .from('video_optimization_history')
        .insert({
          video_id: videoId,
          suggestion_id: suggestionId,
          before_metrics: beforeMetrics,
          after_metrics: afterMetrics,
          improvement_percentage: improvementPercentage
        });

      if (historyError) {
        throw historyError;
      }

      // Update suggestion status
      const { error: updateError } = await supabase
        .from('optimization_suggestions')
        .update({ 
          is_applied: true,
          applied_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch (error) {
      logger.error('Failed to apply optimization suggestion:', error);
      return false;
    }
  }

  private async applySuggestionToVideo(videoId: string, suggestion: OptimizationSuggestion): Promise<void> {
    // This would implement the actual suggestion application logic
    // For example, updating video title, description, tags, etc.
    // This is a placeholder implementation
    switch (suggestion.type) {
      case 'title':
        // Update video title
        break;
      case 'description':
        // Update video description
        break;
      case 'tags':
        // Update video tags
        break;
      case 'thumbnail':
        // Update video thumbnail
        break;
    }
  }

  private calculateImprovementPercentage(before: VideoAnalytics, after: VideoAnalytics): number {
    const engagementBefore = (before.likes + before.comments + before.shares) / before.views;
    const engagementAfter = (after.likes + after.comments + after.shares) / after.views;
    return ((engagementAfter - engagementBefore) / engagementBefore) * 100;
  }

  private mapVideoAnalyticsFromDB(data: any): VideoAnalytics {
    return {
      id: data.id,
      videoId: data.video_id,
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      shares: data.shares,
      averageViewDuration: data.average_view_duration,
      retentionRate: data.retention_rate,
      clickThroughRate: data.click_through_rate,
      conversionRate: data.conversion_rate,
      estimatedRevenue: data.estimated_revenue,
      recordedAt: new Date(data.recorded_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapChannelAnalyticsFromDB(data: any): ChannelAnalytics {
    return {
      id: data.id,
      totalSubscribers: data.total_subscribers,
      totalViews: data.total_views,
      totalVideos: data.total_videos,
      averageViewsPerVideo: data.average_views_per_video,
      subscriberGrowth: data.subscriber_growth,
      engagementRate: data.engagement_rate,
      revenue: data.revenue,
      recordedAt: new Date(data.recorded_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapOptimizationSuggestionFromDB(data: any): OptimizationSuggestion {
    return {
      id: data.id,
      videoId: data.video_id,
      type: data.type,
      priority: data.priority,
      suggestion: data.suggestion,
      impact: data.impact,
      isApplied: data.is_applied,
      appliedAt: data.applied_at ? new Date(data.applied_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapOptimizationHistoryFromDB(data: any): VideoOptimizationHistory {
    return {
      id: data.id,
      videoId: data.video_id,
      suggestionId: data.suggestion_id,
      beforeMetrics: data.before_metrics,
      afterMetrics: data.after_metrics,
      improvementPercentage: data.improvement_percentage,
      createdAt: new Date(data.created_at)
    };
  }
} 