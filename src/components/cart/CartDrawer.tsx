import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, CreditCard, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { WompiCheckoutButton } from "@/components/payments/WompiCheckoutButton";

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

interface ContactForm {
  name: string;
  phone: string;
  email: string;
}

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalCOP, itemCount, getWhatsAppUrl } = useCart();
  const [sending, setSending] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({ name: "", phone: "", email: "" });
  const [formErrors, setFormErrors] = useState<Partial<ContactForm>>({});

  const validateForm = (): boolean => {
    const errors: Partial<ContactForm> = {};
    const trimmedName = contactForm.name.trim();
    const trimmedPhone = contactForm.phone.trim().replace(/\D/g, "");

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = "Ingresa tu nombre";
    }
    if (!trimmedPhone || trimmedPhone.length < 10) {
      errors.phone = "Ingresa un WhatsApp válido (10 dígitos)";
    }
    if (contactForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      errors.email = "Email no válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuoteClick = () => {
    setShowContactForm(true);
    setFormErrors({});
  };

  const handleSendQuote = async () => {
    if (!validateForm()) return;

    setSending(true);
    try {
      const sessionId = sessionStorage.getItem("sp_session_id") || undefined;
      const phone = contactForm.phone.trim().replace(/\D/g, "");
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
          visitor_name: contactForm.name.trim(),
          visitor_phone: phone,
          visitor_email: contactForm.email.trim() || undefined,
        },
      });
    } catch (e) {
      console.error("Quote registration error:", e);
    }
    setSending(false);

    window.open(getWhatsAppUrl(), "_blank");
    toast.success("Cotización enviada. ¡Te contactaremos pronto!");
    setShowContactForm(false);
    setContactForm({ name: "", phone: "", email: "" });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full shadow-lg border-2 bg-card hover:bg-primary hover:text-primary-foreground transition-all no-print print:hidden"
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

              <AnimatePresence mode="wait">
                {showContactForm ? (
                  <motion.div
                    key="contact-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                      <p className="text-xs font-medium text-foreground">Completa tus datos para cotizar:</p>
                      <div className="space-y-1">
                        <Label htmlFor="quote-name" className="text-xs">Nombre *</Label>
                        <Input
                          id="quote-name"
                          placeholder="Tu nombre completo"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                          className="h-8 text-sm"
                          maxLength={100}
                        />
                        {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="quote-phone" className="text-xs">WhatsApp *</Label>
                        <Input
                          id="quote-phone"
                          placeholder="3001234567"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(f => ({ ...f, phone: e.target.value }))}
                          className="h-8 text-sm"
                          maxLength={15}
                          inputMode="tel"
                        />
                        {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="quote-email" className="text-xs">Email (opcional)</Label>
                        <Input
                          id="quote-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                          className="h-8 text-sm"
                          maxLength={255}
                        />
                        {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowContactForm(false)}
                        className="flex-shrink-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={handleSendQuote}
                        disabled={sending}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {sending ? "Enviando..." : "Enviar cotización"}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="quote-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleQuoteClick}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Cotizar por WhatsApp
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

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
