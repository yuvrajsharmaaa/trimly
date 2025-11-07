import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:shortcode*',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip if it's a known route
  if (
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/link/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return;
  }

  // Extract shortcode
  const shortcode = pathname.substring(1);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response('Configuration error', { status: 500 });
  }

  try {
    // Query Supabase REST API
    const response = await fetch(
      `${supabaseUrl}/rest/v1/urls?or=(short_url.eq.${shortcode},custom_url.eq.${shortcode})&select=id,original_url,clicks&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return new Response(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>404 - URL Not Found | Trimly</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 8rem;
      margin: 0;
    }
    h2 {
      font-size: 2rem;
      margin: 1rem 0;
    }
    p {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    .code {
      background: rgba(0,0,0,0.3);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      display: inline-block;
      margin: 1rem 0;
      font-family: monospace;
    }
    a {
      display: inline-block;
      margin-top: 2rem;
      padding: 1rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: bold;
      transition: transform 0.2s;
    }
    a:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>URL Not Found</h2>
    <p>The short URL you're looking for doesn't exist.</p>
    <div class="code">/${shortcode}</div>
    <p>This link may have been deleted or never existed.</p>
    <a href="/">Go to Homepage</a>
  </div>
</body>
</html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const urlData = data[0];
    let redirectUrl = urlData.original_url;

    // Add protocol if missing
    if (!/^https?:\/\//i.test(redirectUrl)) {
      redirectUrl = 'https://' + redirectUrl;
    }

    // Log click (fire and forget)
    fetch(`${supabaseUrl}/rest/v1/clicks`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        url_id: urlData.id,
        ip_address: request.headers.get('x-forwarded-for'),
        user_agent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
        country: request.headers.get('x-vercel-ip-country')
      })
    }).catch(() => {});

    // Update clicks count
    fetch(`${supabaseUrl}/rest/v1/urls?id=eq.${urlData.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clicks: (urlData.clicks || 0) + 1 })
    }).catch(() => {});

  // Return 301 redirect using NextResponse
  return NextResponse.redirect(redirectUrl, 301);

  } catch (error) {
    console.error('Redirect error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
