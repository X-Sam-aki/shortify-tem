
export interface Product {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  videos?: string[];
  url?: string;
  platform?: string;
  timestamp?: string;
  aiEnhanced?: boolean;
  aiSummary?: string;
  // Include any other properties used in the codebase
}
