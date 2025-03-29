
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Music } from 'lucide-react';
import { Product } from '@/types/product';

interface VideoPreviewProps {
  product: Product;
  selectedTemplate: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ product, selectedTemplate }) => {
  const productImage = product.images[0];

  return (
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
                  <span>${product.price.toFixed(2)}</span>
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
                  <span>${product.price.toFixed(2)}</span>
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
                  <span>${product.price.toFixed(2)}</span>
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
                  {product.title} - ${product.price.toFixed(2)}
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
  );
};

export default VideoPreview;
