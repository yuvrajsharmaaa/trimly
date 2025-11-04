/**
 * Vercel Serverless Function for URL Redirection
 * Handles dynamic URL routing with server-side HTTP redirects
 * 
 * Route: /api/redirect/[shortcode]
 * Returns: 301/302 redirect or 404
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Parse user agent for analytics
 */
function parseUserAgent(userAgent) {
  const ua = userAgent || '';
  
  // Simple device detection
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const device = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');
  
  // Simple browser detection
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  // Simple OS detection
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return { device, browser, os };
}

/**
 * Store click analytics in background
 */
async function storeClick(urlId, request) {
  try {
    const userAgent = request.headers['user-agent'] || '';
    const referrer = request.headers['referer'] || request.headers['referrer'] || null;
    const ip = request.headers['x-forwarded-for'] || 
               request.headers['x-real-ip'] || 
               request.connection?.remoteAddress || 
               null;

    // Parse user agent
    const { device, browser, os } = parseUserAgent(userAgent);

    // Get location data from IP (optional - can be slow)
    let country = null;
    try {
      // Vercel provides geo info in headers
      country = request.headers['x-vercel-ip-country'] || null;
    } catch (err) {
      console.warn('Could not get geo data:', err);
    }

    // Store click with proper column names
    const { error } = await supabase.from('clicks').insert({
      url_id: urlId,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer,
      country: country,
    });

    if (error) {
      console.error('Error storing click:', error);
    }
  } catch (err) {
    console.error('Failed to store click:', err);
  }
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Extract shortcode from URL path
  const { shortcode } = req.query;

  console.log('=== SERVER REDIRECT DEBUG ===');
  console.log('Shortcode:', shortcode);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);

  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!shortcode) {
    return res.status(400).json({ error: 'Shortcode is required' });
  }

  try {
    // Query database for the URL (check both short_url and custom_url)
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .or(`short_url.eq.${shortcode},custom_url.eq.${shortcode}`)
      .maybeSingle();

    console.log('Database query result:', { data, error });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message 
      });
    }

    if (!data) {
      console.log('URL not found for shortcode:', shortcode);
      
      // Return 404 with HTML page
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 - URL Not Found | Trimly</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: linear-gradient(135deg, #23232b 0%, #18181b 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 {
              font-size: 6rem;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            h2 {
              font-size: 2rem;
              margin: 1rem 0;
            }
            p {
              font-size: 1.2rem;
              color: #a0a0a0;
              margin: 1rem 0;
            }
            .code {
              background: #2d2d2d;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              display: inline-block;
              margin: 1rem 0;
              font-family: monospace;
              color: #ff6b6b;
            }
            a {
              display: inline-block;
              margin-top: 2rem;
              padding: 1rem 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
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
      `);
      return;
    }

    console.log('Found URL:', data.original_url);

    // Store click analytics in background (don't await)
    storeClick(data.id, req).catch(err => {
      console.error('Background click storage failed:', err);
    });

    // Ensure URL has proper protocol
    let redirectUrl = data.original_url;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
    }

    console.log('Redirecting to:', redirectUrl);

    // Perform server-side 301 redirect (permanent)
    // Use 302 for temporary redirects
    res.setHeader('Location', redirectUrl);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(301).end();

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
}
