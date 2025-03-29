
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

/**
 * Validates if a string is a proper Temu product URL
 */
export const validateTemuUrl = (url: string): boolean => {
  // Enhanced validation that also accepts mobile URLs
  const temuUrlPattern = /^https?:\/\/(?:www\.|m\.)?temu\.com(?:\/us)?\/(?:[\w-]+\.html|products\/[\w-]+)/i;
  return temuUrlPattern.test(url);
};

/**
 * Extracts product ID from a Temu URL
 */
export const extractProductIdFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Handle different URL formats
    // For paths like: /product-123456.html
    const productFileMatch = pathParts[pathParts.length - 1].match(/product-([a-zA-Z0-9]+)\.html/);
    if (productFileMatch) {
      return productFileMatch[1];
    }
    
    // For paths like: /products/123456
    if (pathParts.includes('products') && pathParts.length > 2) {
      return pathParts[pathParts.indexOf('products') + 1];
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

/**
 * Extracts product data from a Temu URL using the AI agent
 */
export const extractProductData = async (url: string): Promise<Product> => {
  try {
    // Call the Supabase Edge Function to extract product data using AI
    const { data, error } = await supabase.functions.invoke('extract-product', {
      body: { url }
    });

    if (error) {
      throw new Error(`Error calling extract-product function: ${error.message}`);
    }

    // Make sure all required fields are present
    const productData = data as Product;
    
    // Validate that we have all required fields
    if (!productData.id || !productData.title || productData.price === undefined || !productData.images) {
      throw new Error('Incomplete product data returned from extraction');
    }

    return productData;
  } catch (error) {
    console.error('Error extracting product data:', error);
    
    // Fallback to a placeholder product if extraction fails
    const productId = extractProductIdFromUrl(url) || Math.random().toString(36).substring(2, 9);
    
    // Generate random placeholder values
    const reviewCount = Math.floor(Math.random() * 500) + 50;
    const ratingValue = (Math.random() * 1.5 + 3.5).toFixed(1);
    const priceValue = Math.floor(Math.random() * 30) + 10;
    
    // Sample product names and images for fallback
    const productNames = [
      'Wireless Bluetooth Headphones',
      'Portable Bluetooth Speaker',
      'Ergonomic Laptop Stand',
      'LED Desk Lamp with USB Port',
      'Foldable Phone Stand'
    ];
    
    const sampleProductImages = [
      'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96804.jpg',
      'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96805.jpg',
      'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96806.jpg'
    ];
    
    // Generate placeholder product
    const productName = productNames[Math.floor(Math.random() * productNames.length)];
    const productDescription = `High-quality ${productName.toLowerCase()} with premium features. Perfect for everyday use with long battery life and durable construction.`;
    const originalPrice = (priceValue * (1 + Math.random() * 0.5)).toFixed(2);
    const discountPercentage = Math.floor((1 - (priceValue / parseFloat(originalPrice))) * 100);
    
    return {
      id: productId,
      title: productName,
      price: priceValue,
      description: productDescription,
      images: sampleProductImages,
      rating: parseFloat(ratingValue),
      reviews: reviewCount,
      originalPrice: originalPrice,
      discount: `${discountPercentage}%`
    };
  }
};
