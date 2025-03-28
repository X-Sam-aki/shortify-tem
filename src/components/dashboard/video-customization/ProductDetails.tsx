
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from '@/types/product';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
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
  );
};

export default ProductDetails;
