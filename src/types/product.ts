
export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  rating: number;
  reviews: number;
  discount?: string;
  originalPrice?: string;
}
