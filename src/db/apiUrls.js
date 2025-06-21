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
  if (!id) {
    throw new Error("URL ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("urls")
      .select("*")
      .or(`short_url.ilike.${id},custom_url.ilike.${id}`)
      .maybeSingle();

    if (error) {
      console.error("Error looking up URL:", error);
      throw new Error(error.message || "URL not found");
    }

    if (data) {
      console.log("Found URL by case-insensitive match:", id);
      return data;
    }

    // If still not found, throw error
    console.error("No URL found for:", id);
    throw new Error("URL not found");
  } catch (error) {
    console.error("Error in getLongUrl:", error);
    throw new Error(error.message || "URL not found");
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

export async function createUrl({ title, longUrl, customUrl, user_id }, qrcode) {
  try {
    // Generate a unique short URL
    const short_url = Math.random().toString(36).substring(2, 8); // Made longer (6 chars)
    
    // Ensure the URL has a protocol
    let original_url = longUrl;
    if (!original_url.startsWith('http://') && !original_url.startsWith('https://')) {
      original_url = 'https://' + original_url;
    }

    // First check if custom URL already exists
    if (customUrl) {
      const { data: existingUrl } = await supabase
        .from("urls")
        .select("id")
        .or(`custom_url.eq.${customUrl},short_url.eq.${customUrl}`)
        .maybeSingle();

      if (existingUrl) {
        throw new Error("Custom URL already taken");
      }
    }

    // Insert the new URL
    const { data, error } = await supabase
      .from("urls")
      .insert([
        {
          title: title || original_url,
          user_id,
          original_url,
          custom_url: customUrl || null,
          short_url,
          qr_code: qrcode || null,
          clicks: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating URL:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in createUrl:", error);
    throw new Error(error.message || "Error creating short URL");
  }
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
    .select("id, original_url, short_url, custom_url, user_id, clicks")
    .limit(10);

  if (error) {
    console.error('Error fetching URLs:', error);
    return;
  }

  console.log('All URLs in database:', data);
  return data;
}
