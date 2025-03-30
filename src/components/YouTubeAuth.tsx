import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { YouTubeService } from '@/services/youtubeService';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

export function YouTubeAuth() {
  const [isConnected, setIsConnected] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const youtubeService = YouTubeService.getInstance();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const initialized = await youtubeService.initialize();
      setIsConnected(initialized);

      if (initialized) {
        const info = await youtubeService.getChannelInfo();
        setChannelInfo(info);
      }
    } catch (error) {
      logger.error('Error checking YouTube connection:', error);
      setIsConnected(false);
    }
  };

  const handleConnect = () => {
    try {
      const authUrl = youtubeService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      logger.error('Error getting YouTube auth URL:', error);
      toast.error('Failed to initiate YouTube connection');
    }
  };

  const handleDisconnect = () => {
    try {
      localStorage.removeItem('youtube_tokens');
      setIsConnected(false);
      setChannelInfo(null);
      toast.success('YouTube account disconnected');
    } catch (error) {
      logger.error('Error disconnecting YouTube account:', error);
      toast.error('Failed to disconnect YouTube account');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">YouTube Connection</h2>
      
      {isConnected ? (
        <div>
          {channelInfo && (
            <div className="mb-4">
              <p className="font-medium">Connected Channel:</p>
              <p>{channelInfo.snippet?.title}</p>
              <p className="text-sm text-gray-500">
                {channelInfo.statistics?.subscriberCount} subscribers
              </p>
            </div>
          )}
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            className="w-full"
          >
            Disconnect YouTube Account
          </Button>
        </div>
      ) : (
        <Button
          variant="default"
          onClick={handleConnect}
          className="w-full"
        >
          Connect YouTube Account
        </Button>
      )}
    </div>
  );
} 