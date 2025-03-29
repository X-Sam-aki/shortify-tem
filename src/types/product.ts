
export interface Product {
  id: string;
  title: string;
  price: number; // Changed from string to number
  description: string;
  images: string[];
  rating: number;
  reviews: number;
  discount?: string;
  originalPrice?: string;
}
