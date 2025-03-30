import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Target, Clock, Tag, MessageSquare } from 'lucide-react';
import { YouTubeService } from '@/services/youtubeService';

interface VideoOptimizationProps {
  videoId: string;
}

interface OptimizationSuggestion {
  type: 'title' | 'description' | 'thumbnail' | 'tags' | 'timing';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
}

const VideoOptimization: React.FC<VideoOptimizationProps> = ({ videoId }) => {
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const youtubeService = YouTubeService.getInstance();

  const fetchOptimizationData = async () => {
    setIsLoading(true);
    try {
      const [metrics, videoStats] = await Promise.all([
        youtubeService.getVideoAnalytics(videoId),
        youtubeService.youtube.videos.list({
          part: 'statistics,snippet',
          id: videoId
        })
      ]);

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
        averageViewDuration: 45,
        retentionRate: 65,
        clickThroughRate: 2.5,
        conversionRate: 1.2
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
      if (snippet.tags.length < 5) {
        newSuggestions.push({
          type: 'tags',
          priority: 'medium',
          suggestion: 'Add more relevant tags to improve discoverability',
          impact: 'Medium impact on reach'
        });
      }

      // Engagement optimization
      if (views > 0 && engagementRate < 5) {
        newSuggestions.push({
          type: 'engagement',
          priority: 'high',
          suggestion: 'Improve viewer engagement by adding calls-to-action',
          impact: 'High impact on algorithm ranking'
        });
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to fetch optimization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizationData();
  }, [videoId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'title':
        return <TrendingUp className="h-4 w-4" />;
      case 'description':
        return <MessageSquare className="h-4 w-4" />;
      case 'tags':
        return <Tag className="h-4 w-4" />;
      case 'timing':
        return <Clock className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Video Optimization</h2>
          <p className="text-muted-foreground">
            Improve your video performance with data-driven insights
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{engagementMetrics?.engagementRate || 0}%</p>
                <Progress value={engagementMetrics?.engagementRate || 0} className="w-[60%]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{engagementMetrics?.retentionRate || 0}%</p>
                <Progress value={engagementMetrics?.retentionRate || 0} className="w-[60%]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Click-Through Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{engagementMetrics?.clickThroughRate || 0}%</p>
                <Progress value={engagementMetrics?.clickThroughRate || 0} className="w-[60%]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{engagementMetrics?.conversionRate || 0}%</p>
                <Progress value={engagementMetrics?.conversionRate || 0} className="w-[60%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
          <CardDescription>
            Recommendations to improve your video performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <Alert key={index} className="flex items-start">
                <AlertCircle className="h-4 w-4 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTitle className="flex items-center gap-2">
                      {getMetricIcon(suggestion.type)}
                      {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                    </AlertTitle>
                    <Badge variant="secondary" className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <AlertDescription>
                    <p className="font-medium">{suggestion.suggestion}</p>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.impact}</p>
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoOptimization; 