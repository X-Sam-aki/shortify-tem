import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { YouTubeService } from '@/services/youtubeService';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function YouTubeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        logger.error('YouTube auth error:', error);
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

      try {
        const youtubeService = YouTubeService.getInstance();
        const success = await youtubeService.handleAuthCallback(code);

        if (success) {
          setStatus('success');
          toast.success('YouTube account connected successfully');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setStatus('error');
          toast.error('Failed to connect YouTube account');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (error) {
        logger.error('Error handling YouTube callback:', error);
        setStatus('error');
        toast.error('Failed to connect YouTube account');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {status === 'processing' && (
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connecting YouTube Account</h2>
          <p className="text-gray-500">Please wait while we complete the connection...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Successful!</h2>
          <p className="text-gray-500">Redirecting you back...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            ✕
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
          <p className="text-gray-500">Redirecting you back...</p>
        </div>
      )}
    </div>
  );
} 