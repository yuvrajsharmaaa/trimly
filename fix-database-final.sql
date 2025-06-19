-- Drop existing tables and start fresh
DROP TABLE IF EXISTS clicks CASCADE;
DROP TABLE IF EXISTS urls CASCADE;

-- Create the urls table with proper structure
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Allow NULL for guest users
    original_url TEXT NOT NULL,
    short_url TEXT NOT NULL,
    custom_url TEXT,
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique indexes
CREATE UNIQUE INDEX idx_urls_short_url ON urls(short_url);
CREATE UNIQUE INDEX idx_urls_custom_url ON urls(custom_url) WHERE custom_url IS NOT NULL;

-- Create the clicks table
CREATE TABLE clicks (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT REFERENCES urls(id) ON DELETE CASCADE,
    ip TEXT,
    user_agent TEXT,
    referer TEXT,
    country TEXT,
    city TEXT,
    device TEXT,
    browser TEXT,
    os TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for urls table
DROP POLICY IF EXISTS "Enable read access for all users" ON urls;
CREATE POLICY "Enable read access for all users" 
ON urls FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON urls;
CREATE POLICY "Enable insert access for all users" 
ON urls FOR INSERT 
TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for users based on user_id" ON urls;
CREATE POLICY "Enable update for users based on user_id" 
ON urls FOR UPDATE 
TO public 
USING (
    auth.uid() = user_id 
    OR 
    (user_id IS NULL AND auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON urls;
CREATE POLICY "Enable delete for users based on user_id" 
ON urls FOR DELETE 
TO public 
USING (
    auth.uid() = user_id 
    OR 
    (user_id IS NULL AND auth.uid() IS NULL)
);

-- Create RLS Policies for clicks table
DROP POLICY IF EXISTS "Enable read access for all users" ON clicks;
CREATE POLICY "Enable read access for all users" 
ON clicks FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON clicks;
CREATE POLICY "Enable insert access for all users" 
ON clicks FOR INSERT 
TO public 
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_urls_updated_at ON urls;
CREATE TRIGGER update_urls_updated_at
    BEFORE UPDATE ON urls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test URL to verify everything works
INSERT INTO urls (original_url, short_url, custom_url) 
VALUES 
    ('https://www.google.com', 'test123', 'google')
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT * FROM urls LIMIT 5; 