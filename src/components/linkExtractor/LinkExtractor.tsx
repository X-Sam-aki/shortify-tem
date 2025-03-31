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
import { Loader2, Download, Eye, Link } from 'lucide-react';
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
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    videos: true,
    images: true,
    title: true,
    description: true,
    price: true,
    rating: true,
    reviews: true,
  });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', url],
    queryFn: () => extractProductData(url),
    enabled: !!url,
  });

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }
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

      <form onSubmit={handleUrlSubmit} className="flex gap-2 max-w-2xl mx-auto">
        <Input
          type="url"
          placeholder="Enter product URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              Extract
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
          Error extracting data: {error.message}
        </div>
      )}

      {product && (
        <Card className="p-6">
          <Tabs defaultValue="preview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Select Data to Extract</h3>
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
                              className="rounded-lg object-cover w-full h-32"
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
                  Choose your preferred export format and download the selected data.
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