
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsContextType {
  recentVideos: any[];
  videoStats: Record<string, any>;
  channelStats: any;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [videoStats, setVideoStats] = useState<Record<string, any>>({});
  const [channelStats, setChannelStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch recent videos
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (videosError) throw new Error(videosError.message);
      
      setRecentVideos(videos || []);
      
      // Fetch video statistics
      if (videos && videos.length > 0) {
        const videoIds = videos.map(v => v.youtube_id).filter(Boolean);
        
        const stats: Record<string, any> = {};
        
        for (const videoId of videoIds) {
          const { data: videoStat, error: statError } = await supabase
            .from('video_statistics')
            .select('*')
            .eq('youtube_id', videoId)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();
            
          if (!statError && videoStat) {
            stats[videoId] = videoStat;
          }
        }
        
        setVideoStats(stats);
      }
      
      // Fetch channel statistics
      const { data: channelData, error: channelError } = await supabase
        .from('channel_statistics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
        
      if (!channelError && channelData) {
        setChannelStats(channelData);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred loading analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  return (
    <AnalyticsContext.Provider
      value={{
        recentVideos,
        videoStats,
        channelStats,
        isLoading,
        error,
        refreshData: fetchAnalyticsData
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
