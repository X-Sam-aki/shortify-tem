
export interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  images: string[];
  rating: number;
  reviews: number;
  discount?: string;
  originalPrice?: string;
}
