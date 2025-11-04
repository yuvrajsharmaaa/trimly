-- Debug query to check all URLs in database
-- Run this in Supabase SQL Editor

-- 1. Show all URLs with their short codes
SELECT 
    id,
    short_url,
    custom_url,
    original_url,
    created_at,
    clicks
FROM public.urls
ORDER BY created_at DESC;

-- 2. Check for specific URLs
SELECT 
    'Checking for daa' as test,
    id,
    short_url,
    custom_url,
    original_url
FROM public.urls
WHERE short_url = 'daa' OR custom_url = 'daa';

-- 3. Check for any other URLs
SELECT 
    COUNT(*) as total_urls,
    COUNT(CASE WHEN custom_url IS NOT NULL THEN 1 END) as custom_urls,
    COUNT(CASE WHEN custom_url IS NULL THEN 1 END) as generated_urls
FROM public.urls;

-- 4. Show first 10 URLs with details
SELECT 
    id,
    CASE 
        WHEN custom_url IS NOT NULL THEN custom_url 
        ELSE short_url 
    END as shortcode,
    original_url,
    'custom' as type
FROM public.urls
WHERE custom_url IS NOT NULL
UNION ALL
SELECT 
    id,
    short_url as shortcode,
    original_url,
    'generated' as type
FROM public.urls
WHERE custom_url IS NULL
ORDER BY type
LIMIT 10;

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'urls';
