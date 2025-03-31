
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Users, Eye, ThumbsUp, MessageSquare, Share2, DollarSign, TrendingUp } from 'lucide-react';
import { YouTubeService } from '@/services/youtubeService';
import type { YouTubeAnalytics as YouTubeAnalyticsType } from '@/services/youtubeService';
import { cn } from '@/lib/utils';
import { DateRange } from "react-day-picker";

interface YouTubeAnalyticsProps {
  videoId?: string;
}

const YouTubeAnalytics: React.FC<YouTubeAnalyticsProps> = ({ videoId }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [analytics, setAnalytics] = useState<YouTubeAnalyticsType | null>(null);
  const [channelAnalytics, setChannelAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const youtubeService = YouTubeService.getInstance();

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Convert DateRange to the format expected by the API
      const apiDateRange = dateRange && dateRange.from && dateRange.to ? {
        start: dateRange.from,
        end: dateRange.to
      } : undefined;

      const [videoAnalytics, channelStats] = await Promise.all([
        videoId ? youtubeService.getVideoAnalytics(videoId, apiDateRange) : null,
        youtubeService.getChannelAnalytics(apiDateRange)
      ]);
      setAnalytics(videoAnalytics || null);
      setChannelAnalytics(channelStats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, videoId]);

  const StatCard = ({ title, value, icon: Icon, description }: { title: string; value: string | number; icon: any; description?: string }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your video and channel performance
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange && dateRange.from && dateRange.to ? (
                `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={analytics?.views || 0}
          icon={Eye}
          description="Total video views"
        />
        <StatCard
          title="Likes"
          value={analytics?.likes || 0}
          icon={ThumbsUp}
          description="Total likes received"
        />
        <StatCard
          title="Comments"
          value={analytics?.comments || 0}
          icon={MessageSquare}
          description="Total comments"
        />
        <StatCard
          title="Shares"
          value={analytics?.shares || 0}
          icon={Share2}
          description="Total shares"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Subscribers"
          value={channelAnalytics?.totalSubscribers || 0}
          icon={Users}
          description="Total channel subscribers"
        />
        <StatCard
          title="Channel Views"
          value={channelAnalytics?.totalViews || 0}
          icon={Eye}
          description="Total channel views"
        />
        <StatCard
          title="Total Videos"
          value={channelAnalytics?.totalVideos || 0}
          icon={TrendingUp}
          description="Videos on channel"
        />
        <StatCard
          title="Estimated Revenue"
          value={`$${analytics?.estimatedRevenue || 0}`}
          icon={DollarSign}
          description="Based on views and engagement"
        />
      </div>
    </div>
  );
};

export default YouTubeAnalytics;
