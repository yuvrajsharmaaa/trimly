import { storeClicks } from "@/db/apiClicks";
import { getLongUrl, testUrlLookup } from "@/db/apiUrls";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";

const RedirectLink = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const redirectToUrl = async () => {
      if (!id) {
        setError(new Error("No URL ID provided"));
        setLoading(false);
        return;
      }

      try {
        // First, let's check what URLs exist in the database
        const allUrls = await testUrlLookup();
        console.log("All URLs in database:", allUrls);
        setDebugInfo(prev => ({ ...prev, allUrls }));

        console.log("Looking up URL:", id);
        setDebugInfo(prev => ({ ...prev, lookingFor: id }));
        
        const data = await getLongUrl(id);
        console.log("URL lookup result:", data);

        if (!data || !data.original_url) {
          console.error("No URL found for:", id);
          setDebugInfo(prev => ({ 
            ...prev, 
            error: 'No URL data found',
            urlData: data 
          }));
          setError(new Error("URL not found"));
          setLoading(false);
          return;
        }

        setDebugInfo(prev => ({ 
          ...prev, 
          found: true,
          originalUrl: data.original_url,
          shortUrl: data.short_url,
          customUrl: data.custom_url
        }));

        // Store click data in the background
        try {
          await storeClicks({
            id: data.id,
            originalUrl: data.original_url,
          }).catch(console.error);
        } catch (clickError) {
          console.error("Error storing click:", clickError);
          setDebugInfo(prev => ({ ...prev, clickError: clickError.message }));
        }

        // Ensure URL has proper protocol
        let redirectUrl = data.original_url;
        if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
          redirectUrl = 'https://' + redirectUrl;
        }

        setDebugInfo(prev => ({ ...prev, redirectUrl }));
        
        // Add a small delay to show debug info before redirect
        setTimeout(() => {
          window.location.replace(redirectUrl);
        }, 1000);
      } catch (err) {
        console.error("Redirect error:", err);
        setDebugInfo(prev => ({ ...prev, error: err.message }));
        setError(err);
        setLoading(false);
      }
    };

    redirectToUrl();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#18181b]">
        <BarLoader width={120} color="#36d7b7" />
        <span className="mt-4 text-white text-base sm:text-lg">Redirecting…</span>
        <span className="mt-2 text-gray-400 text-sm">Looking up: {id}</span>
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Debug Information:</h3>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#18181b]">
        <span className="text-red-500 text-lg">Error: {error.message}</span>
        <span className="text-white mt-2">The URL you're looking for doesn't exist.</span>
        <span className="text-gray-400 mt-2">ID: {id}</span>
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Debug Information:</h3>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </button>
      </div>
    );
  }

  return null;
};

export default RedirectLink;