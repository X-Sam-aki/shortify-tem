import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { extractProductData } from '@/utils/productUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download, Eye, Link as LinkIcon, ChevronRight, Copy, X, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';

interface ExtractedData {
  videos: string[];
  images: string[];
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
}

export function LinkExtractor() {
  const [url, setUrl] = useState('');
  const [showCustomization, setShowCustomization] = useState(false);
  const [enhanceWithAI, setEnhanceWithAI] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    videos: true,
    images: true,
    title: true,
    description: true,
    price: true,
    rating: true,
    reviews: true,
  });

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', url, enhanceWithAI],
    queryFn: () => extractProductData(url, enhanceWithAI),
    enabled: !!url,
  });

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }
    setShowCustomization(false);
    refetch();
  }, [url, refetch]);

  const handleClear = useCallback(() => {
    setUrl('');
    setEnhanceWithAI(false);
    setShowCustomization(false);
  }, []);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard');
    });
  }, [url]);

  const handleItemToggle = (item: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleExport = () => {
    if (!product) return;

    const selectedData = Object.entries(selectedItems)
      .filter(([_, selected]) => selected)
      .reduce((acc, [key]) => ({
        ...acc,
        [key]: product[key as keyof Product],
      }), {});

    const dataStr = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold">Enhanced Link Extractor</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Extract and manage data from your favorite product links. Select the data you want to keep and export it in your preferred format.
        </p>
      </div>

      <form onSubmit={handleUrlSubmit} className="space-y-4 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              type="url"
              placeholder="Enter product URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pr-10"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Extract
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ai-enhance"
            checked={enhanceWithAI}
            onCheckedChange={(checked) => setEnhanceWithAI(checked as boolean)}
          />
          <Label htmlFor="ai-enhance">✨ Enhance product description with AI</Label>
        </div>
      </form>

      {isLoading && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Extracting product data...</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-destructive">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-destructive/15 text-destructive p-4 rounded-lg max-w-md">
              <p className="font-medium">Error extracting data</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {product && !showCustomization && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">Extracted Data Preview</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Source URL:</p>
                  <Button variant="ghost" size="sm" onClick={handleCopyUrl} className="h-6 px-2">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy URL
                  </Button>
                </div>
              </div>
              <Button onClick={() => setShowCustomization(true)}>
                Customize Data <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[600px] border rounded-lg p-4">
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Title</h3>
                      <p className="text-xl">{product.title}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Price</h3>
                        <p className="text-2xl font-bold">${product.price}</p>
                        {product.originalPrice && (
                          <p className="text-gray-500 line-through">${product.originalPrice}</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-1">Rating</h3>
                        <p className="text-xl">{product.rating} / 5</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-1">Reviews</h3>
                        <p className="text-xl">{product.reviews}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {product.images && product.images.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Images</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {product.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Product image ${index + 1}`}
                              className="rounded-lg object-cover w-full aspect-square"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {product.videos && product.videos.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          <Video className="h-4 w-4 inline mr-2" />
                          Videos
                        </h3>
                        <div className="grid gap-4">
                          {product.videos.map((video, index) => (
                            <div key={index} className="aspect-video">
                              <video
                                src={video}
                                controls
                                className="w-full h-full rounded-lg"
                                poster={product.images?.[0]}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {product.aiEnhanced && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">✨ AI Enhanced Description</h3>
                    <p className="text-gray-700">{product.aiSummary}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
      )}

      {product && showCustomization && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowCustomization(false)}
              className="gap-2"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Preview
            </Button>
            <h2 className="text-2xl font-semibold">Customize Export</h2>
          </div>

          <Tabs defaultValue="preview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview Selection</TabsTrigger>
              <TabsTrigger value="export">Export Data</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Select Data to Include</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedItems).map(([item, selected]) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={selected}
                          onCheckedChange={() => handleItemToggle(item)}
                        />
                        <Label htmlFor={item} className="capitalize">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {selectedItems.images && product.images && (
                      <div>
                        <h4 className="font-medium mb-2">Images</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {product.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Product image ${index + 1}`}
                              className="rounded-lg object-cover w-full aspect-square"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItems.title && (
                      <div>
                        <h4 className="font-medium mb-2">Title</h4>
                        <p>{product.title}</p>
                      </div>
                    )}

                    {selectedItems.description && (
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p>{product.description}</p>
                      </div>
                    )}

                    {selectedItems.price && (
                      <div>
                        <h4 className="font-medium mb-2">Price</h4>
                        <p>${product.price}</p>
                      </div>
                    )}

                    {selectedItems.rating && (
                      <div>
                        <h4 className="font-medium mb-2">Rating</h4>
                        <p>{product.rating} / 5</p>
                      </div>
                    )}

                    {selectedItems.reviews && (
                      <div>
                        <h4 className="font-medium mb-2">Reviews</h4>
                        <p>{product.reviews}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <h3 className="font-semibold">Export Selected Data</h3>
                <p className="text-muted-foreground text-center">
                  Download your customized selection in JSON format
                </p>
                <Button onClick={handleExport} className="w-full max-w-xs">
                  <Download className="mr-2 h-4 w-4" />
                  Export as JSON
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
} 