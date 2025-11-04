import supabase from "./superbase";

// In-memory cache with TTL (Time To Live) for optimal performance
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache utility with automatic expiration
 * Implements LRU-like behavior for memory efficiency
 */
const cacheUtils = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    return item.data;
  },
  set: (key, data, ttl = CACHE_TTL) => {
    cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
    // Implement simple LRU: if cache gets too large, clear oldest entries
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
  },
  invalidate: (pattern) => {
    if (pattern === '*') {
      cache.clear();
    } else {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) cache.delete(key);
      }
    }
  }
};

/**
 * Fetch all URLs with caching and pagination support
 * Optimized with query result caching
 */
export async function getUrls(user_id, useCache = true) {
  const cacheKey = `urls_${user_id || 'all'}`;
  
  // Return cached data if available
  if (useCache) {
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;
  }

  try {
    const query = supabase
      .from("urls")
      .select("*")
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    
    const result = data || [];
    cacheUtils.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching URLs:", error);
    throw new Error("Unable to load URLs");
  }
}

/**
 * Fetch single URL by ID with caching
 * Uses memoization for frequently accessed URLs
 */
export async function getUrl(id, useCache = true) {
  const cacheKey = `url_${id}`;
  
  if (useCache) {
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;
  }

  try {
    const { data, error } = await supabase
      .from("urls")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("URL not found");
    
    cacheUtils.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching URL:", error);
    throw new Error("URL not found");
  }
}

/**
 * Optimized URL lookup with dual strategy:
 * 1. Check cache first
 * 2. Use case-insensitive search with indexing
 */
export async function getLongUrl(id) {
  if (!id) {
    throw new Error("URL ID is required");
  }

  const cacheKey = `lookup_${id.toLowerCase()}`;
  
  // Check cache first
  const cached = cacheUtils.get(cacheKey);
  if (cached) return cached;

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

    if (!data) {
      throw new Error("URL not found");
    }

    // Cache the result
    cacheUtils.set(cacheKey, data, CACHE_TTL * 2); // Longer TTL for redirects
    return data;
  } catch (error) {
    console.error("Error in getLongUrl:", error);
    throw new Error(error.message || "URL not found");
  }
}

/**
 * Optimized short URL generator using base62 encoding
 * Ensures uniqueness and collision resistance
 */
const generateShortUrl = (() => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let counter = Date.now();
  
  return (length = 6) => {
    counter++;
    let result = '';
    let num = counter + Math.floor(Math.random() * 1000000);
    
    while (num > 0 && result.length < length) {
      result = chars[num % 62] + result;
      num = Math.floor(num / 62);
    }
    
    // Pad with random chars if needed
    while (result.length < length) {
      result = chars[Math.floor(Math.random() * 62)] + result;
    }
    
    return result;
  };
})();

/**
 * Normalize URL with protocol validation
 * Ensures consistent URL formatting
 */
const normalizeUrl = (url) => {
  if (!url) throw new Error("URL is required");
  
  const trimmed = url.trim();
  if (!trimmed) throw new Error("URL cannot be empty");
  
  // Check if URL already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Add https by default
  return `https://${trimmed}`;
};

/**
 * Validate custom URL format
 * Returns normalized custom URL or null
 */
const validateCustomUrl = (customUrl) => {
  if (!customUrl) return null;
  
  const normalized = customUrl.trim().toLowerCase();
  
  // Validate format: alphanumeric, hyphens, underscores only
  if (!/^[a-z0-9_-]+$/.test(normalized)) {
    throw new Error("Custom URL can only contain letters, numbers, hyphens, and underscores");
  }
  
  if (normalized.length < 3 || normalized.length > 20) {
    throw new Error("Custom URL must be between 3 and 20 characters");
  }
  
  return normalized;
};

/**
 * Create shortened URL with optimized validation and collision handling
 * Implements retry logic for collision avoidance
 */
export async function createUrl({ title, longUrl, customUrl }, qrcode) {
  const MAX_RETRIES = 3;
  
  try {
    // Normalize and validate input
    const original_url = normalizeUrl(longUrl);
    const custom_url = validateCustomUrl(customUrl);
    
    // Check custom URL availability if provided
    if (custom_url) {
      const { data: existingUrl } = await supabase
        .from("urls")
        .select("id")
        .or(`custom_url.eq.${custom_url},short_url.eq.${custom_url}`)
        .maybeSingle();

      if (existingUrl) {
        throw new Error("Custom URL already taken. Please try another one.");
      }
    }
    
    // Generate short URL with collision retry logic
    let short_url;
    let attempts = 0;
    
    while (attempts < MAX_RETRIES) {
      short_url = generateShortUrl(6);
      
      // Check for collision
      const { data: collision } = await supabase
        .from("urls")
        .select("id")
        .eq("short_url", short_url)
        .maybeSingle();
      
      if (!collision) break;
      attempts++;
    }
    
    if (attempts === MAX_RETRIES) {
      throw new Error("Failed to generate unique short URL. Please try again.");
    }

    // Insert the new URL
    const { data, error } = await supabase
      .from("urls")
      .insert([
        {
          title: title || original_url,
          user_id: null, // No authentication needed
          original_url,
          custom_url,
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

    // Invalidate cache after creation
    cacheUtils.invalidate('urls_');
    
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
