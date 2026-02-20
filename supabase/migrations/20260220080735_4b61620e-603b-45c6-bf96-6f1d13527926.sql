-- Add provider_name column to whatsapp_templates so each template can route to a specific provider
ALTER TABLE public.whatsapp_templates
  ADD COLUMN IF NOT EXISTS provider_name text NULL;

-- Set license_activation_request → commercial provider (default)
UPDATE public.whatsapp_templates
  SET provider_name = 'callmebot'
  WHERE event_type = 'license_activation_request';

-- Set ticket_escalated → support provider (we'll insert below)
UPDATE public.whatsapp_templates
  SET provider_name = 'callmebot_soporte'
  WHERE event_type = 'ticket_escalated';

-- Insert the second provider "Soporte del Proveedor"
INSERT INTO public.whatsapp_providers (name, display_name, provider_type, config, is_active, is_default, notes)
VALUES (
  'callmebot_soporte',
  'Soporte del Proveedor',
  'callmebot',
  jsonb_build_object(
    'use_env_secrets', true,
    'phone_env', 'CALLMEBOT_PHONE',
    'apikey_env', 'CALLMEBOT_API_KEY'
  ),
  true,
  false,
  'Línea de soporte técnico de 2° nivel. Por ahora apunta al mismo número CallMeBot; cambiar credenciales aquí cuando cambie de plan.'
)
ON CONFLICT DO NOTHING;