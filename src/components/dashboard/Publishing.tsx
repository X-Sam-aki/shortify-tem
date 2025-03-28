
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from '@/components/ui/sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, Clock, YoutubeIcon, Sparkles, Loader2 } from 'lucide-react';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface PublishingProps {
  product: Product;
  videoSettings: any;
}

const Publishing: React.FC<PublishingProps> = ({ product, videoSettings }) => {
  const [publishOption, setPublishOption] = useState("now");
  const [title, setTitle] = useState(`🔥 ${product.title} ONLY $${product.price}! [LINK IN BIO]`);
  const [description, setDescription] = useState(
    `Check out this amazing deal on ${product.title}!\n\nOnly $${product.price} for a limited time.\n\n#shorts #temu #deals #shopping`
  );
  const [date, setDate] = useState<Date>();
  const [isPublishing, setIsPublishing] = useState(false);

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
      // Simulate video processing and uploading
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      if (publishOption === "now") {
        toast.success('Your Short has been published to YouTube!');
      } else {
        toast.success(`Your Short has been scheduled for ${date ? format(date, 'PP') : 'the selected date'}`);
      }
      
      // In a real app, this would navigate to a success page or show more details
    } catch (error) {
      console.error('Publishing error:', error);
      toast.error('Failed to publish your Short. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
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
                    rows={5}
                    className="input-field resize-none"
                  />
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <p>Includes hashtags and call-to-action</p>
                    <div className="ml-auto flex items-center">
                      {description.length}/5000
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Label className="mb-2 block">When to publish?</Label>
                  <RadioGroup
                    value={publishOption}
                    onValueChange={setPublishOption}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="now" id="now" className="mt-1" />
                      <div>
                        <Label htmlFor="now" className="font-medium">Publish Now</Label>
                        <p className="text-sm text-gray-500">Your video will be published immediately after processing</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="schedule" id="schedule" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="schedule" className="font-medium">Schedule for Later</Label>
                        <p className="text-sm text-gray-500 mb-2">Choose a specific date and time to publish</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                                disabled={publishOption !== "schedule"}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
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
                          
                          <Button
                            variant="outline"
                            className="flex items-center"
                            disabled={publishOption !== "schedule"}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Select Time
                          </Button>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handlePublish}
                className="btn-primary flex items-center"
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {publishOption === "now" ? "Publishing..." : "Scheduling..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {publishOption === "now" ? "Publish Now" : "Schedule"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Summary</CardTitle>
              <CardDescription>
                Review before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[9/16] bg-gray-200 rounded-md overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <YoutubeIcon className="h-12 w-12 text-red-600" />
                </div>
                {product.images[0] && (
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                )}
              </div>
              
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">TEMPLATE</h4>
                  <p className="text-sm font-medium">{videoSettings.template.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500">MUSIC</h4>
                  <p className="text-sm font-medium">{videoSettings.music.replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500">PUBLISHING</h4>
                  <p className="text-sm font-medium">
                    {publishOption === "now" 
                      ? "Publish Immediately" 
                      : date 
                        ? `Scheduled for ${format(date, "PPP")}` 
                        : "Schedule for Later"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-gray-500 justify-center">
              Video will be optimized for YouTube Shorts (9:16)
            </CardFooter>
          </Card>
          
          <div className="mt-4">
            <Card className="bg-brand-purple/5 border-brand-purple/30">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-brand-purple" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2 text-xs">
                <p>• Use emojis in your title to increase click-through rate</p>
                <p>• Include 5-7 relevant hashtags in your description</p>
                <p>• The best publishing times are 6-9 PM on weekdays</p>
                <p>• Follow up with comments when your video is live</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publishing;
