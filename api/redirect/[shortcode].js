import { createClient } from '@supabase/supabase-js';

// Get credentials from Next.js env
import { createClient } from '@supabase/supabase-js';

// Get credentials - Next.js environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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

export default async function handler(req, res) {
  const { shortcode } = req.query;

  // Check environment
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return res.status(500).json({ 
      error: 'Server configuration error',
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Redirect request:', { shortcode, method: req.method });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!shortcode) {
    return res.status(400).json({ error: 'Missing shortcode' });
  }

  try {
    const { data, error } = await supabase
      .from('urls')
      .select('id, original_url, clicks')
      .or(`short_url.eq.${shortcode},custom_url.eq.${shortcode}`)
      .single();

    console.log('Query result:', { found: !!data, error: error?.message });

    if (error || !data) {
      console.log('Not found:', shortcode);
      return res.status(404).send(`
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
    }

    // Add protocol if missing
    let url = data.original_url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    console.log('Redirecting to:', url);

    // Log click in background
    supabase.from('clicks').insert({
      url_id: data.id,
      ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || null,
      user_agent: req.headers['user-agent'] || null,
      referrer: req.headers['referer'] || null,
      country: req.headers['x-vercel-ip-country'] || null
    }).then(() => {
      // Update clicks count
      supabase.from('urls').update({ clicks: data.clicks + 1 }).eq('id', data.id).then();
    }).catch(err => console.error('Click log failed:', err));

    // Redirect
    res.writeHead(301, { 'Location': url });
    res.end();

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
}
