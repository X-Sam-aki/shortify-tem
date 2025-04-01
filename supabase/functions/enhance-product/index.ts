
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  title: string;
  description?: string;
  price: number;
  rating: number;
  reviews: number;
  discount?: string;
  originalPrice?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product } = await req.json();
    
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // AI Enhancement Logic
    // This function uses simple rules to enhance product descriptions
    // No external API calls needed - this is our "free AI agent"
    
    // Create an enhanced description
    const keywords = extractKeywords(product.title.toLowerCase());
    const enhancedDescription = generateEnhancedDescription(product, keywords);
    
    // Create a summary
    const summary = generateProductSummary(product, keywords);

    // Return the enhanced product data
    return new Response(
      JSON.stringify({
        enhancedDescription,
        summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-product function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to enhance product data' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions for extracting keywords and generating enhanced content
function extractKeywords(text: string): string[] {
  // Common product types
  const productTypes = [
    'headphones', 'earbuds', 'speaker', 'charger', 'cable', 'stand', 
    'case', 'cover', 'screen protector', 'lamp', 'light', 'fan',
    'holder', 'mount', 'keyboard', 'mouse', 'webcam', 'microphone'
  ];
  
  // Look for product types in the title
  const foundTypes = productTypes.filter(type => text.includes(type));
  
  // Common quality words
  const qualityWords = ['wireless', 'bluetooth', 'portable', 'foldable', 'adjustable', 
    'ergonomic', 'waterproof', 'rechargeable', 'premium', 'durable', 'lightweight'];
  
  // Look for quality words in the title
  const foundQualities = qualityWords.filter(quality => text.includes(quality));
  
  return [...foundTypes, ...foundQualities];
}

function generateEnhancedDescription(product: Product, keywords: string[]): string {
  const originalDescription = product.description || '';
  
  // If we have a good description already, return it
  if (originalDescription.length > 150) {
    return originalDescription;
  }
  
  // Generate a description based on keywords and product info
  const baseDescription = `This ${keywords.join(' ')} is perfect for everyday use.`;
  
  const features: string[] = [];
  
  // Add feature statements based on keywords
  if (keywords.includes('wireless') || keywords.includes('bluetooth')) {
    features.push('It connects wirelessly via Bluetooth for hassle-free usage.');
  }
  
  if (keywords.includes('portable') || keywords.includes('lightweight')) {
    features.push('Its lightweight design makes it easy to carry anywhere.');
  }
  
  if (keywords.includes('rechargeable')) {
    features.push('The built-in rechargeable battery provides long-lasting performance.');
  }
  
  if (keywords.includes('adjustable') || keywords.includes('ergonomic')) {
    features.push('Its ergonomic design ensures comfort during extended use.');
  }
  
  if (keywords.includes('waterproof')) {
    features.push('The waterproof construction makes it suitable for outdoor activities.');
  }
  
  // Add price-based quality statement
  if (product.price < 15) {
    features.push('This affordable option provides excellent value for money.');
  } else if (product.price < 30) {
    features.push('This mid-range product offers a great balance of quality and affordability.');
  } else {
    features.push('This premium product is built with high-quality materials for lasting durability.');
  }
  
  // Add rating-based statement
  if (product.rating >= 4.5) {
    features.push(`With an outstanding rating of ${product.rating}/5 from ${product.reviews} reviews, customers love this product!`);
  } else if (product.rating >= 4.0) {
    features.push(`With a high rating of ${product.rating}/5 from ${product.reviews} reviews, this product has proven to be reliable.`);
  } else if (product.rating >= 3.5) {
    features.push(`With a solid rating of ${product.rating}/5 based on ${product.reviews} customer reviews.`);
  }
  
  // Add discount information if available
  if (product.discount && product.originalPrice) {
    features.push(`Currently on sale with ${product.discount} off the original price of ${product.originalPrice}!`);
  }
  
  // Combine everything into a cohesive description
  return `${baseDescription} ${features.join(' ')} ${originalDescription}`.trim();
}

function generateProductSummary(product: Product, keywords: string[]): string {
  const typeWord = keywords.length > 0 ? keywords[0] : 'product';
  
  const qualityAdjectives = ['high-quality', 'excellent', 'reliable', 'impressive', 'practical'];
  const randomAdjective = qualityAdjectives[Math.floor(Math.random() * qualityAdjectives.length)];
  
  let summary = `A ${randomAdjective} ${typeWord} with ${product.rating}/5 stars`;
  
  if (product.discount) {
    summary += ` now ${product.discount} off!`;
  } else {
    summary += ` at a great price!`;
  }
  
  return summary;
}
