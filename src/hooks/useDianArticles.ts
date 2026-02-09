import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dianArticles, type DianArticle } from "@/data/dianArticles";
import {
  AlertTriangle, Calendar, Clock, FileCheck, FileText, Gavel,
  HelpCircle, Key, LogIn, Globe, Receipt, RefreshCw, Shield, ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// Map icon name strings from DB to actual Lucide components
const iconMap: Record<string, LucideIcon> = {
  AlertTriangle, Calendar, Clock, FileCheck, FileText, Gavel,
  HelpCircle, Key, LogIn, Globe, Receipt, RefreshCw, Shield, ShieldCheck,
};

interface DbDianArticle {
  id: string;
  slug: string;
  keyword: string;
  meta_title: string;
  meta_description: string;
  hero_icon: string;
  hero_badge: string;
  h1: string;
  hero_subtitle: string;
  sections: unknown;
  pain_vs_solution: unknown;
  cta_text: string;
  cta_whatsapp_message: string;
  faqs: unknown;
  related_links: unknown;
  is_published: boolean;
  sort_order: number;
}

function dbToArticle(row: DbDianArticle): DianArticle {
  return {
    slug: row.slug,
    keyword: row.keyword,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    heroIcon: iconMap[row.hero_icon] || FileText,
    heroBadge: row.hero_badge,
    h1: row.h1,
    heroSubtitle: row.hero_subtitle,
    sections: (row.sections as DianArticle["sections"]) || [],
    painVsSolution: (row.pain_vs_solution as DianArticle["painVsSolution"]) || [],
    ctaText: row.cta_text,
    ctaWhatsappMessage: row.cta_whatsapp_message,
    faqs: (row.faqs as DianArticle["faqs"]) || [],
    relatedLinks: (row.related_links as DianArticle["relatedLinks"]) || [],
  };
}

/** Fetches published DB articles and merges with static ones. DB takes priority on slug conflicts. */
export function useDianArticles() {
  const query = useQuery({
    queryKey: ["dian-articles-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dian_articles")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as DbDianArticle[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const dbArticles = (query.data || []).map(dbToArticle);
  const dbSlugs = new Set(dbArticles.map((a) => a.slug));

  // Static articles that are NOT overridden by DB
  const staticOnly = dianArticles.filter((a) => !dbSlugs.has(a.slug));

  // Final merged list: DB articles first, then remaining static
  const allArticles = [...dbArticles, ...staticOnly];

  return {
    allArticles,
    dbArticles,
    staticArticles: dianArticles,
    isLoading: query.isLoading,
    /** Find a single article by slug: DB first, then static fallback */
    findBySlug: (slug: string) =>
      dbArticles.find((a) => a.slug === slug) ||
      dianArticles.find((a) => a.slug === slug),
  };
}

/** Fetch a single article by slug — DB first, static fallback */
export function useDianArticle(slug: string | undefined) {
  const query = useQuery({
    queryKey: ["dian-article", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("dian_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as DbDianArticle | null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const dbArticle = query.data ? dbToArticle(query.data) : null;
  const staticArticle = dianArticles.find((a) => a.slug === slug);

  return {
    article: dbArticle || staticArticle || null,
    isFromDb: !!dbArticle,
    isLoading: query.isLoading,
  };
}
