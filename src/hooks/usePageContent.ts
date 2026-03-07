import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageContentBlock {
  id: string;
  page_path: string;
  section_key: string;
  content_type: "text" | "markdown" | "image" | "html" | "json";
  text_value: string | null;
  image_url: string | null;
  image_alt: string | null;
  json_value: any;
  sort_order: number;
  is_active: boolean;
  visible_on: "all" | "desktop" | "mobile" | "hidden";
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Public hook: fetches all active content blocks for a given page_path */
export function usePageContent(pagePath: string) {
  return useQuery({
    queryKey: ["page_content", pagePath],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_path", pagePath)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as PageContentBlock[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/** Helper: get a single content value by section_key, with fallback */
export function getContent(
  blocks: PageContentBlock[] | undefined,
  sectionKey: string,
  fallback: string = ""
): string {
  if (!blocks) return fallback;
  const block = blocks.find((b) => b.section_key === sectionKey);
  if (!block) return fallback;
  return block.text_value || fallback;
}

/** Helper: get image URL by section_key */
export function getImageContent(
  blocks: PageContentBlock[] | undefined,
  sectionKey: string,
  fallbackUrl: string = ""
): { url: string; alt: string } {
  if (!blocks) return { url: fallbackUrl, alt: "" };
  const block = blocks.find((b) => b.section_key === sectionKey);
  if (!block) return { url: fallbackUrl, alt: "" };
  return { url: block.image_url || fallbackUrl, alt: block.image_alt || "" };
}

/** Helper: get JSON value */
export function getJsonContent<T = any>(
  blocks: PageContentBlock[] | undefined,
  sectionKey: string,
  fallback: T
): T {
  if (!blocks) return fallback;
  const block = blocks.find((b) => b.section_key === sectionKey);
  if (!block || !block.json_value) return fallback;
  return block.json_value as T;
}

/* ─── Admin mutations ─── */

export function useUpsertPageContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (block: Partial<PageContentBlock> & { page_path: string; section_key: string }) => {
      const { data, error } = await supabase
        .from("page_content")
        .upsert(
          {
            page_path: block.page_path,
            section_key: block.section_key,
            content_type: block.content_type || "text",
            text_value: block.text_value ?? null,
            image_url: block.image_url ?? null,
            image_alt: block.image_alt ?? null,
            json_value: block.json_value ?? null,
            sort_order: block.sort_order ?? 0,
            is_active: block.is_active ?? true,
          } as any,
          { onConflict: "page_path,section_key" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["page_content", data.page_path] });
      qc.invalidateQueries({ queryKey: ["admin_page_content"] });
    },
  });
}

export function useDeletePageContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_page_content"] });
    },
  });
}

/** Admin hook: fetch all content blocks (all pages) */
export function useAllPageContent() {
  return useQuery({
    queryKey: ["admin_page_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("page_path")
        .order("sort_order");
      if (error) throw error;
      return data as PageContentBlock[];
    },
  });
}
