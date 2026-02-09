import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUTMParams } from "@/hooks/useUTMParams";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, DollarSign, HeadphonesIcon, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo/SEO";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const repSchema = z.object({
  fullName: z.string().trim().min(3, "Mínimo 3 caracteres").max(100),
  email: z.string().trim().email("Correo no válido").max(255),
  phone: z.string().trim().regex(/^\d{10}$/, "Ingresa 10 dígitos"),
  city: z.string().min(1, "Selecciona tu ciudad"),
  experience: z.string().min(1, "Selecciona tu experiencia"),
  motivation: z.string().trim().min(10, "Mínimo 10 caracteres").max(500),
  habeasData: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de datos" }),
  }),
});

type RepFormValues = z.infer<typeof repSchema>;

const cityOptions = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
  "Santa Marta", "Cúcuta", "Pereira", "Manizales", "Ibagué",
  "Neiva", "Villavicencio", "Pasto", "Armenia", "Montería",
  "Bucaramanga", "Tunja", "Popayán", "Valledupar", "Sincelejo",
  "Otra ciudad",
];

const benefits = [
  { icon: DollarSign, title: "Comisiones atractivas", desc: "Gana por cada licencia vendida, sin inversión inicial." },
  { icon: HeadphonesIcon, title: "Soporte 24/7 incluido", desc: "Nosotros instalamos, configuramos y damos soporte técnico." },
  { icon: TrendingUp, title: "Ingresos recurrentes", desc: "Cobra comisiones en renovaciones mensuales y anuales." },
];

export default function LandingRepresentantesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const utm = useUTMParams();

  const form = useForm<RepFormValues>({
    resolver: zodResolver(repSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      experience: "",
      motivation: "",
      habeasData: undefined,
    },
  });

  async function onSubmit(data: RepFormValues) {
    setIsSubmitting(true);
    try {
      const experienceMap: Record<string, string> = {
        none: "Sin experiencia comercial",
        "1": "Menos de 1 año",
        "1-3": "1-3 años",
        "3-5": "3-5 años",
        "5+": "Más de 5 años",
      };

      const { error: dbError } = await supabase.from("reseller_applications").insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        experience_summary: `${experienceMap[data.experience] || data.experience}. ${data.motivation}`,
        status: "pending",
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
      });

      if (dbError) {
        console.error("DB error:", dbError);
        toast({ title: "Error al registrar", description: "Intenta de nuevo", variant: "destructive" });
        return;
      }

      // Trigger email notification
      supabase.functions.invoke("notify-new-lead", {
        body: {
          type: "representante",
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          city: data.city,
          experience: data.experience,
        },
      }).catch(console.error);

      toast({
        title: "¡Postulación enviada! 🎉",
        description: "Revisaremos tu perfil y te contactaremos en menos de 24 horas.",
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
        title="Sé Representante SistecPOS | Gana Comisiones"
        description="Únete al programa de representantes de SistecPOS. Gana comisiones atractivas vendiendo el software POS más completo de Colombia. Sin inversión inicial."
      />

      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <img
            src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
            alt="SistecPOS"
            className="h-8"
          />
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Programa de Socios
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-start lg:gap-16">
          {/* Left: Value proposition */}
          <div className="space-y-8">
            <div>
              <span className="mb-2 inline-block rounded-full bg-cta/10 px-3 py-1 text-sm font-semibold text-cta">
                Oportunidad de negocio
              </span>
              <h1 className="mt-3 text-3xl font-display font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                Genera ingresos vendiendo <span className="text-primary">SistecPOS</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Únete como representante comercial. Tú vendes, nosotros nos encargamos de todo lo demás: instalación, configuración y soporte técnico 24/7.
              </p>
            </div>

            <div className="space-y-5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Red activa en +27 ciudades de Colombia</span>
            </div>
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-foreground">Postúlate como Representante</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Completa tus datos y te contactamos en 24 horas
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo *</FormLabel>
                    <FormControl><Input placeholder="Tu nombre completo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo *</FormLabel>
                      <FormControl><Input type="email" placeholder="tu@correo.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp *</FormLabel>
                      <FormControl><Input placeholder="3176268307" maxLength={10} inputMode="numeric" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cityOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experiencia *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin experiencia</SelectItem>
                          <SelectItem value="1">Menos de 1 año</SelectItem>
                          <SelectItem value="1-3">1-3 años</SelectItem>
                          <SelectItem value="3-5">3-5 años</SelectItem>
                          <SelectItem value="5+">Más de 5 años</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="motivation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Por qué quieres ser representante? *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Cuéntanos qué te motiva..." maxLength={500} rows={3} {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground text-right">{field.value.length}/500</p>
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
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Enviando..." : "Enviar Postulación"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  🔒 Tus datos están protegidos. No compartimos tu información.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
