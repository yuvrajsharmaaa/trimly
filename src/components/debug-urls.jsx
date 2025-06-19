import { Button } from "@/components/ui/button";
import { testUrlLookup } from "@/db/apiUrls";
import { useState } from "react";

export function DebugUrls() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const testUrls = async () => {
    setLoading(true);
    try {
      const data = await testUrlLookup();
      setUrls(data || []);
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-800">
      <h3 className="text-lg font-bold mb-4">Debug URLs</h3>
      <Button onClick={testUrls} disabled={loading}>
        {loading ? 'Loading...' : 'Test URL Lookup'}
      </Button>
      
      {urls.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">URLs in Database:</h4>
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="p-2 bg-gray-700 rounded text-sm">
                <div>ID: {url.id}</div>
                <div>Short: {url.short_url}</div>
                <div>Custom: {url.custom_url || 'none'}</div>
                <div>Original: {url.original_url}</div>
                <div>User ID: {url.user_id || 'null'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 