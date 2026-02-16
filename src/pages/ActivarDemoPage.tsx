import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2, Rocket, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo/SEO";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  DAILY_SALES_OPTIONS, EMPLOYEE_COUNT_OPTIONS, URGENCY_OPTIONS,
} from "@/data/demoFormOptions";

const activationSchema = z.object({
  uses_software: z.boolean(),
  knows_inventory: z.boolean(),
  main_pain: z.string().trim().min(5, "Describe brevemente tu necesidad").max(500),
  ideal_pos_features: z.string().trim().min(5, "¿Qué debería tener?").max(500),
  daily_sales: z.string().min(1, "Selecciona una opción"),
  employee_count: z.string().min(1, "Selecciona una opción"),
  urgency: z.string().min(1, "Selecciona una opción"),
});

type ActivationFormValues = z.infer<typeof activationSchema>;

interface LeadData {
  id: string;
  contact_name: string;
  business_name: string;
  email: string;
  phone: string;
  city: string | null;
  business_type: string | null;
  country: string | null;
  activation_completed_at: string | null;
}

export default function ActivarDemoPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const form = useForm<ActivationFormValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: {
      uses_software: false,
      knows_inventory: false,
      main_pain: "",
      ideal_pos_features: "",
      daily_sales: "",
      employee_count: "",
      urgency: "",
    },
  });

  useEffect(() => {
    if (!token) return;
    const fetchLead = async () => {
      const { data, error } = await supabase
        .from("leads_trials")
        .select("id, contact_name, business_name, email, phone, city, business_type, country, activation_completed_at")
        .eq("activation_token", token)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      if (data.activation_completed_at) {
        setAlreadyCompleted(true);
      }

      setLead(data as LeadData);
      setLoading(false);
    };
    fetchLead();
  }, [token]);

  async function onSubmit(values: ActivationFormValues) {
    if (!lead) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("leads_trials")
        .update({
          uses_software: values.uses_software,
          knows_inventory: values.knows_inventory,
          main_pain: values.main_pain,
          ideal_pos_features: values.ideal_pos_features,
          daily_sales: values.daily_sales,
          employee_count: values.employee_count,
          urgency: values.urgency,
          activation_completed_at: new Date().toISOString(),
          status: "activation_completed",
        })
        .eq("id", lead.id);

      if (error) throw error;

      toast({
        title: "¡Registro completado! 🎉",
        description: "Pronto recibirás tus credenciales de acceso.",
      });

      // Notify admin about activation completion (different from initial welcome)
      supabase.functions.invoke("notify-new-lead", {
        body: {
          type: "activation_completed",
          name: lead.contact_name,
          business: lead.business_name,
          phone: lead.phone,
          email: lead.email,
          city: lead.city || "",
          qualificationData: {
            uses_software: values.uses_software,
            knows_inventory: values.knows_inventory,
            main_pain: values.main_pain,
            ideal_pos_features: values.ideal_pos_features,
            daily_sales: values.daily_sales,
            employee_count: values.employee_count,
            urgency: values.urgency,
          },
        },
      }).catch(console.error);

      setTimeout(() => navigate("/gracias"), 1500);
    } catch (err) {
      console.error(err);
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Enlace no válido</h1>
          <p className="text-muted-foreground">Este enlace de activación no existe o ha expirado.</p>
          <Button onClick={() => navigate("/lp/demo")}>Solicitar nueva demo</Button>
        </div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-whatsapp" />
          <h1 className="text-2xl font-bold">¡Ya completaste tu registro!</h1>
          <p className="text-muted-foreground">
            Pronto recibirás tus credenciales de acceso al POS por correo y WhatsApp.
          </p>
          <Button onClick={() => navigate("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-background to-background">
      <SEO
        title="Activar Demo | SistecPOS"
        description="Completa tu registro para recibir tu demo personalizada de SistecPOS"
      />

      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <img
            src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
            alt="SistecPOS"
            className="h-8"
          />
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ¡Último paso!
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: "✓", label: "Datos", sub: "Datos personales" },
            { num: "✓", label: "Negocio", sub: "Tipo de negocio" },
            { num: "3", label: "Confirmación", sub: "Confirma tu perfil" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                step.num === "3"
                  ? "bg-primary text-primary-foreground"
                  : "bg-whatsapp/20 text-whatsapp"
              }`}>
                {step.num === "✓" ? <CheckCircle className="h-5 w-5" /> : step.num}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pre-filled data summary */}
        <div className="rounded-xl border bg-card p-5 mb-6 space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tus datos registrados</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <p className="font-medium">{lead.contact_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Negocio:</span>
              <p className="font-medium">{lead.business_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Correo:</span>
              <p className="font-medium text-xs">{lead.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">WhatsApp:</span>
              <p className="font-medium">{lead.phone}</p>
            </div>
            {lead.city && (
              <div>
                <span className="text-muted-foreground">Ciudad:</span>
                <p className="font-medium">{lead.city}</p>
              </div>
            )}
            {lead.business_type && (
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium">{lead.business_type}</p>
              </div>
            )}
          </div>
        </div>

        {/* Qualification form */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-card">
          <div className="mb-6">
            <h1 className="text-xl font-bold">¡Último paso!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Responde estas breves preguntas para asesorarte mejor.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* a) Uses software */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label className="text-sm font-medium flex-1">
                  a) ¿Actualmente maneja algún software?
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {form.watch("uses_software") ? "Sí" : "No"}
                  </span>
                  <Switch
                    checked={form.watch("uses_software")}
                    onCheckedChange={(v) => form.setValue("uses_software", v)}
                  />
                </div>
              </div>

              {/* b) Knows inventory */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label className="text-sm font-medium flex-1">
                  b) ¿Actualmente sabe cómo están sus inventarios, ganancias, pérdidas, rotación de productos?
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {form.watch("knows_inventory") ? "Sí" : "No"}
                  </span>
                  <Switch
                    checked={form.watch("knows_inventory")}
                    onCheckedChange={(v) => form.setValue("knows_inventory", v)}
                  />
                </div>
              </div>

              {/* c) Main pain */}
              <FormField control={form.control} name="main_pain" render={({ field }) => (
                <FormItem>
                  <FormLabel>c) ¿Cuál cree que es el mayor inconveniente que tiene por no haber sistematizado completamente? *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Déjanos tu necesidad..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* d) Ideal POS features */}
              <FormField control={form.control} name="ideal_pos_features" render={({ field }) => (
                <FormItem>
                  <FormLabel>d) ¿Qué debería tener su software POS ideal? *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Fácil de usar, control de inventario..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* e) Daily sales */}
              <FormField control={form.control} name="daily_sales" render={({ field }) => (
                <FormItem>
                  <FormLabel>e) ¿Cuántas ventas promedio hace por día (en cantidad, no en dinero)? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAILY_SALES_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* f) Employee count */}
              <FormField control={form.control} name="employee_count" render={({ field }) => (
                <FormItem>
                  <FormLabel>f) ¿Cuántos empleados tiene? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMPLOYEE_COUNT_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* g) Urgency */}
              <FormField control={form.control} name="urgency" render={({ field }) => (
                <FormItem>
                  <FormLabel>g) ¿En cuánto tiempo quiere sistematizar? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {URGENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base font-semibold bg-cta hover:bg-cta/90 text-cta-foreground"
                size="lg"
              >
                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                {submitting ? "Completando..." : "Completar Activación"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                🔒 Tus datos están protegidos. No compartimos tu información.
              </p>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
