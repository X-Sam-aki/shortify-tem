
export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  rating: number;
  reviews: number;
  originalPrice?: string;
  discount?: string;
  url?: string; // Add this property
}
