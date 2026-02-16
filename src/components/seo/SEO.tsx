import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePageSeo } from "@/hooks/usePageSeo";
import { supabase } from "@/integrations/supabase/client";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = "https://sistecpos.com";
const FALLBACK_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/oovRngJ9hbfWUf6lyjyUTIF7FNo1/social-images/social-1769750139415-tarjeta-2-sistecpos-v2.png";

// Cache default OG image from DB
let cachedDefaultOg: string | null = null;
let defaultOgFetched = false;

function useDefaultOgImage() {
  const [img, setImg] = useState(cachedDefaultOg || FALLBACK_OG_IMAGE);
  useEffect(() => {
    if (defaultOgFetched) { setImg(cachedDefaultOg || FALLBACK_OG_IMAGE); return; }
    supabase.from("app_settings").select("value").eq("key", "default_og_image").maybeSingle()
      .then(({ data }) => {
        const val = (data as any)?.value || "";
        cachedDefaultOg = val || null;
        defaultOgFetched = true;
        setImg(val || FALLBACK_OG_IMAGE);
      });
  }, []);
  return img;
}

function setMetaTag(property: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function injectJsonLd(data: any) {
  // Remove previous dynamic ld+json
  document.querySelectorAll('script[data-seo-dynamic="true"]').forEach((el) => el.remove());
  if (!data) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo-dynamic", "true");
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function SEO({ title, description, canonical, ogImage, noindex }: SEOProps) {
  const location = useLocation();
  const overrides = usePageSeo();
  const defaultOgImage = useDefaultOgImage();

  useEffect(() => {
    // Merge: DB overrides take priority over component props
    const finalTitle = overrides?.meta_title || title;
    const finalDesc = overrides?.meta_description || description;
    const finalNoindex = overrides?.noindex ?? noindex;
    const finalOgImage = overrides?.og_image || ogImage || defaultOgImage;
    const finalOgType = overrides?.og_type || "website";
    const finalCanonical = overrides?.canonical_url || canonical || `${BASE_URL}${location.pathname}`;
    const finalRobots = finalNoindex
      ? "noindex, nofollow"
      : overrides?.robots || "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    // Title
    document.title = finalTitle;

    // Basic meta
    setMetaTag("description", finalDesc);
    setMetaTag("robots", finalRobots);

    // Open Graph
    setMetaTag("og:title", finalTitle, true);
    setMetaTag("og:description", finalDesc, true);
    setMetaTag("og:type", finalOgType, true);
    setMetaTag("og:url", finalCanonical, true);
    setMetaTag("og:image", finalOgImage, true);
    setMetaTag("og:locale", "es_CO", true);
    setMetaTag("og:site_name", "SistecPOS", true);

    // Twitter
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", finalTitle);
    setMetaTag("twitter:description", finalDesc);
    setMetaTag("twitter:image", finalOgImage);

    // Canonical
    setCanonical(finalCanonical);

    // JSON-LD from DB
    if (overrides?.json_ld) {
      injectJsonLd(overrides.json_ld);
    }
  }, [title, description, canonical, ogImage, noindex, location.pathname, overrides, defaultOgImage]);

  return null;
}


// Backward compatibility alias
export { SEO as DynamicMeta };
