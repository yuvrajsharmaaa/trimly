-- Fix RLS policies for public access (no auth required)
-- Run this in your Supabase SQL Editor

-- 1. Update URLs table policies
DROP POLICY IF EXISTS "Users can insert their own URLs" ON public.urls;
DROP POLICY IF EXISTS "Public URLs are viewable by everyone" ON public.urls;
DROP POLICY IF EXISTS "Users can update their own URLs" ON public.urls;
DROP POLICY IF EXISTS "Users can delete their own URLs" ON public.urls;
DROP POLICY IF EXISTS "Anyone can view URLs" ON public.urls;
DROP POLICY IF EXISTS "Anyone can insert URLs" ON public.urls;
DROP POLICY IF EXISTS "Anyone can update URLs" ON public.urls;
DROP POLICY IF EXISTS "Anyone can delete URLs" ON public.urls;

-- Create new policies that allow public access
CREATE POLICY "Public can view all URLs" 
    ON public.urls FOR SELECT 
    USING (true);

CREATE POLICY "Public can insert URLs" 
    ON public.urls FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public can update URLs" 
    ON public.urls FOR UPDATE 
    USING (true);

CREATE POLICY "Public can delete URLs" 
    ON public.urls FOR DELETE 
    USING (true);

-- 2. Update clicks table policies
DROP POLICY IF EXISTS "Clicks are insertable by anyone" ON public.clicks;
DROP POLICY IF EXISTS "URL owners can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
DROP POLICY IF EXISTS "Anyone can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Public can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Public can insert clicks" ON public.clicks;

CREATE POLICY "Public can insert clicks" 
    ON public.clicks FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public can view all clicks" 
    ON public.clicks FOR SELECT 
    USING (true);

-- 3. Verify RLS is enabled
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- 4. Check current data
SELECT 'Current URLs:' as info;
SELECT id, original_url, short_url, custom_url, clicks, created_at 
FROM public.urls 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'Current Clicks:' as info;
SELECT id, url_id, country, created_at 
FROM public.clicks 
ORDER BY created_at DESC 
LIMIT 10;
