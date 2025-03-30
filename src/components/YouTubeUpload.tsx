import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { YouTubeService, YouTubeVideoMetadata } from '@/services/youtubeService';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface YouTubeUploadProps {
  videoUrl: string;
}

export function YouTubeUpload({ videoUrl }: YouTubeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState<YouTubeVideoMetadata>({
    title: '',
    description: '',
    tags: [],
    category: 'entertainment',
    privacyStatus: 'private'
  });

  const handleUpload = async () => {
    if (!metadata.title) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);
    const youtubeService = YouTubeService.getInstance();

    try {
      const result = await youtubeService.uploadVideo(
        videoUrl,
        metadata,
        (progress) => setUploadProgress(progress)
      );

      if (result.status === 'success') {
        toast.success('Video uploaded successfully');
        logger.info('Video uploaded:', { videoId: result.videoId });
      } else {
        toast.error(result.errorMessage || 'Failed to upload video');
        logger.error('Upload failed:', result.errorMessage);
      }
    } catch (error) {
      logger.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Video Title"
        value={metadata.title}
        onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
        disabled={isUploading}
      />

      <Textarea
        placeholder="Video Description"
        value={metadata.description}
        onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
        disabled={isUploading}
      />

      <Input
        placeholder="Tags (comma separated)"
        value={metadata.tags.join(', ')}
        onChange={(e) => setMetadata({ ...metadata, tags: e.target.value.split(',').map(tag => tag.trim()) })}
        disabled={isUploading}
      />

      <Select
        value={metadata.category}
        onValueChange={(value) => setMetadata({ ...metadata, category: value })}
        disabled={isUploading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="entertainment">Entertainment</SelectItem>
          <SelectItem value="gaming">Gaming</SelectItem>
          <SelectItem value="howto">How-to & Style</SelectItem>
          <SelectItem value="music">Music</SelectItem>
          <SelectItem value="news">News</SelectItem>
          <SelectItem value="people">People & Blogs</SelectItem>
          <SelectItem value="sports">Sports</SelectItem>
          <SelectItem value="technology">Technology</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={metadata.privacyStatus}
        onValueChange={(value: 'private' | 'unlisted' | 'public') => 
          setMetadata({ ...metadata, privacyStatus: value })}
        disabled={isUploading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Privacy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="unlisted">Unlisted</SelectItem>
          <SelectItem value="public">Public</SelectItem>
        </SelectContent>
      </Select>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center text-gray-500">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleUpload}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload to YouTube'}
      </Button>
    </div>
  );
} 