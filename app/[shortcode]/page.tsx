import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { storeClicks } from '@/db/apiClicks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Server-Side Redirect Handler for Shortened URLs
 * This is THE solution to the 404 problem - handles redirects at server level
 * 
 * Dynamic Route: /[shortcode] (e.g., /abc123 or /my-custom-link)
 * Server Component: Executes on server, performs redirect before sending response
 */
export default async function RedirectPage({
  params,
}: {
  params: { shortcode: string }
}) {
  const { shortcode } = params
  
  try {
    // Case-insensitive lookup for short_url OR custom_url
    const { data, error } = await supabase
      .from('urls')
      .select('id, original_url, short_url, custom_url')
      .or(`short_url.ilike.${shortcode},custom_url.ilike.${shortcode}`)
      .maybeSingle()

    if (error) {
      console.error('[Redirect Error]', error)
      notFound()
    }

    if (!data) {
      console.log(`[404] Shortcode not found: ${shortcode}`)
      notFound()
    }

    // Increment click count
    await supabase
      .from('urls')
      .update({ clicks: data.clicks || 0 + 1 })
      .eq('id', data.id)

    // Store click analytics (async, don't wait)
    storeClicks({ url_id: data.id }).catch(err => {
      console.error('[Click Tracking Error]', err)
    })

    console.log(`[Redirect] ${shortcode} → ${data.original_url}`)
    
    // Server-side permanent redirect (301)
    redirect(data.original_url)
  } catch (err) {
    console.error('[Redirect Handler Error]', err)
    notFound()
  }
}

/**
 * Generate static params for known URLs at build time (optional optimization)
 * Uncomment to enable ISR (Incremental Static Regeneration)
 */
// export async function generateStaticParams() {
//   const { data } = await supabase
//     .from('urls')
//     .select('short_url, custom_url')
//     .limit(100)
  
//   const params = []
//   if (data) {
//     for (const url of data) {
//       if (url.short_url) params.push({ shortcode: url.short_url })
//       if (url.custom_url) params.push({ shortcode: url.custom_url })
//     }
//   }
  
//   return params
// }

// Revalidate every 60 seconds (ISR)
export const revalidate = 60
