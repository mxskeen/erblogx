import { API_CONFIG, getApiUrl } from "./config";
import { supabase } from "../services/supabase";

export const DEFAULT_ARTICLE_COUNT = 25482;

let memoryCountCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function formatArticleCount(count) {
  const num = Number(count) || DEFAULT_ARTICLE_COUNT;
  return num.toLocaleString();
}

export function formatArticleCountPlus(count) {
  return `${formatArticleCount(count)}+`;
}

/**
 * Fetch the actual article count from backend API or Supabase, falling back gracefully.
 */
export async function fetchArticleCount() {
  const now = Date.now();
  if (memoryCountCache !== null && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryCountCache;
  }

  // 1. Try local Next.js API route first (in browser context)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/articles/count", {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number" && data.count > 0) {
          memoryCountCache = data.count;
          lastFetchTime = now;
          return memoryCountCache;
        }
      }
    } catch {
      // Local route fetch failed, proceed to backend
    }
  }

  // 2. Try direct Backend API call
  try {
    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.ARTICLE_COUNT);
    if (apiUrl && !apiUrl.startsWith("/")) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number" && data.count > 0) {
          memoryCountCache = data.count;
          lastFetchTime = now;
          return memoryCountCache;
        }
      }
    }
  } catch {
    // Backend API unreachable
  }

  // 3. Try Supabase client directly if configured
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabase && supabaseUrl && !supabaseUrl.includes("placeholder")) {
      const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

      if (!error && typeof count === "number" && count > 0) {
        memoryCountCache = count;
        lastFetchTime = now;
        return memoryCountCache;
      }
    }
  } catch {
    // Supabase query failed
  }

  return memoryCountCache || DEFAULT_ARTICLE_COUNT;
}
