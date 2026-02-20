import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rocket, Loader2, Zap, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const demoSchema = z.object({
  fullName: z.string().trim().min(3, "Mínimo 3 caracteres").max(100),
  businessName: z.string().trim().min(2, "Mínimo 2 caracteres").max(30),
  whatsapp: z.string().trim().regex(/^\d{10}$/, "Ingresa 10 dígitos (ej: 3176268307)"),
  email: z.string().trim().email("Correo no válido").max(255),
  habeasData: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de datos" }),
  }),
});

type DemoFormValues = z.infer<typeof demoSchema>;

export function DemoRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { buildUrl } = useWhatsAppConfig();

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      whatsapp: "",
      email: "",
      habeasData: undefined,
    },
  });

  async function onSubmit(data: DemoFormValues) {
    setIsSubmitting(true);
    try {
      // Persist lead to database
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 30);

      const { error: dbError } = await supabase.from("leads_trials").insert({
        contact_name: data.fullName,
        business_name: data.businessName,
        phone: data.whatsapp,
        email: data.email,
        source: "formulario_web",
        status: "activation_completed",
        trial_ends_at: trialEnds.toISOString(),
      });

      if (dbError) {
        console.error("DB error:", dbError);
      }

      // Fire notification (fire and forget)
      supabase.functions.invoke("notify-new-lead", {
        body: {
          type: "demo",
          name: data.fullName,
          business: data.businessName,
          phone: data.whatsapp,
          email: data.email,
        },
      }).catch(console.error);

      // Open WhatsApp
      const waMsg = `Hola SistecPOS, quiero solicitar una demo gratis.\n\n👤 Nombre: ${data.fullName}\n🏪 Negocio: ${data.businessName}\n📱 WhatsApp: ${data.whatsapp}\n📧 Correo: ${data.email}`;
      window.open(buildUrl(waMsg), "_blank", "noopener,noreferrer");

      toast({
        title: "¡Solicitud enviada! 🎉",
        description: "Te contactaremos en menos de 5 minutos por WhatsApp.",
      });

      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/gracias?from=demo");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast({ title: "Error inesperado", variant: "destructive" });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-card">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-foreground">
          Solicitar Demo Gratis
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Completa el formulario y te contactamos en minutos
        </p>
      </div>

      {/* Response time promise */}
      <div className="mb-5 flex items-center justify-center gap-2 rounded-lg bg-whatsapp/10 px-4 py-2.5 text-sm">
        <Zap className="h-4 w-4 text-whatsapp" />
        <span className="font-medium text-whatsapp">Respuesta en menos de 5 minutos por WhatsApp</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo *</FormLabel>
              <FormControl><Input placeholder="Ej: Carlos Martínez" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="businessName" render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Negocio *</FormLabel>
              <FormControl><Input placeholder="Ej: Droguería San Ángel" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="whatsapp" render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp *</FormLabel>
              <FormControl>
                <Input placeholder="3176268307" maxLength={10} inputMode="numeric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Corporativo *</FormLabel>
              <FormControl><Input type="email" placeholder="correo@minegocio.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="habeasData" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-xs text-muted-foreground font-normal cursor-pointer">
                  Acepto la política de tratamiento de datos personales (Habeas Data) y autorizo recibir información comercial vía WhatsApp.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )} />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold bg-cta hover:bg-cta/90 text-cta-foreground"
            size="lg"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-5 w-5" />
            )}
            {isSubmitting ? "Enviando..." : "Solicitar Acceso Inmediato"}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Demo 30 días</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />Soporte humano</span>
            <span>•</span>
            <span>🔒 Datos protegidos</span>
          </div>
        </form>
      </Form>
    </div>
  );
}
