import { NextResponse } from "next/server";
import { supabase } from "../../../../services/supabase";
import { API_CONFIG, getApiUrl } from "../../../../lib/config";

const DEFAULT_ARTICLE_COUNT = 25482;

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  // 1. Try querying backend API if available
  try {
    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.ARTICLE_COUNT);
    if (apiUrl && !apiUrl.startsWith("/")) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { "Accept": "application/json" },
        next: { revalidate: 300 },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number" && data.count > 0) {
          return NextResponse.json(
            { count: data.count, source: "backend" },
            {
              headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
              },
            }
          );
        }
      }
    }
  } catch (err) {
    // Backend API query timed out or unreachable
  }

  // 2. Try Supabase direct query if configured
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabase && supabaseUrl && !supabaseUrl.includes("placeholder")) {
      const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });

      if (!error && typeof count === "number" && count > 0) {
        return NextResponse.json(
          { count, source: "supabase" },
          {
            headers: {
              "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
          }
        );
      }
    }
  } catch (err) {
    // Supabase query error
  }

  // 3. Fallback count
  return NextResponse.json(
    { count: DEFAULT_ARTICLE_COUNT, source: "fallback" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
