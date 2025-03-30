export interface VideoAnalytics {
  id: string;
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  averageViewDuration: number;
  retentionRate: number;
  clickThroughRate: number;
  conversionRate: number;
  estimatedRevenue: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelAnalytics {
  id: string;
  totalSubscribers: number;
  totalViews: number;
  totalVideos: number;
  averageViewsPerVideo: number;
  subscriberGrowth: number;
  engagementRate: number;
  revenue: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptimizationSuggestion {
  id: string;
  videoId: string;
  type: 'title' | 'description' | 'tags' | 'thumbnail';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
  isApplied: boolean;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoOptimizationHistory {
  id: string;
  videoId: string;
  suggestionId: string;
  beforeMetrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    retentionRate: number;
  };
  afterMetrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    retentionRate: number;
  };
  improvementPercentage: number;
  createdAt: Date;
} 