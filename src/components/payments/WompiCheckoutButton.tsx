import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WompiCheckoutProps {
  amountCents: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  certificateOrderId?: string;
  cartItems?: Array<{ product_name: string; quantity: number; price_cop: number }>;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: Record<string, unknown>) => {
      open: (cb: (result: { transaction?: { reference?: string } }) => void) => void;
    };
  }
}

// Load Wompi widget script once
let scriptLoaded = false;
function loadWompiScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="checkout.wompi.co"]');
    if (existing) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Wompi widget"));
    document.head.appendChild(script);
  });
}

export function WompiCheckoutButton({
  amountCents,
  customerEmail,
  customerName,
  customerPhone,
  certificateOrderId,
  cartItems,
  onSuccess,
  onError,
  className,
  disabled,
  children,
}: WompiCheckoutProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWompiScript().catch((err) => console.error("Wompi script load error:", err));
  }, []);

  const handleClick = useCallback(async () => {
    setLoading(true);

    try {
      // Get the current origin for redirect
      const redirectUrl = `${window.location.origin}/pago/resultado`;

      const { data, error } = await supabase.functions.invoke("wompi-checkout", {
        body: {
          amount_cents: amountCents,
          customer_email: customerEmail,
          customer_name: customerName,
          customer_phone: customerPhone,
          certificate_order_id: certificateOrderId,
          cart_items: cartItems,
          redirect_url: redirectUrl,
        },
      });

      if (error || !data?.reference) {
        throw new Error(error?.message || "Error al iniciar el pago");
      }

      await loadWompiScript();

      if (!window.WidgetCheckout) {
        throw new Error("Widget de Wompi no disponible");
      }

      const checkout = new window.WidgetCheckout({
        currency: data.currency,
        amountInCents: data.amount_cents,
        reference: data.reference,
        publicKey: data.public_key,
        redirectUrl: redirectUrl,
        "signature:integrity": data.signature,
      });

      checkout.open((result) => {
        const ref = result?.transaction?.reference;
        if (ref) {
          onSuccess?.(ref);
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al procesar el pago";
      console.error("Wompi checkout error:", err);
      toast.error(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [amountCents, customerEmail, customerName, customerPhone, certificateOrderId, cartItems, onSuccess, onError]);

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Procesando...
        </>
      ) : (
        children || (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pagar en línea
          </>
        )
      )}
    </Button>
  );
}
