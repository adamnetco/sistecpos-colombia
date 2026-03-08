INSERT INTO whatsapp_templates (event_type, event_label, template_text, emoji, is_active, sort_order, notes)
VALUES (
  'new_user_signup',
  'Nuevo Registro de Usuario',
  '🆕 *Nuevo registro en SistecPOS*

👤 Nombre: {{full_name}}
📧 Email: {{email}}
🏷️ Rol solicitado: {{requested_role}}
📅 Fecha: {{date}}

⚠️ El usuario está pendiente de asignación de rol. Ingresa al panel admin para gestionar.',
  '🆕',
  true,
  10,
  'Se dispara cuando un nuevo usuario se registra en la plataforma'
) ON CONFLICT DO NOTHING;