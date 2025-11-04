import { UAParser } from "ua-parser-js";
import supabase from "./superbase";

// export async function getClicks() {
//   let {data, error} = await supabase.from("clicks").select("*");

//   if (error) {
//     console.error(error);
//     throw new Error("Unable to load Stats");
//   }

//   return data;
// }

export async function getClicksForUrls(urlIds) {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .in("url_id", urlIds);

  if (error) {
    console.error("Error fetching clicks:", error);
    return null;
  }

  return data;
}

export async function getClicksForUrl(url_id) {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

const parser = new UAParser();

export const storeClicks = async ({ id, originalUrl }) => {
  try {
    const res = parser.getResult();
    const device = res.device?.type || "desktop"; // Default to desktop if type is not detected
    const browser = res.browser?.name || "Unknown";
    const os = res.os?.name || "Unknown";

    // Get location data
    let city = null;
    let country = null;
    try {
      const response = await fetch("https://ipapi.co/json");
      const locationData = await response.json();
      city = locationData.city;
      country = locationData.country_name;
    } catch (err) {
      console.warn("Failed to fetch location data:", err);
    }

    // Record the click with proper column names matching your schema
    const { error } = await supabase.from("clicks").insert({
      url_id: id, // uuid
      ip_address: null, // You can add IP tracking if needed
      user_agent: window.navigator.userAgent,
      referrer: document.referrer || null,
      country: country,
      // Note: Your schema doesn't have 'city', 'device', 'browser', 'os' columns
      // Storing in user_agent for now
    });

    if (error) {
      console.error("Error storing click:", error);
    }
  } catch (error) {
    console.error("Error recording click:", error);
  }
};
