import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { extractProductData } from '@/utils/productUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download, Eye, Link as LinkIcon, ChevronRight, Copy, X, Video, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { cn } from "@/lib/utils";

interface ExtractedData {
  videos: string[];
  images: string[];
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
}

type Step = 'input' | 'preview' | 'customize';

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'input', label: 'Enter URL', icon: <LinkIcon className="h-4 w-4" /> },
  { id: 'preview', label: 'Preview Data', icon: <Eye className="h-4 w-4" /> },
  { id: 'customize', label: 'Customize', icon: <Download className="h-4 w-4" /> },
];

export function LinkExtractor() {
  const [url, setUrl] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('input');
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
    queryFn: () => extractProductData(url),
    enabled: !!url,
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    try {
      new URL(url); // Validate URL format
      setCurrentStep('preview');
      refetch();
    } catch {
      toast.error('Please enter a valid URL');
    }
  }, [url, refetch]);

  const handleClear = useCallback(() => {
    setUrl('');
    setEnhanceWithAI(false);
    setCurrentStep('input');
  }, []);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
  }, [url]);

  const handleItemToggle = useCallback((item: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  }, []);

  const selectedData = useMemo(() => {
    if (!product) return null;
    return Object.entries(selectedItems)
      .filter(([_, selected]) => selected)
      .reduce((acc, [key]) => ({
        ...acc,
        [key]: product[key as keyof Product],
      }), {});
  }, [product, selectedItems]);

  const handleExport = useCallback(() => {
    if (!selectedData) return;

    try {
      const dataStr = JSON.stringify(selectedData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, [selectedData]);

  const renderSteps = () => (
    <div className="flex items-center justify-center mb-8" role="navigation" aria-label="Progress">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground shadow-lg scale-110"
                  : currentStep === 'customize' && step.id === 'preview'
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
              aria-current={currentStep === step.id ? "step" : undefined}
            >
              {step.icon}
            </div>
            <span
              className={cn(
                "ml-3 text-sm transition-colors duration-200",
                currentStep === step.id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-[2px] w-16 mx-4 transition-colors duration-200",
                currentStep === steps[index + 1].id || 
                (currentStep === 'customize' && step.id === 'input')
                  ? "bg-primary"
                  : "bg-muted"
              )}
              role="presentation"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderInputStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Enhanced Link Extractor
        </h1>
        <p className="text-muted-foreground text-center text-lg">
          Extract and manage data from your favorite product links. Select the data you want to keep and export it in your preferred format.
        </p>
      </div>

      <form onSubmit={handleUrlSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="url"
              placeholder="Enter product URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pr-10 h-12 text-lg"
              aria-label="Product URL"
              required
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear URL"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="h-12 px-6 text-lg flex-none"
            aria-label={isLoading ? "Extracting data..." : "Extract data"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-5 w-5" />
                Extract
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center space-x-3 bg-muted/50 p-4 rounded-lg">
          <Checkbox
            id="ai-enhance"
            checked={enhanceWithAI}
            onCheckedChange={(checked) => setEnhanceWithAI(checked as boolean)}
            className="h-5 w-5"
          />
          <Label htmlFor="ai-enhance" className="text-lg cursor-pointer select-none">
            ✨ Enhance product description with AI
          </Label>
        </div>
      </form>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Extracted Data
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Review the extracted information below</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClear} className="gap-2">
              <X className="h-4 w-4" />
              New Extract
            </Button>
            <Button onClick={() => setCurrentStep('customize')} className="gap-2">
              Customize Data
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card className="p-3 bg-muted/30 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate flex-1 text-muted-foreground font-mono">{url}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyUrl} 
              className="h-8 px-3 gap-1.5"
              aria-label="Copy URL to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy URL
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-lg">
        <ScrollArea className="h-[calc(100vh-280px)] pr-4">
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Title</h3>
                  <p className="text-xl font-semibold">{product?.title}</p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product?.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Price</h3>
                    <p className="text-2xl font-bold">${product?.price}</p>
                    {product?.originalPrice && (
                      <p className="text-gray-500 line-through text-sm">${product.originalPrice}</p>
                    )}
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Rating</h3>
                    <p className="text-xl font-semibold">{product?.rating} / 5</p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Reviews</h3>
                    <p className="text-xl font-semibold">{product?.reviews}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {product?.images && product.images.length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Images</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${product.title} - Image ${index + 1}`}
                          className="rounded-lg object-cover w-full aspect-square hover:scale-105 transition-transform cursor-zoom-in"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {product?.videos && product.videos.length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Video className="h-4 w-4" />
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
                            preload="metadata"
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

            {product?.aiEnhanced && (
              <div className="bg-blue-50 dark:bg-blue-950/50 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span> 
                  AI Enhanced Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.aiSummary}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Customize Export
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Select the data you want to include</p>
        </div>
        <Button variant="outline" onClick={() => setCurrentStep('preview')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Preview
        </Button>
      </div>

      <Card className="p-6 shadow-lg">
        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview Selection</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Data to Include</h3>
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  {Object.entries(selectedItems).map(([item, selected]) => (
                    <div key={item} className="flex items-center space-x-3">
                      <Checkbox
                        id={item}
                        checked={selected}
                        onCheckedChange={() => handleItemToggle(item)}
                        className="h-5 w-5"
                      />
                      <Label 
                        htmlFor={item} 
                        className="capitalize text-base cursor-pointer select-none"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg p-4 bg-muted/10">
                <div className="space-y-6">
                  {selectedItems.images && product?.images && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {product.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Selected image ${index + 1}`}
                            className="rounded-lg object-cover w-full aspect-square"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItems.title && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Title</h4>
                      <p className="bg-muted/30 p-2 rounded">{product?.title}</p>
                    </div>
                  )}

                  {selectedItems.description && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Description</h4>
                      <p className="bg-muted/30 p-2 rounded whitespace-pre-wrap">{product?.description}</p>
                    </div>
                  )}

                  {selectedItems.price && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Price</h4>
                      <p className="bg-muted/30 p-2 rounded">${product?.price}</p>
                    </div>
                  )}

                  {selectedItems.rating && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Rating</h4>
                      <p className="bg-muted/30 p-2 rounded">{product?.rating} / 5</p>
                    </div>
                  )}

                  {selectedItems.reviews && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Reviews</h4>
                      <p className="bg-muted/30 p-2 rounded">{product?.reviews}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="flex flex-col items-center space-y-6 py-8">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Export Selected Data</h3>
                <p className="text-muted-foreground">
                  Download your customized selection in JSON format
                </p>
              </div>
              <Button 
                onClick={handleExport} 
                size="lg"
                className="w-full max-w-xs h-12 text-lg gap-2"
              >
                <Download className="h-5 w-5" />
                Export as JSON
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {!isLoading && !error && renderSteps()}

        {isLoading && (
          <Card className="p-8 max-w-md mx-auto mt-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
              <p className="text-lg text-muted-foreground">Extracting product data...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-8 border-destructive max-w-md mx-auto mt-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-destructive/15 text-destructive p-6 rounded-lg">
                <p className="font-medium text-lg mb-2">Error extracting data</p>
                <p className="text-sm opacity-90">{error.message}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <X className="h-4 w-4" />
                  Try Different URL
                </Button>
                <Button variant="default" onClick={() => refetch()} className="gap-2">
                  <Loader2 className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {currentStep === 'input' && renderInputStep()}
            {currentStep === 'preview' && product && renderPreviewStep()}
            {currentStep === 'customize' && product && renderCustomizeStep()}
          </>
        )}
      </div>
    </div>
  );
}
