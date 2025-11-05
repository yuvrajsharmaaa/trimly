export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: {
      hasUrl: !!process.env.VITE_SUPABASE_URL,
      hasKey: !!process.env.VITE_SUPABASE_ANON_KEY
    }
  });
}
