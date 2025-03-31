-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create product cache table
CREATE TABLE IF NOT EXISTS product_cache (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id text NOT NULL UNIQUE,
    url text NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    url text NOT NULL,
    duration integer,
    status text DEFAULT 'processing',
    metadata jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_cache_product_id ON product_cache(product_id);
CREATE INDEX IF NOT EXISTS idx_product_cache_created_at ON product_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_product_cache_updated_at
    BEFORE UPDATE ON product_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE product_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to product cache
CREATE POLICY "Allow public read access to product cache"
    ON product_cache FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to insert/update product cache
CREATE POLICY "Allow authenticated users to insert/update product cache"
    ON product_cache FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow public read access to videos
CREATE POLICY "Allow public read access to videos"
    ON videos FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to insert/update videos
CREATE POLICY "Allow authenticated users to insert/update videos"
    ON videos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true); 