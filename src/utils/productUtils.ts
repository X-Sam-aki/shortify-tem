import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

/**
 * Validates if a string is a proper Temu product URL
 */
export const validateTemuUrl = (url: string): boolean => {
  // Enhanced validation that also accepts mobile URLs
  const temuUrlPattern = /^https?:\/\/(?:www\.|m\.)?temu\.com(?:\/us)?\/(?:[\w-]+\.html|products\/[\w-]+|product\.html\?pid=[\w-]+)/i;
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
    
    // For paths with query parameters like: /product.html?pid=123456
    const params = urlObj.searchParams;
    const pid = params.get('pid');
    if (pid) {
      return pid;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

/**
 * Enhances product description using AI
 */
export const enhanceProductDescription = async (product: Product): Promise<Product> => {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-product', {
      body: { product }
    });

    if (error) {
      console.error('Error calling enhance-product function:', error);
      return product;
    }

    return {
      ...product,
      description: data.enhancedDescription || product.description,
      aiSummary: data.summary,
      aiEnhanced: true
    };
  } catch (error) {
    console.error('Error enhancing product description:', error);
    return product;
  }
};

/**
 * Extracts product data from a Temu URL using the AI agent
 */
export const extractProductData = async (url: string): Promise<Product> => {
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL format');
    }

    // Call the Supabase Edge Function to extract product data using AI
    const { data, error } = await supabase.functions.invoke('extract-product', {
      body: { url }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Invalid response format');
    }

    // Make sure all required fields are present
    const productData = data as Product;
    
    // Validate that we have all required fields
    if (!productData.title || productData.price === undefined || !productData.images) {
      throw new Error('Incomplete product data returned from extraction');
    }

    // Add the URL to the product data if it's not already there
    if (!productData.url) {
      productData.url = url;
    }

    // Add platform info if not present
    if (!productData.platform) {
      productData.platform = 'Temu';
    }

    // Add timestamp if not present
    if (!productData.timestamp) {
      productData.timestamp = Date.now();
    }

    // Enhance the product description using AI if needed
    if (!productData.aiEnhanced) {
      return await enhanceProductDescription(productData);
    }

    return productData;
  } catch (error) {
    // Re-throw specific error messages
    if (error instanceof Error) {
      throw error;
    }
    
    // For unknown errors, throw a generic error
    throw new Error('Failed to extract product data');
  }
};
