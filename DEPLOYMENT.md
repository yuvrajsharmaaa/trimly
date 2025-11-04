# Trimly - Server-Side Redirect Setup

## 🚀 How It Works

This project now uses **server-side HTTP redirects** via Vercel serverless functions for optimal performance and SEO.

### Architecture

```
User visits: https://trimly.vercel.app/daa
     ↓
Vercel routes to: /api/redirect/daa
     ↓
Serverless function queries database
     ↓
If found: 301/302 redirect to original URL
If not found: 404 error page
```

### File Structure

```
trimly/
├── api/
│   └── redirect/
│       └── [shortcode].js    # Serverless function for redirects
├── src/
│   └── pages/
│       └── redirect-link.jsx # Client-side fallback (dev only)
└── vercel.json               # Routing configuration
```

## 📋 Deployment Steps

### 1. **Push to GitHub**

```bash
git add .
git commit -m "Add server-side redirects with Vercel functions"
git push origin main
```

### 2. **Configure Vercel Environment Variables**

Go to your Vercel project settings and add:

- `VITE_SUPABASE_URL` = `https://epyutufurcgskuzwiqce.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `your_anon_key_here`

### 3. **Deploy**

Vercel will automatically deploy. The build command is `npm run build`.

### 4. **Test the Redirect**

1. Create a new short URL in dashboard: `https://trimly.vercel.app/dashboard`
2. Copy the short URL (e.g., `https://trimly.vercel.app/daa`)
3. Visit it in a new tab - should immediately redirect (server-side)
4. Check Network tab in DevTools - you'll see a **301/302 redirect**

## 🔧 Local Development

### Option 1: Client-Side Fallback (Current Setup)

```bash
npm run dev
```

Visits to `http://localhost:5173/daa` will use **client-side redirect** (redirect-link.jsx).

### Option 2: Test with Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with serverless functions
vercel dev
```

This will simulate the production environment with server-side redirects.

## 🎯 How Routing Works

The `vercel.json` configuration handles routing:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/dashboard/:path*", "destination": "/index.html" },
    { "source": "/link/:path*", "destination": "/index.html" },
    { "source": "/assets/:path*", "destination": "/assets/:path*" },
    { "source": "/:shortcode", "destination": "/api/redirect/:shortcode" },
    { "source": "/", "destination": "/index.html" }
  ]
}
```

**Priority Order:**
1. `/api/*` → Serverless functions
2. `/dashboard/*` → React app
3. `/link/*` → React app
4. `/assets/*` → Static assets
5. `/:shortcode` → **Serverless redirect function**
6. `/` → React app home

## 🐛 Debugging

### Check Server-Side Redirect

```bash
curl -I https://trimly.vercel.app/daa
```

Expected output:
```
HTTP/2 301
location: https://www.youtube.com/results?search_query=dsa+based+projects
```

### Check Logs in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → Latest deployment
4. Click "Functions" → `/api/redirect/[shortcode]`
5. View real-time logs

### Common Issues

**Issue**: 404 on short URL
- **Fix**: Check RLS policies in Supabase (run `fix-rls-policies.sql`)
- **Fix**: Verify environment variables in Vercel

**Issue**: Client-side redirect instead of server-side
- **Fix**: This is normal in development. Deploy to Vercel to test server-side.

**Issue**: "Module not found: @supabase/supabase-js"
- **Fix**: Ensure it's in `dependencies`, not `devDependencies` in package.json

## 📊 Analytics

Server-side redirects still track clicks:
- IP address
- User agent
- Referrer
- Country (from Vercel headers)

All stored in the `clicks` table.

## ✅ Verification Checklist

- [ ] Supabase RLS policies allow public read access
- [ ] Environment variables set in Vercel
- [ ] `vercel.json` in project root
- [ ] `/api/redirect/[shortcode].js` exists
- [ ] Deployed to Vercel
- [ ] Short URL redirects with 301 status code
- [ ] Clicks are being tracked in database

## 🚀 Performance Benefits

**Server-Side Redirects:**
- ✅ Instant redirect (no JavaScript loading)
- ✅ Better SEO (proper HTTP status codes)
- ✅ Works without JavaScript
- ✅ Faster for users
- ✅ Cacheable responses

**vs Client-Side Redirects:**
- ❌ Must load HTML + JavaScript
- ❌ No proper HTTP status codes
- ❌ Requires JavaScript enabled
- ❌ Slower page load
- ❌ Not cacheable

## 📝 Notes

- In **development** (`npm run dev`), redirects use client-side fallback
- In **production** (Vercel), redirects are server-side via Vercel Functions
- The serverless function runs on-demand (cold start ~100-300ms, warm ~10-50ms)
- Redirects are cached for 1 hour (configurable in function)
