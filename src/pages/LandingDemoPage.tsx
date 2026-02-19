import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUTMParams } from "@/hooks/useUTMParams";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rocket, Loader2, CheckCircle, Monitor, BarChart3, Receipt, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo/SEO";
import { BUSINESS_TYPES_DEMO, COUNTRIES } from "@/data/demoFormOptions";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
  businessName: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  businessType: z.string().min(1, "Selecciona tipo de negocio"),
  country: z.string().min(1, "Selecciona un país"),
  whatsapp: z.string().trim().regex(/^\d{10}$/, "Ingresa 10 dígitos"),
  email: z.string().trim().email("Correo no válido").max(255),
  city: z.string().trim().min(2, "Ingresa tu ciudad").max(100),
  habeasData: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de datos" }),
  }),
});

type DemoFormValues = z.infer<typeof demoSchema>;

const benefits = [
  { icon: Monitor, text: "Software POS completo para tu negocio" },
  { icon: BarChart3, text: "Reportes en tiempo real desde cualquier lugar" },
  { icon: Receipt, text: "Facturación electrónica DIAN incluida" },
];

export default function LandingDemoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const utm = useUTMParams();
  const { getToken } = useRecaptcha();
  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      businessType: "",
      country: "Colombia",
      whatsapp: "",
      email: "",
      city: "",
      habeasData: undefined,
    },
  });

  async function onSubmit(data: DemoFormValues) {
    setIsSubmitting(true);
    try {
      // Verify reCAPTCHA
      const recaptchaToken = await getToken("demo_request");
      if (!recaptchaToken) {
        toast({ title: "Error de verificación", description: "No se pudo verificar reCAPTCHA. Recarga la página.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const { data: captchaResult } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token: recaptchaToken, action: "demo_request" },
      });

      if (!captchaResult?.success) {
        toast({ title: "Verificación fallida", description: "Parece que eres un bot. Si es un error, recarga la página.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // Save to database
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 30);

      const { error: dbError } = await supabase.from("leads_trials").insert({
        contact_name: data.fullName,
        business_name: data.businessName,
        business_type: data.businessType,
        country: data.country,
        phone: data.whatsapp,
        email: data.email,
        city: data.city,
        source: "landing_campana",
        status: "activation_completed",
        trial_ends_at: trialEnds.toISOString(),
        activation_token: token,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_term: utm.utm_term,
        utm_content: utm.utm_content,
      });

      if (dbError) {
        console.error("DB error:", dbError);
        toast({ title: "Error al registrar", description: "Intenta de nuevo", variant: "destructive" });
        return;
      }

      // Trigger email notification (fire and forget)
      supabase.functions.invoke("notify-new-lead", {
        body: {
          type: "demo",
          name: data.fullName,
          business: data.businessName,
          phone: data.whatsapp,
          email: data.email,
          city: data.city,
          activationToken: token,
        },
      }).catch(console.error);

      toast({
        title: "¡Registro exitoso! 🎉",
        description: "Te contactaremos en menos de 5 minutos por WhatsApp.",
      });

      setTimeout(() => navigate("/gracias"), 1000);
    } catch (err) {
      console.error(err);
      toast({ title: "Error inesperado", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-background to-background">
      <SEO
        title="Prueba Gratis SistecPOS | Software POS Colombia"
        description="Solicita tu demo gratuita de 30 días del software POS más completo de Colombia. Facturación electrónica, inventario y reportes en tiempo real."
      />

      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <img
            src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
            alt="SistecPOS"
            className="h-8"
          />
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            30 días gratis
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-16">
          {/* Left: Value proposition */}
          <div className="space-y-6">
            <div>
              <span className="mb-2 inline-block rounded-full bg-cta/10 px-3 py-1 text-sm font-semibold text-cta">
                Oferta exclusiva
              </span>
              <h1 className="mt-3 text-3xl font-display font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                Tu negocio merece el mejor <span className="text-primary">Software POS</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Prueba SistecPOS gratis por 30 días. Sin compromisos, sin tarjeta de crédito. Facturación electrónica DIAN, inventario y reportes incluidos.
              </p>
            </div>

            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{b.text}</span>
                </li>
              ))}
            </ul>

            {/* Response time promise */}
            <div className="flex items-center gap-2 rounded-lg bg-whatsapp/10 px-4 py-3 text-sm">
              <Zap className="h-4 w-4 text-whatsapp shrink-0" />
              <span className="font-medium text-whatsapp">Te contactamos en menos de 5 minutos por WhatsApp</span>
            </div>
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-foreground">Solicita tu Demo Gratis</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Completa el formulario y te activamos hoy mismo
              </p>
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
                    <FormControl><Input placeholder="Máx. 15 caracteres. Ej: mitiendaexito" maxLength={15} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="businessType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Negocio *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_TYPES_DEMO.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>País *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl><Input placeholder="Ej: Bogotá" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp *</FormLabel>
                    <div className="flex gap-2">
                      <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">+57</div>
                      <FormControl><Input placeholder="3176268307" maxLength={10} inputMode="numeric" {...field} /></FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico *</FormLabel>
                    <FormControl><Input type="email" placeholder="correo@minegocio.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="habeasData" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-muted/50">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-xs text-muted-foreground font-normal cursor-pointer">
                      Acepto la política de tratamiento de datos personales y autorizo recibir información comercial.
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold bg-cta hover:bg-cta/90 text-cta-foreground"
                  size="lg"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Registrando..." : "Solicitar Demo Gratis"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  🔒 Tus datos están protegidos. No compartimos tu información.
                </p>
                <p className="text-center text-[10px] text-muted-foreground/60">
                  Protegido por reCAPTCHA de Google.{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacidad</a>{" · "}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Términos</a>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
