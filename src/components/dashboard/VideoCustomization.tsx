
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Music, Type, Layout, Image } from 'lucide-react';
import { Product } from '@/types/product';
import { toast } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface VideoCustomizationProps {
  product: Product;
  onComplete: (settings: any) => void;
}

const VideoCustomization: React.FC<VideoCustomizationProps> = ({ product, onComplete }) => {
  const [activeTab, setActiveTab] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState("flash-deal");
  const [selectedMusic, setSelectedMusic] = useState("upbeat");
  
  const handleComplete = () => {
    const settings = {
      template: selectedTemplate,
      music: selectedMusic,
      // In a real app, would include text overlay settings, animations, etc.
    };
    
    toast.success('Video customization complete!');
    onComplete(settings);
  };
  
  const productImage = product.images[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span>Customize Your Video</span>
              </CardTitle>
              <CardDescription>
                Personalize your YouTube Short with templates, music, and text overlays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="template" className="flex items-center">
                    <Layout className="h-4 w-4 mr-2" /> Template
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center">
                    <Type className="h-4 w-4 mr-2" /> Text
                  </TabsTrigger>
                  <TabsTrigger value="music" className="flex items-center">
                    <Music className="h-4 w-4 mr-2" /> Music
                  </TabsTrigger>
                </TabsList>
                
                {/* Template Selection */}
                <TabsContent value="template" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Choose a Template</h3>
                    <RadioGroup
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="flash-deal" id="flash-deal" className="mt-1" />
                        <div>
                          <Label htmlFor="flash-deal" className="font-medium">Flash Deal</Label>
                          <p className="text-sm text-gray-500">High-energy template with price animations</p>
                          <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Popular for limited-time offers</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="product-showcase" id="product-showcase" className="mt-1" />
                        <div>
                          <Label htmlFor="product-showcase" className="font-medium">Product Showcase</Label>
                          <p className="text-sm text-gray-500">Clean layout focused on product features</p>
                          <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Best for detailed product videos</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="testimonial" id="testimonial" className="mt-1" />
                        <div>
                          <Label htmlFor="testimonial" className="font-medium">Testimonial Style</Label>
                          <p className="text-sm text-gray-500">Displays customer reviews alongside product</p>
                          <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Builds trust with social proof</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="before-after" id="before-after" className="mt-1" />
                        <div>
                          <Label htmlFor="before-after" className="font-medium">Before & After</Label>
                          <p className="text-sm text-gray-500">Shows problem/solution comparison</p>
                          <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Great for transformative products</div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>
                
                {/* Text Customization */}
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Text Customization</h3>
                    <p className="text-sm text-gray-500">
                      Customize the text overlays that will appear in your video
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Font Style</Label>
                        <Select defaultValue="montserrat">
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="montserrat">Montserrat</SelectItem>
                            <SelectItem value="oswald">Oswald</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="poppins">Poppins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Color Scheme</Label>
                        <Select defaultValue="purple">
                          <SelectTrigger>
                            <SelectValue placeholder="Select color scheme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="purple">Purple & Teal</SelectItem>
                            <SelectItem value="red">Red & Black</SelectItem>
                            <SelectItem value="blue">Blue & Yellow</SelectItem>
                            <SelectItem value="green">Green & White</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Animation Style</Label>
                        <Select defaultValue="fade">
                          <SelectTrigger>
                            <SelectValue placeholder="Select animation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fade">Fade In</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="slide">Slide</SelectItem>
                            <SelectItem value="bounce">Bounce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Dynamic Text Variables</p>
                      <p className="text-xs text-gray-500 mt-1">
                        The following variables will be replaced with actual product data:
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-100 p-1 rounded">$product_title</div>
                        <div className="bg-gray-100 p-1 rounded">$price</div>
                        <div className="bg-gray-100 p-1 rounded">$discount_percentage</div>
                        <div className="bg-gray-100 p-1 rounded">$rating</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Music Selection */}
                <TabsContent value="music" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Music Selection</h3>
                    <p className="text-sm text-gray-500">
                      Choose background music for your video
                    </p>
                    
                    <RadioGroup
                      value={selectedMusic}
                      onValueChange={setSelectedMusic}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upbeat" id="upbeat" />
                          <Label htmlFor="upbeat" className="font-medium cursor-pointer">Upbeat Pop</Label>
                        </div>
                        <Button variant="outline" size="sm" className="h-8">
                          Preview
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="electronic" id="electronic" />
                          <Label htmlFor="electronic" className="font-medium cursor-pointer">Electronic Beat</Label>
                        </div>
                        <Button variant="outline" size="sm" className="h-8">
                          Preview
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="acoustic" id="acoustic" />
                          <Label htmlFor="acoustic" className="font-medium cursor-pointer">Acoustic Chill</Label>
                        </div>
                        <Button variant="outline" size="sm" className="h-8">
                          Preview
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cinematic" id="cinematic" />
                          <Label htmlFor="cinematic" className="font-medium cursor-pointer">Cinematic</Label>
                        </div>
                        <Button variant="outline" size="sm" className="h-8">
                          Preview
                        </Button>
                      </div>
                    </RadioGroup>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Volume Settings</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Adjust the music volume to balance with any voiceover you might add later
                      </p>
                      <div className="mt-2 px-2">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-teal w-3/4 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleComplete}
                className="btn-primary flex items-center"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Preview</CardTitle>
              <CardDescription>
                See how your Short will look
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative w-[180px] h-[320px] bg-gray-900 rounded-md overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className="h-16 w-16 text-gray-600" />
                </div>
                {productImage && (
                  <img 
                    src={productImage} 
                    alt={product.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                )}
                
                {/* Template overlay elements */}
                {selectedTemplate === "flash-deal" && (
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-full w-fit">
                      HOT DEAL
                    </div>
                    <div className="space-y-2">
                      <div className="bg-black/70 text-white p-2 text-xs font-bold rounded">
                        {product.title}
                      </div>
                      <div className="bg-brand-teal text-white p-2 text-xs font-bold rounded flex justify-between">
                        <span>NOW ONLY</span>
                        <span>${product.price}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTemplate === "product-showcase" && (
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="space-y-2">
                      <div className="bg-white/80 p-2 text-xs font-bold rounded text-black">
                        {product.title}
                      </div>
                      <div className="bg-black/70 text-white p-2 text-xs font-bold rounded flex justify-between">
                        <span>Price:</span>
                        <span>${product.price}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTemplate === "testimonial" && (
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="space-y-2">
                      <div className="bg-white/80 p-2 text-xs rounded text-black">
                        "I love this product! It's exactly what I needed!" - Sarah K.
                      </div>
                      <div className="bg-black/70 text-white p-2 text-xs font-bold rounded flex justify-between">
                        <span>{product.title}</span>
                        <span>${product.price}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTemplate === "before-after" && (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-1/2 border-b border-white/50 p-2 flex items-start justify-end">
                      <div className="bg-red-600/80 text-white text-xs p-1 rounded">BEFORE</div>
                    </div>
                    <div className="h-1/2 p-2 flex flex-col justify-between">
                      <div className="flex justify-end">
                        <div className="bg-green-600/80 text-white text-xs p-1 rounded">AFTER</div>
                      </div>
                      <div className="bg-black/70 text-white p-2 text-xs font-bold rounded">
                        {product.title} - ${product.price}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Music icon */}
                <div className="absolute top-3 right-3">
                  <Music className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-center text-xs text-gray-500">
                This is a simplified preview. Your actual video will be more dynamic.
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Name:</span> {product.title}
                </div>
                <div>
                  <span className="font-semibold">Price:</span> ${product.price}
                </div>
                <div>
                  <span className="font-semibold">Rating:</span> {product.rating}/5 ({product.reviews} reviews)
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCustomization;
