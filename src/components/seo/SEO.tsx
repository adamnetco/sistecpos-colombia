import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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

export function SEO({ title, description, canonical, ogImage, noindex }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // Title
    document.title = title;

    // Basic meta
    setMetaTag("description", description);

    // Robots
    if (noindex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    // Auto-generate canonical from current path if not provided
    const canonicalUrl = canonical || `${BASE_URL}${location.pathname}`;

    // Open Graph
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", "website", true);
    setMetaTag("og:url", canonicalUrl, true);
    setMetaTag("og:image", ogImage || DEFAULT_OG_IMAGE, true);
    setMetaTag("og:locale", "es_CO", true);
    setMetaTag("og:site_name", "SistecPOS", true);

    // Twitter
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage || DEFAULT_OG_IMAGE);

    // Canonical - ALWAYS set to prevent duplicates
    setCanonical(canonicalUrl);
  }, [title, description, canonical, ogImage, noindex, location.pathname]);

  return null;
}

// Backward compatibility alias
export { SEO as DynamicMeta };
