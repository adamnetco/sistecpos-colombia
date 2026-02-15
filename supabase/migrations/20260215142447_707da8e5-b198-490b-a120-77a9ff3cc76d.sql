
-- Add visibility and approval columns to training_videos
ALTER TABLE public.training_videos 
  ADD COLUMN IF NOT EXISTS visible_to_customer boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visible_to_reseller boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved';

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_training_videos_approval ON public.training_videos(approval_status);
