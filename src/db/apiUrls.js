import supabase from "./superbase";

export async function getUrls(user_id) {
  try {
    let query = supabase.from("urls").select("*");

    if (user_id && user_id !== 'guest') {
      query = query.eq("user_id", user_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching URLs:", error);
    throw new Error("Unable to load URLs");
  }
}

export async function getUrl(id) {
  try {
    const { data, error } = await supabase
      .from("urls")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("URL not found");
    
    return data;
  } catch (error) {
    console.error("Error fetching URL:", error);
    throw new Error("URL not found");
  }
}

export async function getLongUrl(id) {
  try {
    // Try short_url first
    const { data: shortUrlData, error: shortUrlError } = await supabase
      .from("urls")
      .select("*")
      .eq("short_url", id)
      .maybeSingle();

    if (shortUrlData) return shortUrlData;

    // Try custom_url if short_url not found
    const { data: customUrlData, error: customUrlError } = await supabase
      .from("urls")
      .select("*")
      .eq("custom_url", id)
      .maybeSingle();

    if (customUrlData) return customUrlData;

    // If neither found, throw error
    throw new Error("URL not found");
  } catch (error) {
    console.error("Error looking up URL:", error);
    throw new Error("URL not found");
  }
}

function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

export async function createUrl(
  { title, longUrl, customUrl, user_id },
  qrcode
) {
  const short_url = Math.random().toString(36).substr(2, 6);
  const fileName = `qr-${short_url}`;

  const qrBlob = dataURLtoBlob(qrcode);

  const { error: storageError } = await supabase.storage
    .from("urlshortener")
    .upload(fileName, qrBlob);

  if (storageError) throw new Error(storageError.message);

  const qr = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/qrs/${fileName}`;

  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        title,
        user_id,
        original_url: longUrl,
        custom_url: customUrl || null,
        short_url,
        qr,
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error creating short URL");
  }

  return data;
}

export async function deleteUrl(id) {
  try {
    const { error } = await supabase
      .from("urls")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting URL:", error);
    throw new Error("Unable to delete URL");
  }
}

export async function testUrlLookup() {
  console.log('Testing URL lookup...');
  
  // Get all URLs to see what's in the database
  const { data, error } = await supabase
    .from("urls")
    .select("id, original_url, short_url, custom_url, user_id")
    .limit(10);

  if (error) {
    console.error('Error fetching URLs:', error);
    return;
  }

  console.log('All URLs in database:', data);
  return data;
}
