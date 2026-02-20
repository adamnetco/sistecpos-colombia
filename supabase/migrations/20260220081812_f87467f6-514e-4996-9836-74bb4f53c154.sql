-- Add target_audience to support_subscriptions
ALTER TABLE public.support_subscriptions 
ADD COLUMN IF NOT EXISTS target_audience text NOT NULL DEFAULT 'both' 
CHECK (target_audience IN ('client', 'reseller', 'both'));

COMMENT ON COLUMN public.support_subscriptions.target_audience IS 'Who can see this plan: client, reseller, or both';
