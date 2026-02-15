import { ReactNode } from "react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

interface WhatsAppLinkProps {
  message?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Renders an <a> tag pointing to wa.me with the dynamic WhatsApp number.
 * Accepts an optional custom message; falls back to the admin-configured default.
 * Automatically opens in a new tab with security attrs.
 *
 * Usage:
 *   <WhatsAppLink message="Hola, quiero cotizar">
 *     <Button>Cotizar</Button>
 *   </WhatsAppLink>
 *
 * Or wrap Button with asChild:
 *   <Button asChild><WhatsAppLink message="Hola">Cotizar</WhatsAppLink></Button>
 */
export function WhatsAppLink({ message, children, className }: WhatsAppLinkProps) {
  const { buildUrl } = useWhatsAppConfig();

  return (
    <a
      href={buildUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
