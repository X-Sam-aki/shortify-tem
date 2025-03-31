import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { extractProductData, validateTemuUrl } from '@/utils/productUtils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const LinkExtractorTest = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // First validate the URL
      if (!validateTemuUrl(url)) {
        throw new Error('Invalid Temu URL format. Please enter a valid Temu product URL.');
      }

      // Try to extract the product data
      const productData = await extractProductData(url);
      setResult(productData);
      toast.success('Product data extracted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to extract product data');
      toast.error(err.message || 'Failed to extract product data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Link Extractor Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Temu product URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleTest}
              disabled={isLoading || !url}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="font-semibold">Extracted Data:</h3>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Example URLs:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full text-left"
                onClick={() => setUrl('https://www.temu.com/product-123456.html')}
              >
                https://www.temu.com/product-123456.html
              </Button>
              <Button
                variant="outline"
                className="w-full text-left"
                onClick={() => setUrl('https://www.temu.com/products/wireless-earbuds-123456')}
              >
                https://www.temu.com/products/wireless-earbuds-123456
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkExtractorTest; 