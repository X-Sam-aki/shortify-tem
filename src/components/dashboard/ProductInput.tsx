
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { extractProductData } from '@/utils/productUtils';

interface ProductInputProps {
  onSubmit: (product: Product) => void;
}

const ProductInput: React.FC<ProductInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  const validateTemuUrl = (url: string) => {
    // Basic validation, in a real app this would be more precise
    const isValid = url.includes('temu.com');
    if (!isValid) {
      setUrlError('Please enter a valid Temu product URL');
    } else {
      setUrlError('');
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTemuUrl(url)) return;
    
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
          <div>
            <Input
              placeholder="https://www.temu.com/product.html"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
              disabled={isLoading}
            />
            {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="btn-primary flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching product...
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">For demonstration purposes:</h3>
            <p className="text-sm text-gray-600 mb-2">
              You can enter any URL that includes "temu.com" to continue.
              The app will generate sample product data to demonstrate the workflow.
            </p>
            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={() => setUrl('https://www.temu.com/example-product.html')}
              disabled={isLoading}
            >
              Use Sample URL
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductInput;
