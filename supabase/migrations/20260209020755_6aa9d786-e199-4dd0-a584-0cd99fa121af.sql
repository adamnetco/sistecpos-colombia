
-- Table to track product events (views, cart adds, quotes)
CREATE TABLE public.product_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'view', 'cart_add', 'quote_sent'
  product_id UUID REFERENCES public.catalog_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

-- Public can insert events (anonymous tracking)
CREATE POLICY "Anyone can insert product events"
  ON public.product_events FOR INSERT
  WITH CHECK (true);

-- Only admins can read events
CREATE POLICY "Admins can read product events"
  ON public.product_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for analytics queries
CREATE INDEX idx_product_events_type ON public.product_events(event_type);
CREATE INDEX idx_product_events_created ON public.product_events(created_at DESC);
CREATE INDEX idx_product_events_product ON public.product_events(product_id);
