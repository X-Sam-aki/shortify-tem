
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
  url?: string;
  specifications?: Record<string, string>;
  shipping?: {
    free: boolean;
    estimatedDelivery?: string;
  };
  seller?: {
    name?: string;
    rating?: number;
    responseRate?: string;
  };
  platform?: string;
  timestamp?: number;
  aiEnhanced?: boolean;
  aiSummary?: string;
}
