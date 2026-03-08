export interface FlowNode {
  id: string;
  type: "trigger" | "email" | "whatsapp" | "delay" | "condition" | "action";
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface NotificationFlow {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  is_active: boolean;
  last_run_at: string | null;
  run_count: number;
  created_at: string;
  updated_at: string;
}

export const NODE_TYPES: Record<string, { label: string; iconName: string; color: string; bg: string; border: string }> = {
  trigger:   { label: "Disparador",     iconName: "Zap",           color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-300 dark:border-amber-700" },
  email:     { label: "Enviar Email",    iconName: "Mail",          color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-300 dark:border-blue-700" },
  whatsapp:  { label: "Enviar WhatsApp", iconName: "MessageCircle", color: "text-green-600",   bg: "bg-green-50 dark:bg-green-950/30",     border: "border-green-300 dark:border-green-700" },
  delay:     { label: "Esperar",         iconName: "Clock",         color: "text-purple-600",  bg: "bg-purple-50 dark:bg-purple-950/30",   border: "border-purple-300 dark:border-purple-700" },
  condition: { label: "Condición",       iconName: "GitBranch",     color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-300 dark:border-orange-700" },
  action:    { label: "Acción",          iconName: "Settings2",     color: "text-gray-600",    bg: "bg-gray-50 dark:bg-gray-950/30",       border: "border-gray-300 dark:border-gray-700" },
};

export const TRIGGER_EVENTS = [
  { value: "new_lead",           label: "Nuevo lead/demo",              icon: "UserPlus" },
  { value: "new_user_signup",    label: "Nuevo registro de usuario",    icon: "UserCheck" },
  { value: "role_assigned",      label: "Rol asignado",                 icon: "Shield" },
  { value: "license_activated",  label: "Licencia activada",            icon: "Key" },
  { value: "license_expiring",   label: "Licencia por vencer",          icon: "AlertTriangle" },
  { value: "ticket_created",     label: "Ticket creado",                icon: "Ticket" },
  { value: "ticket_resolved",    label: "Ticket resuelto",              icon: "CheckCircle" },
  { value: "payment_confirmed",  label: "Pago confirmado",              icon: "CreditCard" },
  { value: "reseller_approved",  label: "Socio aprobado",               icon: "Handshake" },
  { value: "certificate_order",  label: "Orden de certificado",         icon: "FileCheck" },
  { value: "demo_processing",    label: "Demo en procesamiento",        icon: "Loader" },
  { value: "demo_credentials",   label: "Credenciales de demo",         icon: "KeyRound" },
  { value: "ticket_escalated",   label: "Ticket escalado N2",           icon: "ArrowUpCircle" },
  { value: "ticket_responded",   label: "Ticket respondido",            icon: "MessageSquare" },
  { value: "custom",             label: "Evento personalizado",         icon: "Sparkles" },
];
