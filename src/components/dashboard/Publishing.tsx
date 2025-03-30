import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, Clock, YoutubeIcon, Sparkles, Loader2 } from 'lucide-react';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import VideoGenerationPreview from './VideoGenerationPreview';
import YouTubeConnect from './YouTubeConnect';
import { YouTubeService, YouTubeVideoMetadata } from '@/services/youtubeService';
import YouTubeAnalytics from './YouTubeAnalytics';
import VideoOptimization from './VideoOptimization';

interface PublishingProps {
  product: Product;
  videoSettings: any;
  videoUrl: string;
}

const Publishing: React.FC<PublishingProps> = ({ product, videoSettings, videoUrl }) => {
  const [publishOption, setPublishOption] = useState("now");
  const [title, setTitle] = useState(`🔥 ${product.title} ONLY $${product.price}! [LINK IN BIO]`);
  const [description, setDescription] = useState(
    `Check out this amazing deal on ${product.title}!\n\nOnly $${product.price} for a limited time.\n\n#shorts #temu #deals #shopping`
  );
  const [date, setDate] = useState<Date>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [privacyStatus, setPrivacyStatus] = useState<'private' | 'unlisted' | 'public'>('private');
  const youtubeService = YouTubeService.getInstance();
  const [publishedVideoId, setPublishedVideoId] = useState<string | null>(null);

  const handleGenerateMetadata = () => {
    toast.success('Generated optimized metadata!');
    setTitle(`🔥 INCREDIBLE DEAL on ${product.title} (${product.price}!) 🔥`);
    setDescription(
      `You NEED to see this amazing ${product.title} from Temu!\n\n` +
      `✅ Only $${product.price}\n` +
      `✅ ${product.rating}/5 Stars (${product.reviews} reviews)\n` +
      `✅ Free shipping available\n\n` +
      `Limited time offer - check the link in my bio to get yours before they're gone!\n\n` +
      `#shorts #temudeals #shopping #amazonfinds #tiktokmademebuyit #dealoftheday`
    );
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      const metadata: YouTubeVideoMetadata = {
        title,
        description,
        tags: ['shorts', 'temu', 'deals', 'shopping', 'product review'],
        category: 'Shopping',
        privacyStatus,
        scheduledTime: publishOption === "schedule" ? date : undefined
      };

      const result = await youtubeService.uploadVideo(videoUrl, metadata);
      
      if (result.status === 'success') {
        toast.success('Your Short has been published to YouTube!');
        setPublishedVideoId(result.videoId);
        window.open(result.videoUrl, '_blank');
      } else {
        throw new Error(result.errorMessage || 'Failed to publish video');
      }
    } catch (error: any) {
      console.error('Publishing error:', error);
      toast.error(error.message || 'Failed to publish your Short. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <YouTubeConnect />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <YoutubeIcon className="h-5 w-5 mr-2 text-red-600" />
                <span>YouTube Publishing</span>
              </CardTitle>
              <CardDescription>
                Customize your video metadata and publishing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="title">Video Title</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 flex items-center text-xs"
                      onClick={handleGenerateMetadata}
                    >
                      <Sparkles className="h-3 w-3 mr-1" /> Generate Optimized Metadata
                    </Button>
                  </div>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    className="input-field"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {title.length}/100 characters
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field min-h-[120px]"
                    placeholder="Add a compelling description for your video..."
                  />
                </div>

                <div>
                  <Label>Privacy Settings</Label>
                  <RadioGroup
                    value={privacyStatus}
                    onValueChange={(value: 'private' | 'unlisted' | 'public') => setPrivacyStatus(value)}
                    className="grid grid-cols-3 gap-4 mt-2"
                  >
                    <div>
                      <RadioGroupItem value="private" id="private" className="peer sr-only" />
                      <Label
                        htmlFor="private"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Private
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="unlisted" id="unlisted" className="peer sr-only" />
                      <Label
                        htmlFor="unlisted"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Unlisted
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="public" id="public" className="peer sr-only" />
                      <Label
                        htmlFor="public"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Public
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Publishing Schedule</Label>
                  <RadioGroup
                    value={publishOption}
                    onValueChange={setPublishOption}
                    className="grid grid-cols-2 gap-4 mt-2"
                  >
                    <div>
                      <RadioGroupItem value="now" id="now" className="peer sr-only" />
                      <Label
                        htmlFor="now"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Upload className="mb-2 h-4 w-4" />
                        Publish Now
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="schedule" id="schedule" className="peer sr-only" />
                      <Label
                        htmlFor="schedule"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Clock className="mb-2 h-4 w-4" />
                        Schedule
                      </Label>
                    </div>
                  </RadioGroup>

                  {publishOption === "schedule" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || publishOption === "schedule" && !date}
                className="w-full"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <YoutubeIcon className="mr-2 h-4 w-4" />
                    Publish to YouTube
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <VideoGenerationPreview
            product={product}
            videoSettings={videoSettings}
          />
        </div>
      </div>

      {publishedVideoId && (
        <div className="mt-8 space-y-8">
          <YouTubeAnalytics videoId={publishedVideoId} />
          <VideoOptimization videoId={publishedVideoId} />
        </div>
      )}
    </div>
  );
};

export default Publishing;
