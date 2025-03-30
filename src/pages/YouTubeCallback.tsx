import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { YouTubeService } from '@/services/youtubeService';

const YouTubeCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const youtubeService = YouTubeService.getInstance();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No authorization code received');
        }

        const success = await youtubeService.handleAuthCallback(code);
        if (success) {
          toast.success('Successfully connected to YouTube!');
        } else {
          throw new Error('Failed to complete YouTube connection');
        }
      } catch (error) {
        console.error('YouTube callback error:', error);
        toast.error('Failed to connect to YouTube');
      } finally {
        // Redirect back to dashboard
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Connecting to YouTube</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          <p className="text-sm text-gray-500 text-center">
            Please wait while we complete the connection...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeCallback; 