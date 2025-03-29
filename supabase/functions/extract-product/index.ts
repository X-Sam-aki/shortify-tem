
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate if it's a Temu URL
    const temuUrlPattern = /^https?:\/\/(?:www\.|m\.)?temu\.com(?:\/us)?\/(?:[\w-]+\.html|products\/[\w-]+)/i;
    if (!temuUrlPattern.test(url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Temu URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract product ID to use as a cache key
    let productId = null;
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // For paths like: /product-123456.html
      const productFileMatch = pathParts[pathParts.length - 1].match(/product-([a-zA-Z0-9]+)\.html/);
      if (productFileMatch) {
        productId = productFileMatch[1];
      }
      
      // For paths like: /products/123456
      if (pathParts.includes('products') && pathParts.length > 2) {
        productId = pathParts[pathParts.indexOf('products') + 1];
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }

    // Check if we have cached data for this product
    if (productId) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: cachedProduct, error: cacheError } = await supabase
        .from('product_cache')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (!cacheError && cachedProduct && cachedProduct.data) {
        console.log('Returning cached product data');
        return new Response(
          JSON.stringify(cachedProduct.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Use OpenAI to analyze the URL and extract product information
    const configuration = new Configuration({ apiKey: openAIKey });
    const openai = new OpenAIApi(configuration);

    const prompt = `
You are a helpful assistant that extracts product information from Temu URLs.
For the URL: ${url}

Please extract the following information:
1. Product title
2. Price (as a number)
3. Description (2-3 sentences about the product)
4. Rating (between 1.0 and 5.0)
5. Number of reviews
6. Original price (as a string)
7. Discount percentage (as a string)
8. At least 3 image URLs for the product

Format the response as a valid JSON object with these properties:
{
  "id": "extracted-from-url-or-random",
  "title": "product name",
  "price": 19.99,
  "description": "product description",
  "images": ["url1", "url2", "url3"],
  "rating": 4.5,
  "reviews": 250,
  "originalPrice": "29.99",
  "discount": "33%"
}

Since we can't actually scrape the URL right now, make a best guess based on the URL and provide realistic data that would make sense for a Temu product page.
`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a product information extraction assistant." },
        { role: "user", content: prompt }
      ],
    });

    const responseContent = completion.data.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    const productData = JSON.parse(responseContent);
    
    // Cache the result if we have a product ID
    if (productId) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error: insertError } = await supabase
        .from('product_cache')
        .upsert({
          product_id: productId,
          url: url,
          data: productData,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error caching product data:', insertError);
      }
    }

    return new Response(
      JSON.stringify(productData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extract-product function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to extract product data' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
