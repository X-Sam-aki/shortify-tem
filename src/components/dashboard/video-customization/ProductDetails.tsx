
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from '@/types/product';
import { Badge } from "@/components/ui/badge";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  // Calculate if there's a discount
  const hasDiscount = !!product.originalPrice && !!product.discount;

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Product Details</CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-2 text-sm">
        <div>
          <span className="font-semibold">Name:</span> {product.title}
        </div>
        <div className="flex items-center">
          <span className="font-semibold">Price:</span> 
          <span className="ml-1">${product.price.toFixed(2)}</span>
          
          {hasDiscount && (
            <div className="ml-2 flex items-center">
              <span className="text-gray-500 line-through text-xs mr-1">${product.originalPrice}</span>
              <Badge variant="destructive" className="text-xs h-5">
                {product.discount} OFF
              </Badge>
            </div>
          )}
        </div>
        <div>
          <span className="font-semibold">Rating:</span> {product.rating}/5 ({product.reviews} reviews)
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetails;
