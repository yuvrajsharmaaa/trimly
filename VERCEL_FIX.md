# Vercel Deployment Fix Guide

## Issue
Getting 404: NOT_FOUND error when accessing shortened URLs on Vercel.

## Root Causes
1. `vercel.json` was in wrong location (`public/` instead of root)
2. Environment variables might not be set in Vercel dashboard
3. Serverless function needs proper Node.js runtime configuration

## Solutions Applied

### 1. Fixed vercel.json location
✅ Moved from `public/vercel.json` to root `vercel.json`

### 2. Simplified vercel.json configuration
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/dashboard/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/link/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/:shortcode",
      "destination": "/api/redirect/:shortcode"
    }
  ]
}
```

### 3. Required Vercel Environment Variables

Go to your Vercel project settings and add these environment variables:

**Dashboard → Settings → Environment Variables**

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://epyutufurcgskuzwiqce.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key_here` | Production, Preview, Development |

⚠️ **IMPORTANT**: Make sure to check all three environments (Production, Preview, Development)

### 4. Deploy Steps

1. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Fix Vercel routing configuration"
   git push origin main
   ```

2. **Wait for Vercel to redeploy** (automatic)
   - Go to your Vercel dashboard
   - Check the deployment status
   - Look for any build errors

3. **Verify deployment**:
   - Check that `vercel.json` is in the root directory
   - Check that environment variables are set
   - Test a shortened URL: `https://trimly.vercel.app/daa`

### 5. Testing the Serverless Function

After deployment, test with curl:

```bash
# Test the redirect (should return 301/302)
curl -I https://trimly.vercel.app/daa

# You should see:
# HTTP/2 301
# location: https://www.youtube.com/...
```

### 6. Common Issues and Solutions

#### Issue: Still getting 404
- **Solution**: Clear Vercel cache and redeploy
  ```bash
  # In Vercel dashboard: Deployments → ... → Redeploy
  # Check "Clear Build Cache"
  ```

#### Issue: 500 Internal Server Error
- **Solution**: Check Vercel function logs
  - Dashboard → Deployments → Latest → Functions
  - Look for errors in `/api/redirect/[shortcode]`

#### Issue: Environment variables not working
- **Solution**: Re-add environment variables
  - Make sure to save after adding each one
  - Redeploy after adding variables

### 7. Verify RLS Policies

Run this in Supabase SQL Editor:

```sql
-- Should only show 6 clean policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('urls', 'clicks')
ORDER BY tablename, cmd;
```

Expected output:
- `public_select_urls` (SELECT, public)
- `public_insert_urls` (INSERT, public)
- `public_update_urls` (UPDATE, public)
- `public_delete_urls` (DELETE, public)
- `public_select_clicks` (SELECT, public)
- `public_insert_clicks` (INSERT, public)

## Next Steps

1. ✅ Run `clean-rls-policies.sql` in Supabase SQL Editor
2. ✅ Commit and push changes to GitHub
3. ⏳ Wait for Vercel to redeploy automatically
4. ⏳ Add environment variables in Vercel dashboard
5. ⏳ Test shortened URLs

## Deployment Checklist

- [ ] `vercel.json` is in root directory (not `public/`)
- [ ] RLS policies cleaned up (run `clean-rls-policies.sql`)
- [ ] Environment variables set in Vercel dashboard
- [ ] Code pushed to GitHub
- [ ] Vercel redeployed successfully
- [ ] Test URL redirects work: `https://trimly.vercel.app/daa`
- [ ] Check Vercel function logs for errors
