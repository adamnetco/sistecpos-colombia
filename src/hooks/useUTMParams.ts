import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

/**
 * Hook to capture UTM parameters from the current URL.
 * Stores them in sessionStorage so they persist across page navigations.
 */
export function useUTMParams(): UTMParams {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const fromUrl: UTMParams = {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      utm_term: searchParams.get("utm_term"),
      utm_content: searchParams.get("utm_content"),
    };

    // If URL has UTM params, store them
    const hasUtm = Object.values(fromUrl).some(Boolean);
    if (hasUtm) {
      try {
        sessionStorage.setItem("utm_params", JSON.stringify(fromUrl));
      } catch { /* silent */ }
      return fromUrl;
    }

    // Otherwise try to read from sessionStorage
    try {
      const stored = sessionStorage.getItem("utm_params");
      if (stored) return JSON.parse(stored) as UTMParams;
    } catch { /* silent */ }

    return fromUrl;
  }, [searchParams]);
}
