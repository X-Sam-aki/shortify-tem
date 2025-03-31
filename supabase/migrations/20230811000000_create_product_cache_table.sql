
-- Create product_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS product_cache_product_id_idx ON public.product_cache (product_id);

-- Enable RLS
ALTER TABLE public.product_cache ENABLE ROW LEVEL SECURITY;

-- Allow public access for reading
CREATE POLICY "Allow public read access"
  ON public.product_cache
  FOR SELECT
  USING (true);

-- Allow service role to insert/update
CREATE POLICY "Allow service role to insert and update"
  ON public.product_cache
  FOR ALL
  USING (auth.role() = 'service_role');
