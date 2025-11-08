import { Button } from "@/components/ui/button";
import { getUrls } from "@/db/apiUrls";
import supabase from "@/db/superbase";
import { useState } from "react";

export function DebugUrls() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchAllUrls = async () => {
    setLoading(true);
    try {
      // Direct query to see what's actually in the database
      const { data, error } = await supabase
        .from("urls")
        .select("id, short_url, custom_url, original_url, user_id, clicks")
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching URLs:', error);
        setTestResult({ error: error.message });
      } else {
        console.log('URLs in database:', data);
        setUrls(data || []);
        setTestResult({ success: true, count: data?.length || 0 });
      }
    } catch (error) {
      console.error('Debug error:', error);
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testLookup = async (shortcode) => {
    console.log(`Testing lookup for: ${shortcode}`);
    try {
      const { data, error } = await supabase
        .from("urls")
        .select("*")
        .or(`short_url.eq.${shortcode},custom_url.eq.${shortcode}`)
        .maybeSingle();
      
      console.log(`Result for ${shortcode}:`, { data, error });
      alert(`Lookup ${shortcode}: ${data ? 'FOUND' : 'NOT FOUND'}\n${data ? data.original_url : error?.message || 'No match'}`);
    } catch (err) {
      console.error('Test error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-800 text-white">
      <h3 className="text-lg font-bold mb-4">🐛 Debug URLs in Database</h3>
      
      <div className="flex gap-2 mb-4">
        <Button onClick={fetchAllUrls} disabled={loading} variant="outline">
          {loading ? 'Loading...' : 'Fetch All URLs'}
        </Button>
      </div>

      {testResult && (
        <div className={`p-2 rounded mb-4 ${testResult.error ? 'bg-red-900' : 'bg-green-900'}`}>
          {testResult.error ? `Error: ${testResult.error}` : `Success! Found ${testResult.count} URLs`}
        </div>
      )}
      
      {urls.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">URLs in Database ({urls.length}):</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {urls.map((url, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded text-sm border border-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">ID:</div>
                  <div className="font-mono text-xs">{url.id}</div>
                  
                  <div className="font-semibold">Short URL:</div>
                  <div className="font-mono text-blue-400">{url.short_url || 'null'}</div>
                  
                  <div className="font-semibold">Custom URL:</div>
                  <div className="font-mono text-purple-400">{url.custom_url || 'none'}</div>
                  
                  <div className="font-semibold">Original:</div>
                  <div className="text-xs break-all">{url.original_url}</div>
                  
                  <div className="font-semibold">User ID:</div>
                  <div className="font-mono text-xs">{url.user_id || 'null'}</div>
                  
                  <div className="font-semibold">Clicks:</div>
                  <div>{url.clicks || 0}</div>
                </div>
                
                <div className="mt-2 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => testLookup(url.custom_url || url.short_url)}
                  >
                    Test Lookup
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      const code = url.custom_url || url.short_url;
                      window.open(`/${code}`, '_blank');
                    }}
                  >
                    Try Redirect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {urls.length === 0 && !loading && (
        <div className="text-gray-400 text-center p-4">
          No URLs loaded. Click &quot;Fetch All URLs&quot; to see what&apos;s in the database.
        </div>
      )}
    </div>
  );
} 