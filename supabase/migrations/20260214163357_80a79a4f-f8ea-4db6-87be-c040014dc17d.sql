
-- Table for admin-managed download links (installers, tools, etc.)
CREATE TABLE public.client_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  download_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'installer',
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'Download',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_downloads ENABLE ROW LEVEL SECURITY;

-- Public read for active downloads
CREATE POLICY "Anyone can view active downloads"
  ON public.client_downloads FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage downloads"
  ON public.client_downloads FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Client tickets table (separate from reseller_tickets)
CREATE TABLE public.client_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_tickets ENABLE ROW LEVEL SECURITY;

-- Clients can view/create their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.client_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
  ON public.client_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all tickets
CREATE POLICY "Admins manage all client tickets"
  ON public.client_tickets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to read published trainings (shared with resellers)
CREATE POLICY "Authenticated users can view published trainings"
  ON public.reseller_trainings FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Triggers for updated_at
CREATE TRIGGER update_client_downloads_updated_at
  BEFORE UPDATE ON public.client_downloads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_tickets_updated_at
  BEFORE UPDATE ON public.client_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
