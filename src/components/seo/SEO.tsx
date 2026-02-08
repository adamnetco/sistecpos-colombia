import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
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

function setCanonical(href: string | undefined) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function SEO({ title, description, canonical, ogImage }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Basic meta
    setMetaTag("description", description);

    // Open Graph
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", "website", true);
    if (canonical) setMetaTag("og:url", canonical, true);
    if (ogImage) setMetaTag("og:image", ogImage, true);

    // Twitter
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (ogImage) setMetaTag("twitter:image", ogImage);

    // Canonical
    setCanonical(canonical);
  }, [title, description, canonical, ogImage]);

  return null;
}

// Backward compatibility alias
export { SEO as DynamicMeta };
