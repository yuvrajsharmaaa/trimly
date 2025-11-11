-- =====================================================
-- Supabase Migration: Add Analytics Columns to Clicks Table
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Add analytics columns to the clicks table if they don't exist
ALTER TABLE clicks 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS device TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT;

-- Step 2: Create indexes for better query performance on analytics
CREATE INDEX IF NOT EXISTS idx_clicks_city ON clicks(city);
CREATE INDEX IF NOT EXISTS idx_clicks_device ON clicks(device);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country);
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at);

-- Step 3: Add a composite index for common analytics queries
CREATE INDEX IF NOT EXISTS idx_clicks_analytics ON clicks(url_id, created_at DESC, city, device);

-- Step 4: Update existing rows with default values (optional - for existing data)
-- This sets "Unknown" for any existing clicks that don't have analytics data
UPDATE clicks 
SET 
    city = COALESCE(city, 'Unknown'),
    device = COALESCE(device, 'desktop'),
    browser = COALESCE(browser, 'Unknown'),
    os = COALESCE(os, 'Unknown')
WHERE city IS NULL OR device IS NULL OR browser IS NULL OR os IS NULL;

-- Step 5: Verify the migration was successful
SELECT 
    'Migration Complete!' as status,
    COUNT(*) as total_clicks,
    COUNT(city) as clicks_with_city,
    COUNT(device) as clicks_with_device,
    COUNT(browser) as clicks_with_browser,
    COUNT(os) as clicks_with_os
FROM clicks;

-- Step 6: Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clicks'
ORDER BY ordinal_position;
