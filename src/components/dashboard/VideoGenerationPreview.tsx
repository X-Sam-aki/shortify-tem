
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, YoutubeIcon, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { VideoGenerationOptions, VideoGenerationResult, generateVideo } from '@/services/videoGenerator';

interface VideoGenerationPreviewProps {
  product: Product;
  videoSettings: VideoGenerationOptions;
  onVideoGenerated?: (result: VideoGenerationResult) => void;
}

const VideoGenerationPreview: React.FC<VideoGenerationPreviewProps> = ({ 
  product, 
  videoSettings,
  onVideoGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateVideo(product, videoSettings);
      setVideoResult(result);
      
      if (result.status === 'success') {
        toast.success('Video generated successfully!');
        // Notify the parent component about the generated video
        if (onVideoGenerated) {
          onVideoGenerated(result);
        }
      } else {
        toast.error(`Failed to generate video: ${result.errorMessage}`);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('An unexpected error occurred while generating the video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Video Generation</CardTitle>
        <CardDescription>
          Generate and preview your YouTube Short
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[9/16] bg-gray-200 rounded-md overflow-hidden relative">
          {videoResult?.videoUrl ? (
            // If we have a video URL, show the video
            <video 
              src={videoResult.videoUrl} 
              className="w-full h-full object-contain"
              controls
              poster={videoResult.thumbnailUrl}
            />
          ) : (
            // Otherwise show a placeholder with product image
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <YoutubeIcon className="h-12 w-12 text-red-600 mb-4" />
              {product.images[0] && (
                <img 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}
              <div className="z-10 text-white text-center px-4">
                <p className="font-medium mb-2">Preview Not Generated</p>
                <p className="text-xs">Click "Generate Preview" to create your video</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-2">
          <Button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="flex items-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : videoResult?.videoUrl ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </>
            ) : (
              <>
                Generate Preview
              </>
            )}
          </Button>
          
          {videoResult?.videoUrl && (
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => {
                // Create a temporary anchor element to download the video
                const a = document.createElement('a');
                a.href = videoResult.videoUrl;
                a.download = `${product.title.replace(/\s+/g, '_')}_video.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-center text-gray-500">
        {isGenerating ? (
          "This may take up to 30 seconds..."
        ) : videoResult?.videoUrl ? (
          "Video is ready for publishing to YouTube"
        ) : (
          "Generate a preview before publishing"
        )}
      </CardFooter>
    </Card>
  );
};

export default VideoGenerationPreview;
