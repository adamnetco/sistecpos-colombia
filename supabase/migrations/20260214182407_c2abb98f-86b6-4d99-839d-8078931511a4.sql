
-- Create training_videos table
CREATE TABLE public.training_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Básicos',
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'youtube',
  duration TEXT,
  is_main BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage training videos"
ON public.training_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can read active videos
CREATE POLICY "Authenticated users can read active training videos"
ON public.training_videos
FOR SELECT
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_training_videos_updated_at
BEFORE UPDATE ON public.training_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
