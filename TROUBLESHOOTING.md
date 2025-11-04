# Troubleshooting: URL Creation Not Working

## Quick Diagnostic Steps

1. **Check Browser Console** (F12 → Console tab)
   - Look for any red error messages
   - Check if "Environment check:" log shows `hasUrl: true, hasKey: true`
   - Look for "Error creating URL:" messages

2. **Check Network Tab** (F12 → Network tab)
   - Filter by "Fetch/XHR"
   - Look for requests to Supabase
   - Check if they return 200, 400, or 500 status codes
   - Click on failed requests to see error details

3. **Common Issues & Solutions**

### Issue 1: "Failed to fetch" or ERR_NAME_NOT_RESOLVED
**Cause:** Environment variables not loaded
**Solution:** 
- Stop dev server (Ctrl+C)
- Restart: `npm run dev`
- Hard refresh browser (Ctrl+Shift+R)

### Issue 2: "new row violates row-level security policy"
**Cause:** RLS policies not configured for public access
**Solution:** Run this in Supabase SQL Editor:

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can delete URLs" ON public.urls;
DROP POLICY IF EXISTS "Anyone can insert URLs" ON public.urls;
DROP POLICY IF EXISTS "Anyone can update URLs" ON public.urls;
DROP POLICY IF EXISTS "Anyone can view URLs" ON public.urls;
DROP POLICY IF EXISTS "Public can delete URLs" ON public.urls;
DROP POLICY IF EXISTS "Public can insert URLs" ON public.urls;
DROP POLICY IF EXISTS "Public can update URLs" ON public.urls;
DROP POLICY IF EXISTS "Public can view all URLs" ON public.urls;
DROP POLICY IF EXISTS "Users can delete own URLs" ON public.urls;
DROP POLICY IF EXISTS "Users can insert URLs" ON public.urls;
DROP POLICY IF EXISTS "Users can update own URLs" ON public.urls;
DROP POLICY IF EXISTS "Users can view their URLs" ON public.urls;
DROP POLICY IF EXISTS "users_can_delete_urls" ON public.urls;
DROP POLICY IF EXISTS "users_can_insert_urls" ON public.urls;
DROP POLICY IF EXISTS "users_can_select_urls" ON public.urls;
DROP POLICY IF EXISTS "users_can_update_urls" ON public.urls;

-- Create simple public policies
CREATE POLICY "public_select_urls" ON public.urls FOR SELECT TO public USING (true);
CREATE POLICY "public_insert_urls" ON public.urls FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_urls" ON public.urls FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_urls" ON public.urls FOR DELETE TO public USING (true);

-- Do the same for clicks table
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
DROP POLICY IF EXISTS "Anyone can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Public can insert clicks" ON public.clicks;
DROP POLICY IF EXISTS "Public can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Users can view clicks for their URLs" ON public.clicks;

CREATE POLICY "public_select_clicks" ON public.clicks FOR SELECT TO public USING (true);
CREATE POLICY "public_insert_clicks" ON public.clicks FOR INSERT TO public WITH CHECK (true);
```

### Issue 3: "Custom URL already taken"
**Cause:** Someone already used that custom slug
**Solution:** Try a different custom URL or leave it empty for auto-generated

### Issue 4: Invalid URL format
**Cause:** URL doesn't match validation rules
**Solution:** 
- Make sure URL is valid (e.g., `youtube.com` or `https://youtube.com`)
- Custom slug must be 3-20 chars, letters/numbers/hyphens/underscores only

### Issue 5: Network timeout
**Cause:** Supabase connection issues
**Solution:**
- Check your internet connection
- Verify Supabase project is not paused (free tier pauses after inactivity)
- Check Supabase status: https://status.supabase.com/

## Test URL Creation Manually

Open browser console (F12 → Console) and run:

```javascript
// Test Supabase connection
const testConnection = async () => {
  const { data, error } = await supabase.from('urls').select('*').limit(1);
  console.log('Connection test:', { success: !error, data, error });
};
testConnection();

// Test URL creation
const testCreate = async () => {
  const result = await createUrl({
    title: 'Test',
    longUrl: 'https://example.com',
    customUrl: null
  }, null);
  console.log('Creation test:', result);
};
testCreate();
```

## Verify Database Schema

Run in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('urls', 'clicks');

-- Check urls table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'urls'
ORDER BY ordinal_position;

-- Check if any URLs exist
SELECT count(*) as total_urls FROM urls;

-- Check RLS policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'urls';
```

## Still Not Working?

1. Copy the EXACT error message from browser console
2. Copy any red text from Network tab
3. Run the SQL queries above and share the results
