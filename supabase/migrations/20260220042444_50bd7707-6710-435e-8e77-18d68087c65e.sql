
-- ══════════════════════════════════════════════════════════════
-- WhatsApp Notification System: Providers + Templates
-- ══════════════════════════════════════════════════════════════

-- 1. Providers (callmebot, ycloud, etc.)
CREATE TABLE public.whatsapp_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,               -- 'callmebot', 'ycloud'
  display_name TEXT NOT NULL,              -- 'CallMeBot', 'yCloud'
  provider_type TEXT NOT NULL DEFAULT 'callmebot', -- discriminator
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- provider-specific config (api_key, phone, base_url, etc.)
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp providers"
  ON public.whatsapp_providers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Notification Templates
CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL UNIQUE,         -- 'new_demo', 'activation_completed', 'new_reseller', 'ticket_status', 'license_activation'
  event_label TEXT NOT NULL,               -- Human-readable label
  template_text TEXT NOT NULL,             -- Mustache-style: {{name}}, {{business}}, {{phone}}, {{email}}, {{city}}
  emoji TEXT NOT NULL DEFAULT '📱',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp templates"
  ON public.whatsapp_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Notification Log (audit trail)
CREATE TABLE public.whatsapp_notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  recipient_phone TEXT,
  message_sent TEXT,
  status TEXT NOT NULL DEFAULT 'pending',   -- pending, sent, failed
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read notification log"
  ON public.whatsapp_notification_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can insert notification log"
  ON public.whatsapp_notification_log FOR INSERT
  WITH CHECK (true);

-- 4. Seed default provider (CallMeBot from existing secrets)
INSERT INTO public.whatsapp_providers (name, display_name, provider_type, config, is_default)
VALUES ('callmebot', 'CallMeBot', 'callmebot', '{"use_env_secrets": true, "phone_env": "CALLMEBOT_PHONE", "apikey_env": "CALLMEBOT_API_KEY"}'::jsonb, true);

-- 5. Seed default templates matching current notify-new-lead behavior
INSERT INTO public.whatsapp_templates (event_type, event_label, template_text, emoji, sort_order) VALUES
('new_demo', 'Nuevo Lead Demo', '🟢 *Nuevo Lead Demo*

👤 *Nombre:* {{name}}
🏪 *Negocio:* {{business}}
📱 *WhatsApp:* {{phone}}
📧 *Email:* {{email}}
📍 *Ciudad:* {{city}}

⚡ Ver detalles en el panel admin.', '🟢', 1),

('activation_completed', 'Activación Completada', '🟠 *Activación Completada — Listo para credenciales*

👤 *Nombre:* {{name}}
🏪 *Negocio:* {{business}}
📱 *WhatsApp:* {{phone}}
📧 *Email:* {{email}}
📍 *Ciudad:* {{city}}
🎯 *Urgencia:* {{urgency}}

🔐 Crear credenciales POS desde el panel admin.', '🟠', 2),

('new_reseller', 'Nuevo Prospecto Representante', '🔵 *Nuevo Prospecto Representante*

👤 *Nombre:* {{name}}
📱 *WhatsApp:* {{phone}}
📧 *Email:* {{email}}
📍 *Ciudad:* {{city}}

📋 Revisar perfil en el panel admin.', '🔵', 3),

('ticket_status_change', 'Cambio Estado Ticket', '🎫 *Ticket Actualizado*

👤 *Cliente:* {{name}}
📋 *Asunto:* {{subject}}
🔄 *Estado:* {{status}}

Ver detalles en el panel admin.', '🎫', 4),

('license_activation', 'Activación de Licencia', '🔑 *Solicitud Activación Licencia*

👤 *Cliente:* {{name}}
🏪 *Negocio:* {{business}}
📦 *Plan:* {{plan}}

Revisar en el panel admin.', '🔑', 5);

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_providers_updated_at
  BEFORE UPDATE ON public.whatsapp_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
