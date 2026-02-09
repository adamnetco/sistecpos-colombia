import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { WompiCheckoutButton } from "@/components/payments/WompiCheckoutButton";

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalCOP, itemCount, getWhatsAppUrl } = useCart();
  const [sending, setSending] = useState(false);

  const handleSendQuote = async () => {
    setSending(true);
    try {
      const sessionId = sessionStorage.getItem("sp_session_id") || undefined;
      await supabase.functions.invoke("register-quote", {
        body: {
          items: items.map(i => ({
            product_id: i.id,
            product_name: i.name,
            quantity: i.quantity,
            price_cop: i.price_cop,
          })),
          total_cop: totalCOP,
          session_id: sessionId,
        },
      });
    } catch (e) {
      console.error("Quote registration error:", e);
    }
    setSending(false);

    // Open WhatsApp
    window.open(getWhatsAppUrl(), "_blank");
    toast.success("Cotización enviada. ¡Te contactaremos pronto!");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full shadow-lg border-2 bg-card hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cotización ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Tu cotización está vacía</p>
              <p className="text-xs mt-1">Agrega productos desde el catálogo</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 p-3 rounded-lg border bg-card"
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 object-contain rounded-md bg-muted/30 p-1" />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-sm text-primary font-semibold">{formatCOP(item.price_cop)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal estimado</span>
                <span className="text-lg font-bold text-primary">{formatCOP(totalCOP)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                * Precio final sujeto a confirmación. Incluye instalación y configuración.
              </p>
              <WompiCheckoutButton
                amountCents={totalCOP * 100}
                cartItems={items.map(i => ({
                  product_name: i.name,
                  quantity: i.quantity,
                  price_cop: i.price_cop,
                }))}
                onSuccess={() => {
                  clearCart();
                  toast.success("¡Pago iniciado! Te redirigiremos al resultado.");
                }}
                className="w-full gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Pagar en línea
              </WompiCheckoutButton>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={handleSendQuote}
                disabled={sending}
              >
                <MessageCircle className="h-5 w-5" />
                {sending ? "Registrando..." : "Cotizar por WhatsApp"}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearCart} className="w-full text-muted-foreground">
                Vaciar cotización
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
