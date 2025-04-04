
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { product } = await req.json();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    if (!product || !product.title || !product.description) {
      return new Response(
        JSON.stringify({ error: "Valid product data with title and description is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Call OpenAI for enhancement
    const enhancementResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a marketing expert specializing in product descriptions. 
            Your task is to enhance a product description to make it more appealing and informative.
            Keep the tone conversational and engaging. Focus on benefits, not just features.
            Use bullet points for key features. Keep the description under 300 words.
            Also provide a short 30-word summary highlighting the key benefit of the product.`
          },
          {
            role: "user",
            content: `Here's a product titled "${product.title}" with the following description: "${product.description}". 
            The price is $${product.price}${product.originalPrice ? ' (original price $' + product.originalPrice + ')' : ''}.
            ${product.specifications ? 'Specifications: ' + JSON.stringify(product.specifications) : ''}
            Please provide an enhanced description and a short summary.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!enhancementResponse.ok) {
      const error = await enhancementResponse.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const enhancementData = await enhancementResponse.json();
    
    if (!enhancementData.choices || enhancementData.choices.length === 0) {
      throw new Error("Invalid response from OpenAI API");
    }

    // Parse the response
    const responseContent = enhancementData.choices[0].message.content;
    
    // Extract the enhanced description and summary (assuming they're separated by sections)
    let enhancedDescription = responseContent;
    let summary = "";
    
    // Try to extract summary if it's marked separately
    const summaryMatch = responseContent.match(/(?:summary:|short summary:|key benefit:)\s*(.*?)(?:\n|$)/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
      
      // Remove the summary section from the description
      enhancedDescription = responseContent.replace(/(?:summary:|short summary:|key benefit:)\s*(.*?)(?:\n|$)/i, "").trim();
    } else {
      // If we can't find an explicit summary, use the first 30 words
      const words = responseContent.split(/\s+/);
      summary = words.slice(0, 30).join(" ").replace(/[.!?]$/, "") + ".";
    }

    return new Response(
      JSON.stringify({
        enhancedDescription,
        summary,
        original: product.description
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Product enhancement error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred during enhancement" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
