import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  
  if (!limit) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  limit.count++;
  return false;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

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

    // Launch browser with retries
    let browser = null;
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
          ]
        });

        const page = await browser.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Set timeout for navigation
        await page.setDefaultNavigationTimeout(30000);

        // Navigate to the product page
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Wait for critical elements
        await page.waitForSelector('h1', { timeout: 10000 });
        await page.waitForSelector('[data-price]', { timeout: 10000 });

        // Extract product data
        const productData = await page.evaluate(() => {
          const title = document.querySelector('h1')?.textContent?.trim() || '';
          const price = document.querySelector('[data-price]')?.getAttribute('data-price') || '0';
          const originalPrice = document.querySelector('[data-original-price]')?.getAttribute('data-original-price') || price;
          const description = document.querySelector('[data-description]')?.textContent?.trim() || '';
          const rating = parseFloat(document.querySelector('[data-rating]')?.getAttribute('data-rating') || '0');
          const reviews = parseInt(document.querySelector('[data-reviews]')?.getAttribute('data-reviews') || '0');
          const images = Array.from(document.querySelectorAll('[data-product-image]')).map(img => img.getAttribute('src') || '').filter(Boolean);
          const discount = document.querySelector('[data-discount]')?.textContent?.trim() || '0%';

          return {
            title,
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            description,
            rating,
            reviews,
            images,
            discount
          };
        });

        // Validate extracted data
        if (!productData.title || !productData.price || !productData.images?.length) {
          throw new Error('Failed to extract required product data');
        }

        // Close browser
        await browser.close();

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
        if (browser) {
          await browser.close();
        }
        retries++;
        if (retries === MAX_RETRIES) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  } catch (error) {
    console.error('Error in extract-product function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to extract product data' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
