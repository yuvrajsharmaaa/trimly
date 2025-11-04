-- Simple fix for database issues
-- Run this in your Supabase SQL editor

-- 1. Update RLS policies to allow public access (no auth required)
DROP POLICY IF EXISTS "Users can insert their own URLs" ON urls;
DROP POLICY IF EXISTS "Public URLs are viewable by everyone" ON urls;
DROP POLICY IF EXISTS "Users can update their own URLs" ON urls;
DROP POLICY IF EXISTS "Users can delete their own URLs" ON urls;

-- Create new policies that allow anyone to access
CREATE POLICY "Anyone can view URLs" ON urls
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert URLs" ON urls
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update URLs" ON urls
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete URLs" ON urls
    FOR DELETE USING (true);

-- 2. Ensure clicks table policies allow public access
DROP POLICY IF EXISTS "Clicks are insertable by anyone" ON clicks;
DROP POLICY IF EXISTS "URL owners can view clicks" ON clicks;
DROP POLICY IF EXISTS "Anyone can insert clicks" ON clicks;
DROP POLICY IF EXISTS "Anyone can view clicks" ON clicks;

CREATE POLICY "Anyone can insert clicks" ON clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view clicks" ON clicks
    FOR SELECT USING (true);

-- 3. Make sure the tables exist with correct structure
-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add clicks column to urls table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'urls' AND column_name = 'clicks') THEN
        ALTER TABLE urls ADD COLUMN clicks INTEGER DEFAULT 0;
    END IF;
    
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'urls' AND column_name = 'title') THEN
        ALTER TABLE urls ADD COLUMN title TEXT;
    END IF;
END $$;

-- 4. Create or update the increment function
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE urls 
    SET clicks = COALESCE(clicks, 0) + 1 
    WHERE id = NEW.url_id;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for click count if it doesn't exist
DROP TRIGGER IF EXISTS increment_clicks ON clicks;
CREATE TRIGGER increment_clicks
    AFTER INSERT ON clicks
    FOR EACH ROW
    EXECUTE FUNCTION increment_click_count();

-- 5. Insert a test URL to verify everything works
INSERT INTO urls (original_url, short_url, custom_url, title) 
VALUES 
    ('https://www.google.com', 'test123', 'google', 'Google Homepage')
ON CONFLICT (short_url) DO NOTHING;

-- Verify the setup
SELECT 'URLs table:' as info;
SELECT id, original_url, short_url, custom_url, clicks, created_at FROM urls LIMIT 5;

SELECT 'Clicks table:' as info;
SELECT id, url_id, created_at FROM clicks LIMIT 5;