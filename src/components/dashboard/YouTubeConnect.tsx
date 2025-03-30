import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { YoutubeIcon, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { YouTubeService } from '@/services/youtubeService';

const YouTubeConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const youtubeService = YouTubeService.getInstance();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const isInitialized = await youtubeService.initialize();
      setIsConnected(isInitialized);
    } catch (error) {
      console.error('Failed to check YouTube connection:', error);
      setIsConnected(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const authUrl = youtubeService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get YouTube auth URL:', error);
      toast.error('Failed to connect to YouTube');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('youtube_tokens');
    setIsConnected(false);
    toast.success('Disconnected from YouTube');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <YoutubeIcon className="h-5 w-5 mr-2 text-red-600" />
          YouTube Connection
        </CardTitle>
        <CardDescription>
          Connect your YouTube account to enable video publishing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-500">Connected to YouTube</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-500">Not connected</span>
              </>
            )}
          </div>
          {isConnected ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="text-sm"
            >
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="text-sm"
            >
              {isLoading ? 'Connecting...' : 'Connect YouTube'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeConnect; 