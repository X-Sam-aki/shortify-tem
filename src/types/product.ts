
export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | string;
  discount?: string;
  rating: number;
  reviews: number;
  images: string[];
  videos?: string[];
  url?: string;
  platform?: string;
  timestamp?: string | number;
  aiEnhanced?: boolean;
  aiSummary?: string;
  shipping?: {
    free: boolean;
    estimatedDelivery?: string;
  };
  seller?: {
    name?: string;
    rating?: number;
    responseRate?: string;
  };
  specifications?: Record<string, string>;
}
