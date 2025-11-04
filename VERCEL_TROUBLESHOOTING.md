# Vercel 404 Error - Complete Troubleshooting Guide

## Current Status
- ✅ Local app works: http://localhost:5173
- ✅ vercel.json is in root directory
- ✅ Code is pushed to GitHub (commit: c111ebe)
- ❌ Production URLs return 404: NOT_FOUND

## The Problem
Vercel serverless functions are returning 404 instead of redirecting.

## Step-by-Step Solution

### 1. Check Vercel Environment Variables (MOST LIKELY ISSUE)

Go to: **https://vercel.com → Your Project → Settings → Environment Variables**

You MUST have these variables set for **ALL THREE** environments:

| Variable Name | Value | Production | Preview | Development |
|---------------|-------|------------|---------|-------------|
| `VITE_SUPABASE_URL` | `https://epyutufurcgskuzwiqce.supabase.co` | ✅ | ✅ | ✅ |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ | ✅ | ✅ |

**How to check:**
1. Go to Vercel dashboard
2. Select your project (trimly)
3. Click "Settings" tab
4. Click "Environment Variables"
5. Make sure BOTH variables are there with ALL THREE checkboxes checked

**If missing or only checked for some environments:**
1. Delete the existing variables
2. Add them again with ALL THREE environments checked
3. Click "Save"
4. Go to "Deployments" tab
5. Click "..." on latest deployment → "Redeploy" → Check "Use existing Build Cache" OFF → Redeploy

---

### 2. Verify Vercel Detected the API Functions

Go to: **Vercel Dashboard → Your Project → Latest Deployment → Functions Tab**

You should see:
```
/api/redirect/[shortcode]
```

**If you DON'T see this:**
- Vercel didn't detect your serverless function
- Solution: Force redeploy with build cache cleared

---

### 3. Check Vercel Logs for Errors

Go to: **Vercel Dashboard → Deployments → Latest → Functions → /api/redirect/[shortcode]**

Look for errors like:
- `Missing Supabase credentials` → Environment variables not set
- `Module not found` → Dependencies issue
- `Timeout` → Function taking too long

---

### 4. Test the Serverless Function Directly

Instead of testing `https://trimly.vercel.app/daa`, test the API directly:

```bash
curl -I "https://trimly.vercel.app/api/redirect/daa"
```

**Expected response:**
```
HTTP/2 301
location: https://www.youtube.com/...
```

**If you get 404:**
- Function isn't deployed or route isn't configured
- Check vercel.json exists in root (it does ✅)

**If you get 500:**
- Function has an error
- Check Vercel function logs

---

### 5. Force Clean Redeploy

Sometimes Vercel needs a full redeploy to pick up changes:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** → **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Click **"Redeploy"**
6. Wait for build to complete (~2-3 minutes)

---

### 6. Verify Your Supabase RLS Policies

The serverless function needs to query your database. Make sure you ran the `clean-rls-policies.sql`:

```sql
-- Run this in Supabase SQL Editor
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'urls';
```

You should see:
- `public_select_urls` (SELECT)
- `public_insert_urls` (INSERT)
- `public_update_urls` (UPDATE)
- `public_delete_urls` (DELETE)

**If you see 16+ policies or different names:**
Run `clean-rls-policies.sql` from the project root.

---

### 7. Check Database for URLs

Make sure you actually have URLs in the database:

```sql
-- Run in Supabase SQL Editor
SELECT 
    short_url, 
    custom_url, 
    original_url 
FROM public.urls 
ORDER BY created_at DESC 
LIMIT 10;
```

Try accessing the exact shortcode from the database.

---

## Quick Diagnosis Command

Test everything at once:

```bash
# Test 1: Direct API call
curl -I "https://trimly.vercel.app/api/redirect/daa"

# Test 2: Rewrite rule
curl -I "https://trimly.vercel.app/daa"

# Test 3: Check if app loads
curl -I "https://trimly.vercel.app/"

# Test 4: Check if dashboard loads
curl -I "https://trimly.vercel.app/dashboard"
```

---

## Most Common Issues & Solutions

### Issue 1: "404: NOT_FOUND Code: NOT_FOUND ID: bom1::..."
**Cause:** Vercel can't find the serverless function  
**Solution:** Environment variables missing or function not deployed

### Issue 2: "500 Internal Server Error"
**Cause:** Function has an error (likely missing env vars)  
**Solution:** Check Vercel function logs

### Issue 3: Redirect works but shows 404 page
**Cause:** URL not in database  
**Solution:** Check database with SQL query above

### Issue 4: "Failed to fetch" in browser console
**Cause:** CORS or environment variables issue  
**Solution:** Check browser network tab for actual error

---

## What Should Work

After fixing:

1. ✅ `https://trimly.vercel.app/` → Shows landing page
2. ✅ `https://trimly.vercel.app/dashboard` → Shows dashboard
3. ✅ `https://trimly.vercel.app/daa` → 301 redirect to YouTube
4. ✅ `https://trimly.vercel.app/api/redirect/daa` → 301 redirect to YouTube

---

## Next Steps

**RIGHT NOW:**

1. Go to Vercel → Settings → Environment Variables
2. Verify BOTH variables exist with ALL THREE environments checked
3. If not, add them and redeploy
4. Wait 2 minutes for deployment
5. Test: `curl -I "https://trimly.vercel.app/daa"`

**THEN:**

Run the SQL queries to verify your database has URLs and correct RLS policies.

---

## Need More Help?

If still not working, check:
1. Vercel deployment logs (Deployments → Latest → View Build Logs)
2. Vercel function logs (Deployments → Latest → Functions)
3. Browser console errors
4. Supabase SQL Editor to verify database

The issue is 99% likely to be **missing environment variables in Vercel**.
