import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SupportArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  cover_image_url: string | null;
  video_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  sort_order: number;
  view_count: number;
  author_name: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type SupportArticleInsert = Omit<SupportArticleRow, "id" | "created_at" | "updated_at" | "view_count">;

export function useSupportArticles(publishedOnly = false) {
  return useQuery({
    queryKey: ["support-articles", publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from("support_articles")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("sort_order", { ascending: true });

      if (publishedOnly) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupportArticleRow[];
    },
  });
}

export function useSupportArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ["support-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as SupportArticleRow | null;
    },
    enabled: !!slug,
  });
}

export function useSupportArticlesMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["support-articles"] });

  const create = useMutation({
    mutationFn: async (article: Partial<SupportArticleInsert> & { title: string; slug: string }) => {
      const { error } = await supabase.from("support_articles").insert(article as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Artículo creado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SupportArticleRow> & { id: string }) => {
      const { error } = await supabase.from("support_articles").update(data as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Artículo actualizado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("support_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Artículo eliminado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { create, update, remove };
}

export function useIncrementArticleView() {
  return useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase.rpc("increment_article_view", { article_id: articleId });
      if (error) throw error;
    },
  });
}
