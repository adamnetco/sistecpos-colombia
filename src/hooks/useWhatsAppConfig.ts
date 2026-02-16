import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const WHATSAPP_DEFAULT_NUMBER = "573176268307";
export const WHATSAPP_DEFAULT_MESSAGE = "Hola, quiero información sobre SistecPOS";

/**
 * Build a WhatsApp URL from a number and optional message.
 * Works without hooks — can be used anywhere.
 */
export function buildWhatsAppUrl(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Format a WhatsApp number to display format (+57 317 626 8307).
 */
export function formatWhatsAppPhone(number: string) {
  // Expects format like "573176268307"
  if (number.length >= 12) {
    const country = number.slice(0, 2);
    const area = number.slice(2, 5);
    const p1 = number.slice(5, 8);
    const p2 = number.slice(8);
    return `+${country} ${area} ${p1} ${p2}`;
  }
  return `+${number}`;
}

/**
 * Format for tel: links (+573176268307).
 */
export function telUrl(number: string) {
  return `tel:+${number}`;
}

interface WhatsAppConfig {
  number: string;
  message: string;
  isEnabled: boolean;
  /** Build a wa.me URL with a custom message (or the default). */
  buildUrl: (customMessage?: string) => string;
  /** Display-friendly phone string. */
  displayPhone: string;
  /** tel: link */
  telHref: string;
  /** Support WhatsApp */
  support: { number: string; message: string; buildUrl: (msg?: string) => string; displayPhone: string; telHref: string };
  /** Sales WhatsApp */
  sales: { number: string; message: string; buildUrl: (msg?: string) => string; displayPhone: string; telHref: string };
}

/**
 * Central hook – reads WhatsApp config from site_settings (admin panel).
 * Falls back to defaults while loading or on error.
 */
export function useWhatsAppConfig(): WhatsAppConfig {
  const { data: settings = [] } = useQuery({
    queryKey: ["site_settings", "whatsapp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .eq("setting_group", "whatsapp");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
    gcTime: 30 * 60 * 1000,
  });

  const get = (key: string, fallback: string) => {
    const s = settings.find((s) => s.setting_key === key);
    if (!s) return fallback;
    const v = s.setting_value;
    if (typeof v === "string") return v.replace(/^"|"$/g, "");
    return String(v);
  };

  const number = get("main_number", WHATSAPP_DEFAULT_NUMBER);
  const message = get("welcome_message", WHATSAPP_DEFAULT_MESSAGE);
  const isEnabled = get("is_enabled", "true") === "true";

  const supportNumber = get("support_number", number);
  const supportMessage = get("support_message", "Hola, necesito soporte técnico de SistecPOS");
  const salesNumber = get("sales_number", number);
  const salesMessage = get("sales_message", "Hola, quiero información comercial sobre SistecPOS");

  return {
    number,
    message,
    isEnabled,
    buildUrl: (customMessage?: string) =>
      buildWhatsAppUrl(number, customMessage ?? message),
    displayPhone: formatWhatsAppPhone(number),
    telHref: telUrl(number),
    support: {
      number: supportNumber,
      message: supportMessage,
      buildUrl: (msg?: string) => buildWhatsAppUrl(supportNumber, msg ?? supportMessage),
      displayPhone: formatWhatsAppPhone(supportNumber),
      telHref: telUrl(supportNumber),
    },
    sales: {
      number: salesNumber,
      message: salesMessage,
      buildUrl: (msg?: string) => buildWhatsAppUrl(salesNumber, msg ?? salesMessage),
      displayPhone: formatWhatsAppPhone(salesNumber),
      telHref: telUrl(salesNumber),
    },
  };
}
