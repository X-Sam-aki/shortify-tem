import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { extractProductData, validateTemuUrl } from '@/utils/productUtils';
import { toast } from 'sonner';
import { Loader2, Download, Eye, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Product } from '@/types/product';

interface DataSelection {
  images: boolean;
  videos: boolean;
  title: boolean;
  description: boolean;
  price: boolean;
  rating: boolean;
  reviews: boolean;
}

interface PreviewProps {
  product: Product;
  selection: DataSelection;
}

const ProductPreview: React.FC<PreviewProps> = ({ product, selection }) => {
  return (
    <div className="space-y-4">
      {selection.title && (
        <div>
          <h3 className="font-semibold">Title</h3>
          <p className="text-lg">{product.title}</p>
        </div>
      )}
      
      {selection.price && (
        <div>
          <h3 className="font-semibold">Price Information</h3>
          <div className="flex gap-2 items-baseline">
            <span className="text-2xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="text-gray-500 line-through">${product.originalPrice}</span>
            )}
            {product.discount && (
              <span className="text-green-600">({product.discount} off)</span>
            )}
          </div>
        </div>
      )}

      {selection.images && product.images && product.images.length > 0 && (
        <div>
          <h3 className="font-semibold">Images</h3>
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
            ))}
          </div>
        </div>
      )}

      {selection.description && (
        <div>
          <h3 className="font-semibold">Description</h3>
          <p className="text-gray-700">{product.description}</p>
        </div>
      )}

      {selection.rating && (
        <div>
          <h3 className="font-semibold">Rating</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐ {product.rating}</span>
            {selection.reviews && (
              <span className="text-gray-600">({product.reviews} reviews)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedLinkExtractor = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSelection, setDataSelection] = useState<DataSelection>({
    images: true,
    videos: true,
    title: true,
    description: true,
    price: true,
    rating: true,
    reviews: true,
  });

  const handleExtract = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!validateTemuUrl(url)) {
        throw new Error('Invalid Temu URL format. Please enter a valid Temu product URL.');
      }

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

  const handleExport = () => {
    if (!result) return;

    const exportData: any = {};
    if (dataSelection.title) exportData.title = result.title;
    if (dataSelection.description) exportData.description = result.description;
    if (dataSelection.price) {
      exportData.price = result.price;
      exportData.originalPrice = result.originalPrice;
      exportData.discount = result.discount;
    }
    if (dataSelection.images) exportData.images = result.images;
    if (dataSelection.rating) exportData.rating = result.rating;
    if (dataSelection.reviews) exportData.reviews = result.reviews;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Data exported successfully!');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Link Extractor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* URL Input and Extract Button */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter Temu product URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleExtract}
              disabled={isLoading || !url}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Extract
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {result && (
            <Tabs defaultValue="selection" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="selection">Data Selection</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>

              <TabsContent value="selection" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(dataSelection).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setDataSelection(prev => ({
                            ...prev,
                            [key]: checked === true
                          }))
                        }
                      />
                      <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Selected
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Preview Selected Data</DialogTitle>
                      </DialogHeader>
                      <ProductPreview product={result} selection={dataSelection} />
                    </DialogContent>
                  </Dialog>

                  <Button onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <ProductPreview product={result} selection={dataSelection} />
              </TabsContent>

              <TabsContent value="raw">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          )}

          <div className="space-y-2">
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

export default EnhancedLinkExtractor; 