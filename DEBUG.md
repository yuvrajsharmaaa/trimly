# 🐛 Debug Guide: Why Only "daa" Works

## Common Issues and Solutions

### Issue 1: URLs Stored with NULL short_url
**Problem**: When creating URLs, they might not be saving the short_url properly.

**Check**:
```sql
SELECT id, short_url, custom_url, original_url 
FROM public.urls 
WHERE short_url IS NULL OR short_url = '';
```

**Fix**: Ensure `createUrl` function in `apiUrls.js` is working correctly.

---

### Issue 2: RLS Policies Blocking Reads
**Problem**: Row Level Security preventing anonymous reads.

**Check**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'urls';
```

**Fix**: Run this SQL:
```sql
DROP POLICY IF EXISTS "Public can view all URLs" ON public.urls;
CREATE POLICY "Public can view all URLs" 
    ON public.urls FOR SELECT 
    USING (true);
```

---

### Issue 3: Case Sensitivity
**Problem**: Database might be case-sensitive for lookups.

**Test**:
```sql
-- Try exact match
SELECT * FROM urls WHERE short_url = 'abc123';

-- Try case-insensitive
SELECT * FROM urls WHERE short_url ILIKE 'abc123';
```

**Fix**: Already handled in code with `.eq.` operator.

---

### Issue 4: Wrong Column Being Used
**Problem**: Custom URLs stored in `short_url` or vice versa.

**Check**:
```sql
SELECT 
    CASE 
        WHEN custom_url IS NOT NULL THEN 'Has custom_url: ' || custom_url
        WHEN short_url IS NOT NULL THEN 'Has short_url: ' || short_url
        ELSE 'BOTH NULL!'
    END as status,
    original_url
FROM public.urls;
```

---

## Debugging Steps

### 1. Start Dev Server
```bash
cd /home/yuvrajs/Desktop/trimly/trimly
npm run dev
```

### 2. Open Dashboard
Visit: `http://localhost:5174/dashboard`

### 3. Use Debug Tool
At the top of dashboard, you'll see "🐛 Debug URLs in Database"
- Click "Fetch All URLs"
- Review what's actually in the database
- Click "Test Lookup" on each URL to see if query works
- Click "Try Redirect" to test the redirect

### 4. Check Browser Console (F12)
Look for logs like:
```
Looking up URL with id: abc123
Database query result: { data: null, error: ... }
Available URLs in database: [...]
```

### 5. Test Specific URL
In browser console, run:
```javascript
// Test if URL exists
const { data, error } = await supabase
  .from('urls')
  .select('*')
  .or('short_url.eq.abc123,custom_url.eq.abc123')
  .maybeSingle();
console.log({ data, error });
```

---

## Quick Fixes to Try

### Fix 1: Reset RLS Policies
```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Public can view all URLs" ON public.urls;
DROP POLICY IF EXISTS "Public can insert URLs" ON public.urls;
DROP POLICY IF EXISTS "Public can update URLs" ON public.urls;
DROP POLICY IF EXISTS "Public can delete URLs" ON public.urls;

-- Create simple public policies
CREATE POLICY "enable_all_for_urls" ON public.urls FOR ALL USING (true) WITH CHECK (true);
```

### Fix 2: Check Supabase Connection
In browser console:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Fix 3: Manual Test Query
In Supabase SQL Editor:
```sql
-- Test the exact query the app uses
SELECT * FROM public.urls 
WHERE short_url = 'abc123' OR custom_url = 'abc123';

-- If empty, check what's actually there
SELECT short_url, custom_url FROM public.urls LIMIT 10;
```

---

## Most Likely Cause

Based on "daa" working but others not:

1. **"daa" was created as `custom_url`**
2. **Other URLs were created with auto-generated `short_url`**
3. **You're trying to access them with the wrong code**

### Solution:
Look at the dashboard URL list. Each URL shows both:
- `short_url` (auto-generated like "5xY2aP")
- `custom_url` (your custom name like "daa")

Use the correct one when accessing!

**Example:**
- ✅ `http://localhost:5174/daa` (if custom_url = "daa")
- ✅ `http://localhost:5174/5xY2aP` (if short_url = "5xY2aP")
- ❌ `http://localhost:5174/abc123` (if this doesn't exist in either column)

---

## Next Steps

1. **Start the dev server** (if not running)
2. **Go to dashboard** and click "Fetch All URLs" in debug section
3. **Share the output** - what URLs do you see?
4. **Try clicking "Test Lookup"** on each URL
5. **Share any error messages** from browser console

This will help identify the exact issue!
