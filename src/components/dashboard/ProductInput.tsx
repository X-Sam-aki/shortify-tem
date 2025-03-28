
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { extractProductData, validateTemuUrl } from '@/utils/productUtils';

interface ProductInputProps {
  onSubmit: (product: Product) => void;
  savedProduct: Product | null;
}

const ProductInput: React.FC<ProductInputProps> = ({ onSubmit, savedProduct }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  // If there's a saved product, pre-populate the field
  useEffect(() => {
    if (savedProduct) {
      setUrl('https://www.temu.com/product-' + savedProduct.id + '.html');
    }
  }, [savedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTemuUrl(url)) {
      setUrlError('Please enter a valid Temu product URL (e.g., https://www.temu.com/product-12345.html)');
      return;
    }
    
    setUrlError('');
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to fetch product data
      // For demo purposes, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate extracting product data
      const productData = extractProductData(url);
      
      toast.success('Product information retrieved successfully!');
      onSubmit(productData);
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to fetch product data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enter Temu Product URL</CardTitle>
        <CardDescription>
          Paste the URL of a Temu product you'd like to create a YouTube Short for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  placeholder="https://www.temu.com/product.html"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  className="pl-10 input-field"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="ml-2 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            {savedProduct && (
              <div className="text-sm text-brand-purple">
                <span className="font-medium">Using saved product:</span> {savedProduct.title}
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">For demonstration purposes:</h3>
            <p className="text-sm text-gray-600 mb-2">
              You can enter any URL that includes "temu.com" to continue.
              The app will generate sample product data to demonstrate the workflow.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-sm"
                onClick={() => setUrl('https://www.temu.com/product-12345.html')}
                disabled={isLoading}
              >
                Use Sample URL
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-sm"
                onClick={() => setUrl('https://www.temu.com/products/wireless-earbuds-123456')}
                disabled={isLoading}
              >
                Use Alternative URL Format
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductInput;
