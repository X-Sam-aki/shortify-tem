import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { YouTubeService } from '@/services/youtubeService';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export default function YouTubeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          logger.error('YouTube authentication error:', error);
          toast.error('Failed to connect YouTube account');
          setStatus('error');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        if (!code) {
          logger.error('No authorization code received');
          toast.error('No authorization code received');
          setStatus('error');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        const youtubeService = YouTubeService.getInstance();
        const success = await youtubeService.handleAuthCallback(code);

        if (success) {
          logger.info('YouTube authentication successful');
          toast.success('YouTube account connected successfully');
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          logger.error('Failed to handle YouTube callback');
          toast.error('Failed to connect YouTube account');
          setStatus('error');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (error) {
        logger.error('Error handling YouTube callback:', error);
        toast.error('An error occurred while connecting YouTube account');
        setStatus('error');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'processing' && 'Connecting to YouTube'}
            {status === 'success' && 'Connection Successful'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'processing' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
              <p className="text-sm text-gray-500 text-center">
                Please wait while we complete the connection...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-8 w-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                ✓
              </div>
              <p className="text-sm text-gray-500 text-center">
                Your YouTube account has been connected successfully.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                ✕
              </div>
              <p className="text-sm text-gray-500 text-center">
                There was an error connecting your YouTube account.
              </p>
            </>
          )}

          <p className="text-xs text-gray-400 text-center">
            Redirecting you back to the dashboard...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
