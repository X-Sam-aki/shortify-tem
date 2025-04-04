
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Basic URL validation
    if (!url.includes("temu.com")) {
      return new Response(
        JSON.stringify({ error: "Only Temu URLs are supported" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract product data using selectors
    // Note: These selectors might need to be updated as Temu's site structure changes
    const title = $('h1.title').text().trim() || $('meta[property="og:title"]').attr("content") || "";
    const descriptionText = $('.product-description').text().trim() || $('meta[property="og:description"]').attr("content") || "";
    
    // Extract price - handle different formats
    let price = 0;
    const priceText = $('.price-current').text().trim() || $('.price').text().trim();
    const priceMatch = priceText.match(/\$([0-9]+(\.[0-9]+)?)/);
    if (priceMatch && priceMatch[1]) {
      price = parseFloat(priceMatch[1]);
    }
    
    // Extract original price if available
    let originalPrice = undefined;
    const originalPriceText = $('.price-original').text().trim();
    const originalPriceMatch = originalPriceText.match(/\$([0-9]+(\.[0-9]+)?)/);
    if (originalPriceMatch && originalPriceMatch[1]) {
      originalPrice = originalPriceMatch[1];
    }
    
    // Extract discount
    let discount = undefined;
    const discountText = $('.discount-tag').text().trim();
    const discountMatch = discountText.match(/([0-9]+)%/);
    if (discountMatch && discountMatch[1]) {
      discount = `${discountMatch[1]}%`;
    }
    
    // Extract rating
    let rating = 0;
    const ratingText = $('.rating-score').text().trim();
    const ratingMatch = ratingText.match(/([0-9]+(\.[0-9]+)?)/);
    if (ratingMatch && ratingMatch[1]) {
      rating = parseFloat(ratingMatch[1]);
    }
    
    // Extract reviews count
    let reviews = 0;
    const reviewsText = $('.review-count').text().trim();
    const reviewsMatch = reviewsText.match(/([0-9]+)/);
    if (reviewsMatch && reviewsMatch[1]) {
      reviews = parseInt(reviewsMatch[1]);
    }
    
    // Extract images
    const images: string[] = [];
    $('.product-image img, .product-gallery img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('placeholder') && !images.includes(src)) {
        images.push(src);
      }
    });
    
    // If we couldn't extract images from the DOM, try to get them from meta tags
    if (images.length === 0) {
      const metaImage = $('meta[property="og:image"]').attr("content");
      if (metaImage) {
        images.push(metaImage);
      }
    }
    
    // Extract specifications if available
    const specifications: Record<string, string> = {};
    $('.specifications .spec-item').each((i, el) => {
      const key = $(el).find('.spec-name').text().trim();
      const value = $(el).find('.spec-value').text().trim();
      if (key && value) {
        specifications[key] = value;
      }
    });
    
    // Extract shipping info
    const shippingText = $('.shipping-info').text().trim();
    const freeShipping = shippingText.toLowerCase().includes('free');
    const deliveryMatch = shippingText.match(/delivery by ([^,]+)/i);
    const estimatedDelivery = deliveryMatch ? deliveryMatch[1].trim() : undefined;
    
    // Extract seller info if available
    let seller: { name?: string, rating?: number, responseRate?: string } | undefined = undefined;
    const sellerName = $('.seller-name').text().trim();
    if (sellerName) {
      seller = { name: sellerName };
      
      const sellerRatingText = $('.seller-rating').text().trim();
      const sellerRatingMatch = sellerRatingText.match(/([0-9]+(\.[0-9]+)?)/);
      if (sellerRatingMatch && sellerRatingMatch[1]) {
        seller.rating = parseFloat(sellerRatingMatch[1]);
      }
      
      const responseRateText = $('.response-rate').text().trim();
      const responseRateMatch = responseRateText.match(/([0-9]+)%/);
      if (responseRateMatch && responseRateMatch[1]) {
        seller.responseRate = `${responseRateMatch[1]}%`;
      }
    }
    
    // If we couldn't extract a product title or price, consider it a failure
    if (!title || price === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to extract essential product information" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Construct the product object
    const product = {
      title,
      description: descriptionText,
      price,
      originalPrice,
      discount,
      rating: rating || 4.5, // Fallback rating if not found
      reviews: reviews || 10, // Fallback reviews if not found
      images,
      url,
      platform: 'Temu',
      timestamp: new Date().toISOString(),
      shipping: {
        free: freeShipping,
        estimatedDelivery
      },
      seller,
      specifications
    };

    return new Response(
      JSON.stringify(product),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Product extraction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred during extraction" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
