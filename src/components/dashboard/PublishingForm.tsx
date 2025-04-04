
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, Upload, Youtube, CheckCircle2, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useYouTube } from '@/hooks/use-youtube';
import { Product } from '@/types/product';

interface PublishingFormProps {
  videoUrl: string;
  product: Product;
  onPublished: (videoId: string, videoUrl: string) => void;
}

const PublishingForm: React.FC<PublishingFormProps> = ({ 
  videoUrl, 
  product,
  onPublished 
}) => {
  const [title, setTitle] = useState(`Check out this amazing ${product.title} from Temu 😍`);
  const [description, setDescription] = useState(
    `${product.description}\n\n` +
    `Price: $${product.price}\n` +
    `${product.discount ? `Discount: ${product.discount}\n` : ''}` +
    `Rating: ${product.rating}/5 (${product.reviews} reviews)\n\n` +
    `#shorts #temu #affiliate #shopping`
  );
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [privacyStatus, setPrivacyStatus] = useState<'private' | 'unlisted' | 'public'>('private');
  const [category, setCategory] = useState('22'); // People & Blogs
  const [tags, setTags] = useState(['shorts', 'temu', 'affiliate', 'shopping']);
  
  const { 
    isConnected, 
    isUploading, 
    uploadProgress, 
    uploadError, 
    uploadResult, 
    uploadVideo 
  } = useYouTube();
  
  const handlePublish = async () => {
    if (!videoUrl) {
      toast.error('Please generate a video first.');
      return;
    }
    
    if (!isConnected) {
      toast.error('Please connect your YouTube account first.');
      return;
    }
    
    let scheduledTime: Date | undefined;
    
    if (isScheduled && date && time) {
      const [hours, minutes] = time.split(':').map(Number);
      scheduledTime = new Date(date);
      scheduledTime.setHours(hours, minutes);
      
      // Make sure scheduled time is in the future
      if (scheduledTime <= new Date()) {
        toast.error('Scheduled time must be in the future.');
        return;
      }
    }
    
    try {
      const result = await uploadVideo(videoUrl, {
        title,
        description,
        tags,
        category,
        privacyStatus,
        scheduledTime
      });
      
      if (result.status === 'success') {
        toast.success('Video uploaded successfully!');
        onPublished(result.videoId, result.videoUrl);
      } else {
        toast.error(`Upload failed: ${result.errorMessage}`);
      }
    } catch (error) {
      console.error('Error publishing video:', error);
      toast.error('Failed to publish video');
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Publish to YouTube</CardTitle>
        <CardDescription>
          Configure your video details before publishing to YouTube
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Video Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="mt-1"
              maxLength={100}
            />
            <p className="text-right text-xs text-gray-500">{title.length}/100</p>
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="mt-1 min-h-32"
              maxLength={5000}
            />
            <p className="text-right text-xs text-gray-500">{description.length}/5000</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Privacy Status</Label>
              <Select 
                value={privacyStatus}
                onValueChange={(value) => setPrivacyStatus(value as 'private' | 'unlisted' | 'public')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select privacy status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select 
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22">People & Blogs</SelectItem>
                  <SelectItem value="24">Entertainment</SelectItem>
                  <SelectItem value="20">Gaming</SelectItem>
                  <SelectItem value="26">Howto & Style</SelectItem>
                  <SelectItem value="17">Sports</SelectItem>
                  <SelectItem value="28">Science & Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input 
              value={tags.join(', ')} 
              onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))} 
              className="mt-1"
              placeholder="shorts, temu, affiliate, shopping"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="schedule"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
            <Label htmlFor="schedule">Schedule for later</Label>
          </div>
          
          {isScheduled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
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
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>Time</Label>
                <div className="flex items-center mt-1">
                  <Input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)}
                    className="flex-1"
                  />
                  <Clock className="ml-2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-purple transition-all duration-500 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Upload failed</p>
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            </div>
          )}
          
          {uploadResult && uploadResult.status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Upload successful!</p>
                <p className="text-sm text-green-700">
                  Your video has been {isScheduled ? 'scheduled' : 'published'}.
                </p>
                <a 
                  href={uploadResult.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-brand-purple hover:underline mt-1 inline-block"
                >
                  View on YouTube
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button 
          onClick={handlePublish}
          disabled={isUploading || !isConnected || !videoUrl}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              <Youtube className="h-4 w-4 mr-2" />
              Publish to YouTube
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PublishingForm;
