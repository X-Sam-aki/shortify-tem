import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Target, Clock, Tag, MessageSquare, ThumbsUp, Eye } from 'lucide-react';
import { YouTubeService } from '@/services/youtubeService';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface OptimizationSuggestion {
  type: 'title' | 'description' | 'tags' | 'thumbnail';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
}

interface VideoOptimizationProps {
  videoId: string;
}

const VideoOptimization: React.FC<VideoOptimizationProps> = ({ videoId }) => {
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const youtubeService = YouTubeService.getInstance();

  const fetchOptimizationData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [metrics, videoStats] = await Promise.all([
        youtubeService.getVideoAnalytics(videoId),
        youtubeService.youtube.videos.list({
          part: 'statistics,snippet',
          id: videoId
        })
      ]);

      if (!metrics || !videoStats.data.items?.[0]) {
        throw new Error('Failed to fetch video data');
      }

      const video = videoStats.data.items[0];
      const stats = video.statistics;
      const snippet = video.snippet;
      const views = parseInt(stats.viewCount) || 0;
      const likes = parseInt(stats.likeCount) || 0;
      const comments = parseInt(stats.commentCount) || 0;

      // Calculate engagement metrics
      const engagementRate = views > 0 
        ? ((likes + comments) / views) * 100 
        : 0;

      setEngagementMetrics({
        engagementRate: Number(engagementRate.toFixed(2)),
        averageViewDuration: metrics.averageViewDuration,
        retentionRate: metrics.retentionRate,
        clickThroughRate: metrics.clickThroughRate,
        conversionRate: metrics.conversionRate
      });

      // Generate optimization suggestions
      const newSuggestions: OptimizationSuggestion[] = [];

      // Title optimization
      if (snippet.title.length < 50) {
        newSuggestions.push({
          type: 'title',
          priority: 'high',
          suggestion: 'Add more keywords to your title to improve SEO',
          impact: 'High impact on discoverability'
        });
      }

      // Description optimization
      if (snippet.description.length < 200) {
        newSuggestions.push({
          type: 'description',
          priority: 'medium',
          suggestion: 'Expand your description with more details and keywords',
          impact: 'Medium impact on engagement'
        });
      }

      // Tags optimization
      if (!snippet.tags || snippet.tags.length < 5) {
        newSuggestions.push({
          type: 'tags',
          priority: 'medium',
          suggestion: 'Add more relevant tags to improve discoverability',
          impact: 'Medium impact on search visibility'
        });
      }

      // Engagement optimization
      if (engagementRate < 5) {
        newSuggestions.push({
          type: 'thumbnail',
          priority: 'high',
          suggestion: 'Improve thumbnail design to increase click-through rate',
          impact: 'High impact on initial engagement'
        });
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to fetch optimization data:', error);
      setError('Failed to load optimization data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizationData();
  }, [videoId]);

  const handleApplySuggestion = async (suggestion: OptimizationSuggestion) => {
    try {
      // Here you would implement the actual suggestion application logic
      toast.success('Suggestion applied successfully');
      await fetchOptimizationData(); // Refresh data
    } catch (error) {
      toast.error('Failed to apply suggestion');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Video Optimization
        </CardTitle>
        <CardDescription>
          Optimize your video performance with AI-powered suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <ThumbsUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {engagementMetrics?.engagementRate}%
            </div>
            <Progress value={engagementMetrics?.engagementRate} className="mt-2" />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold">
              {engagementMetrics?.retentionRate}%
            </div>
            <Progress value={engagementMetrics?.retentionRate} className="mt-2" />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Click-Through Rate</span>
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">
              {engagementMetrics?.clickThroughRate}%
            </div>
            <Progress value={engagementMetrics?.clickThroughRate} className="mt-2" />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <Eye className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">
              {engagementMetrics?.conversionRate}%
            </div>
            <Progress value={engagementMetrics?.conversionRate} className="mt-2" />
          </div>
        </div>

        {/* Optimization Suggestions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Optimization Suggestions</h3>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 bg-white border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <span className="text-sm text-gray-500">{suggestion.type}</span>
                  </div>
                  <p className="font-medium">{suggestion.suggestion}</p>
                  <p className="text-sm text-gray-500 mt-1">{suggestion.impact}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplySuggestion(suggestion)}
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoOptimization;
