
import { useState, useCallback } from 'react';
import { YouTubeService, YouTubeVideoMetadata, YouTubeVideoResponse } from '@/services/youtubeService';

export function useYouTube() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<YouTubeVideoResponse | null>(null);
  
  const youtubeService = YouTubeService.getInstance();

  /**
   * Check if user is connected to YouTube
   */
  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      const initialized = await youtubeService.initialize();
      setIsConnected(initialized);
      return initialized;
    } catch (error) {
      console.error('Failed to check YouTube connection:', error);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get YouTube auth URL
   */
  const getAuthUrl = useCallback(() => {
    return youtubeService.getAuthUrl();
  }, []);

  /**
   * Handle YouTube auth callback
   */
  const handleAuthCallback = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await youtubeService.handleAuthCallback(code);
      setIsConnected(success);
      return success;
    } catch (error) {
      console.error('Failed to handle YouTube auth callback:', error);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Disconnect from YouTube
   */
  const disconnect = useCallback(() => {
    localStorage.removeItem('youtube_tokens');
    setIsConnected(false);
  }, []);

  /**
   * Upload video to YouTube
   */
  const uploadVideo = useCallback(async (
    videoUrl: string,
    metadata: YouTubeVideoMetadata
  ): Promise<YouTubeVideoResponse> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const result = await youtubeService.uploadVideo(
        videoUrl,
        metadata,
        (progress) => setUploadProgress(progress)
      );
      
      setUploadResult(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(errorMessage);
      
      return {
        videoId: '',
        videoUrl: '',
        thumbnailUrl: '',
        status: 'error',
        errorMessage
      };
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Get channel information
   */
  const getChannelInfo = useCallback(async () => {
    try {
      return await youtubeService.getChannelInfo();
    } catch (error) {
      console.error('Failed to get channel info:', error);
      return null;
    }
  }, []);

  // Initialize connection check
  useState(() => {
    checkConnection();
  });

  return {
    isConnected,
    isLoading,
    isUploading,
    uploadProgress,
    uploadError,
    uploadResult,
    checkConnection,
    getAuthUrl,
    handleAuthCallback,
    disconnect,
    uploadVideo,
    getChannelInfo
  };
}
