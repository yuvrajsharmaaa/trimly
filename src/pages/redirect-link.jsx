import { storeClicks } from "@/db/apiClicks";
import { getLongUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const RedirectLink = () => {
  const { id } = useParams();
  const { loading, data, error, fn } = useFetch(getLongUrl, id);

  useEffect(() => {
    fn();
  }, []);

  useEffect(() => {
    if (!loading && data?.original_url) {
      // Fire-and-forget: store click stats in the background
      storeClicks({
        id: data.id,
        originalUrl: data.original_url,
      });

      // Redirect immediately
      window.location.replace(data.original_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#18181b]">
        <BarLoader width={120} color="#36d7b7" />
        <span className="mt-4 text-white text-base sm:text-lg">Redirecting…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#18181b]">
        <span className="text-red-500 text-lg">Error: {error.message}</span>
        <span className="text-white mt-2">The short URL you're looking for doesn't exist.</span>
      </div>
    );
  }

  return null;
};

export default RedirectLink;