# Complete Next.js Conversion Guide for Trimly

## ⚠️ IMPORTANT: Backup First!
```bash
cd /home/yuvrajs/Desktop/trimly
cp -r trimly trimly-backup
```

## Step 1: Install Next.js Dependencies

```bash
cd /home/yuvrajs/Desktop/trimly/trimly
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/node
```

## Step 2: Update package.json

Replace the `scripts` section:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Step 3: Create Next.js App Structure

```bash
mkdir -p app
mkdir -p app/dashboard
mkdir -p app/link/[id]
mkdir -p app/api
```

## Step 4: Create Root Layout

Create `app/layout.tsx`:
```tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trimly - URL Shortener',
  description: 'Create short, custom URLs and track their performance',
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

## Step 5: Create Landing Page

Create `app/page.tsx`:
```tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">Trimly</h1>
          <p className="text-2xl mb-8">Shorten your URLs instantly</p>
          <Link 
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-[#667eea] rounded-lg font-bold hover:scale-105 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## Step 6: Create Dynamic Redirect Page

Create `app/[shortcode]/page.tsx`:
```tsx
import { createClient } from '@supabase/supabase-js'
import { redirect, notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function RedirectPage({ 
  params 
}: { 
  params: { shortcode: string } 
}) {
  const { shortcode } = params

  // Query database
  const { data, error } = await supabase
    .from('urls')
    .select('id, original_url, clicks')
    .or(`short_url.eq.${shortcode},custom_url.eq.${shortcode}`)
    .single()

  if (error || !data) {
    notFound()
  }

  // Log click in background
  supabase.from('clicks').insert({
    url_id: data.id,
    user_agent: null, // Will be added via middleware
  }).then()

  // Update clicks count
  supabase.from('urls')
    .update({ clicks: data.clicks + 1 })
    .eq('id', data.id)
    .then()

  // Add protocol if missing
  let url = data.original_url
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  // Server-side redirect
  redirect(url)
}
```

## Step 7: Create Dashboard Page

Create `app/dashboard/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    const { data } = await supabase
      .from('urls')
      .select('*')
      .order('created_at', { ascending: false })
    
    setUrls(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        {/* Create URL Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Short URL</h2>
          {/* Add your create form here */}
        </div>

        {/* URLs List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Your URLs</h2>
          {urls.map((url: any) => (
            <div key={url.id} className="border-b py-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{url.short_url || url.custom_url}</p>
                  <p className="text-gray-600 text-sm">{url.original_url}</p>
                </div>
                <div>
                  <span className="text-gray-500">{url.clicks} clicks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Step 8: Update Environment Variables

Rename variables in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=https://epyutufurcgskuzwiqce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## Step 9: Create Tailwind Config

Create `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
```

## Step 10: Create 404 Page

Create `app/not-found.tsx`:
```tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="text-center text-white">
        <h1 className="text-8xl font-bold">404</h1>
        <p className="text-2xl mt-4">URL Not Found</p>
        <a href="/" className="mt-8 inline-block px-6 py-3 bg-white text-[#667eea] rounded-lg">
          Go Home
        </a>
      </div>
    </div>
  )
}
```

## Step 11: Update next.config.js

Already created above.

## Step 12: Clean Up Old Files

```bash
# Remove Vite-specific files
rm vite.config.js
rm index.html

# Keep src/components and src/db for now, migrate gradually
```

## Step 13: Update Vercel Configuration

Update `vercel.json`:
```json
{}
```

That's it! Next.js handles routing automatically.

## Step 14: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

## Step 15: Deploy to Vercel

```bash
git add .
git commit -m "Convert from Vite to Next.js"
git push origin main
```

Vercel will automatically detect Next.js and deploy correctly!

## Key Differences:

1. **Server-Side Redirects**: The `app/[shortcode]/page.tsx` runs on the server and returns proper HTTP 301 redirects
2. **No Client-Side Routing Needed**: Next.js handles all routing automatically
3. **Better Performance**: Server-side rendering and automatic code splitting
4. **Proper SEO**: Search engines can follow redirects

## Gradual Migration:

You can keep your existing components in `src/components` and gradually convert them. Next.js can import from anywhere in your project.

Start with the pages above, then migrate components one by one as needed.

---

## Quick Start (Copy-Paste Ready)

Would you like me to create a script that automates this entire conversion? I can generate all the necessary files at once.
