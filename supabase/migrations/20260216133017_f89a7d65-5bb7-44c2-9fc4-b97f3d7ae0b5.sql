-- 1. Fix: add 'activation_completed' to allowed statuses
ALTER TABLE public.leads_trials DROP CONSTRAINT IF EXISTS leads_trials_status_check;
ALTER TABLE public.leads_trials ADD CONSTRAINT leads_trials_status_check
  CHECK (status = ANY (ARRAY['new','contacted','active_trial','activation_completed','converted','lost']));

-- 2. Add support and sales WhatsApp numbers to site_settings
INSERT INTO public.site_settings (setting_group, setting_key, setting_value)
VALUES
  ('whatsapp', 'support_number', '"573176268307"'),
  ('whatsapp', 'sales_number', '"573176268307"'),
  ('whatsapp', 'support_message', '"Hola, necesito soporte técnico de SistecPOS"'),
  ('whatsapp', 'sales_message', '"Hola, quiero información comercial sobre SistecPOS"')
ON CONFLICT DO NOTHING;