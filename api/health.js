import supabase from '../src/db/superbase';

export default async function handler(req, res) {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('urls')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      urlCount: data?.length || 0,
      supabaseUrl: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'missing'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'missing'
    });
  }
} 