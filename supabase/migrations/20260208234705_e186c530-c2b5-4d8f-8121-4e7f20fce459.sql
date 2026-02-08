
-- Create contacts table for unified CRM
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Core info
  full_name text NOT NULL,
  email text,
  phone text,
  city text,
  business_name text,
  business_type text,
  -- CRM fields
  contact_type text NOT NULL DEFAULT 'prospect', -- prospect, active_client, former_client, partner
  source text NOT NULL DEFAULT 'website', -- website, whatsapp, chatbot_ai, referral, social_media, landing, manual
  is_read boolean NOT NULL DEFAULT false,
  captured_by_ai boolean NOT NULL DEFAULT false,
  -- Relationship to existing data
  lead_id uuid REFERENCES public.leads_trials(id) ON DELETE SET NULL,
  license_id uuid REFERENCES public.licenses(id) ON DELETE SET NULL,
  reseller_id uuid REFERENCES public.reseller_applications(id) ON DELETE SET NULL,
  -- Notes & metadata
  notes text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage contacts"
  ON public.contacts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for filtering
CREATE INDEX idx_contacts_source ON public.contacts(source);
CREATE INDEX idx_contacts_contact_type ON public.contacts(contact_type);
CREATE INDEX idx_contacts_is_read ON public.contacts(is_read);
CREATE INDEX idx_contacts_captured_by_ai ON public.contacts(captured_by_ai);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);
