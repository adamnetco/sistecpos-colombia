import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TrainingVideoRow {
  id: string;
  title: string;
  category: string;
  video_url: string;
  video_type: string;
  duration: string | null;
  is_main: boolean;
  is_active: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type TrainingVideoInsert = Omit<TrainingVideoRow, "id" | "created_at" | "updated_at" | "view_count">;

export function useTrainingVideos() {
  return useQuery({
    queryKey: ["training-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_videos")
        .select("*")
        .order("is_main", { ascending: false })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as TrainingVideoRow[];
    },
  });
}

export function useTrainingVideosMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["training-videos"] });

  const create = useMutation({
    mutationFn: async (video: TrainingVideoInsert) => {
      const { error } = await supabase.from("training_videos").insert(video);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Video creado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TrainingVideoRow> & { id: string }) => {
      const { error } = await supabase.from("training_videos").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Video actualizado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("training_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Video eliminado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { create, update, remove };
}

export function useIncrementVideoView() {
  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase.rpc("increment_video_view", { video_id: videoId });
      if (error) throw error;
    },
  });
}
