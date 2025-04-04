
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches product data from the Temu URL using edge function
 */
export const extractProductFromUrl = async (url: string): Promise<Product> => {
  try {
    const { data, error } = await supabase.functions.invoke('extract-product', {
      body: { url }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || !data.title) {
      throw new Error('Invalid or incomplete product data returned');
    }
    
    return data as Product;
  } catch (error) {
    console.error('Error extracting product data:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract product data');
  }
};

/**
 * Enhances product description and summary using AI
 */
export const enhanceProductWithAI = async (product: Product): Promise<Product> => {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-product', {
      body: { product }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      ...product,
      description: data.enhancedDescription || product.description,
      aiSummary: data.summary,
      aiEnhanced: true
    };
  } catch (error) {
    console.error('Error enhancing product with AI:', error);
    // Return original product if enhancement fails
    return product;
  }
};

/**
 * Saves product to the database
 */
export const saveProduct = async (product: Product): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Product;
  } catch (error) {
    console.error('Error saving product:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save product');
  }
};

/**
 * Fetches a product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch product');
  }
};

/**
 * Fetches all products
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
  }
};
