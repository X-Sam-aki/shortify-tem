import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { YouTubeService } from '@/services/youtubeService';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Connecting YouTube Account
              </h2>
              <p className="mt-2 text-gray-600">
                Please wait while we complete the authentication process...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 text-green-500">
                <svg
                  className="h-full w-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Successfully Connected
              </h2>
              <p className="mt-2 text-gray-600">
                Your YouTube account has been connected successfully.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg
                  className="h-full w-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Connection Failed
              </h2>
              <p className="mt-2 text-gray-600">
                There was an error connecting your YouTube account.
              </p>
            </>
          )}

          <p className="mt-4 text-sm text-gray-500">
            Redirecting you back to the dashboard...
          </p>
        </div>
      </div>
    </div>
  );
} 