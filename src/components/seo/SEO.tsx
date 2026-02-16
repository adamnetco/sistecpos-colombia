import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageSeo } from "@/hooks/usePageSeo";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = "https://sistecpos.com";
const DEFAULT_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/oovRngJ9hbfWUf6lyjyUTIF7FNo1/social-images/social-1769750139415-tarjeta-2-sistecpos-v2.png";

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

  useEffect(() => {
    // Merge: DB overrides take priority over component props
    const finalTitle = overrides?.meta_title || title;
    const finalDesc = overrides?.meta_description || description;
    const finalNoindex = overrides?.noindex ?? noindex;
    const finalOgImage = overrides?.og_image || ogImage || DEFAULT_OG_IMAGE;
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
  }, [title, description, canonical, ogImage, noindex, location.pathname, overrides]);

  return null;
}


// Backward compatibility alias
export { SEO as DynamicMeta };
