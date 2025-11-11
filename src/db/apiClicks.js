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
    const device = res.device?.type || "desktop";
    const browser = res.browser?.name || "Unknown";
    const os = res.os?.name || "Unknown";

    // Get location data
    let city = "Unknown";
    let country = "Unknown";
    try {
      const response = await fetch("https://ipapi.co/json");
      const locationData = await response.json();
      city = locationData.city || "Unknown";
      country = locationData.country_name || "Unknown";
    } catch (err) {
      console.warn("Failed to fetch location data:", err);
    }

    // Record the click with all analytics data
    const { error } = await supabase.from("clicks").insert({
      url_id: id,
      city: city,
      country: country,
      device: device,
      browser: browser,
      os: os,
      referrer: document.referrer || null,
    });

    if (error) {
      console.error("Error storing click:", error);
    }

    console.log("Click recorded:", { city, country, device, browser, os });
  } catch (error) {
    console.error("Error recording click:", error);
  }
};
