export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const shortcode = url.pathname.split('/').pop();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Missing configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Query Supabase
    const response = await fetch(
      `${supabaseUrl}/rest/v1/urls?or=(short_url.eq.${shortcode},custom_url.eq.${shortcode})&select=id,original_url,clicks`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return new Response('404 - URL Not Found', { status: 404 });
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
      body: JSON.stringify({ clicks: urlData.clicks + 1 })
    }).catch(() => {});

    // Redirect
    return Response.redirect(redirectUrl, 301);

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
