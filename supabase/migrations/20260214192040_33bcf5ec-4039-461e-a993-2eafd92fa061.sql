
-- Add view_count column to training_videos
ALTER TABLE public.training_videos ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create RPC to increment view count (bypasses RLS for authenticated users)
CREATE OR REPLACE FUNCTION public.increment_video_view(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE training_videos SET view_count = view_count + 1 WHERE id = video_id;
END;
$$;
