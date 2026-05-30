import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rocket, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { BUSINESS_TYPES_DEMO, COUNTRIES } from "@/data/demoFormOptions";
import DemoQualifyingStep, { emptyQualifying, isQualifyingComplete, type QualifyingValues } from "@/components/forms/DemoQualifyingStep";
import { ArrowLeft, ArrowRight } from "lucide-react";

const resellerDemoSchema = z.object({
  fullName: z.string().trim().min(3, "Mínimo 3 caracteres").max(100),
  businessName: z.string().trim().min(2, "Mínimo 2 caracteres").max(20, "Máximo 20 caracteres (límite del sistema)"),
  whatsapp: z.string().trim().regex(/^\d{10}$/, "Ingresa 10 dígitos"),
  email: z.string().trim().email("Correo no válido").max(255),
  city: z.string().trim().min(2, "Ingresa la ciudad").max(100),
  businessType: z.string().min(1, "Selecciona tipo de negocio"),
  country: z.string().min(1, "Selecciona un país"),
});


type ResellerDemoValues = z.infer<typeof resellerDemoSchema>;

export default function ResellerDemoRequestView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [qualifying, setQualifying] = useState<QualifyingValues>(emptyQualifying);
  const { toast } = useToast();
  const { reseller } = useReseller();


  const form = useForm<ResellerDemoValues>({
    resolver: zodResolver(resellerDemoSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      whatsapp: "",
      email: "",
      city: "",
      businessType: "",
      country: "Colombia",
    },
  });

  async function onSubmit(data: ResellerDemoValues) {
    setIsSubmitting(true);
    try {
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 30);

      const { error } = await supabase.from("leads_trials").insert({
        contact_name: data.fullName,
        business_name: data.businessName,
        phone: data.whatsapp,
        email: data.email,
        city: data.city,
        business_type: data.businessType,
        country: data.country,
        source: "socio_panel",
        status: "activation_completed",
        trial_ends_at: trialEnds.toISOString(),
        activation_token: token,
        requested_by_reseller_id: reseller?.id || null,
      });

      if (error) throw error;

      // Trigger welcome email with activation link
      supabase.functions.invoke("notify-new-lead", {
        body: {
          type: "demo",
          name: data.fullName,
          business: data.businessName,
          phone: data.whatsapp,
          email: data.email,
          city: data.city,
          activationToken: token,
          requestedBy: reseller?.full_name || "Socio",
        },
      }).catch(console.error);

      setSuccess(true);
      toast({
        title: "¡Demo solicitada! 🎉",
        description: "Se envió un correo al cliente con el enlace de activación.",
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error al registrar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <CheckCircle className="h-16 w-16 text-whatsapp" />
        <h2 className="text-2xl font-bold">¡Demo Solicitada!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Se envió un correo al cliente con el enlace para completar su registro. Una vez complete la activación, aparecerá en el panel de administración.
        </p>
        <Button onClick={() => { setSuccess(false); form.reset(); }}>
          Solicitar otra demo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Solicitar Demo para Cliente
          </CardTitle>
          <CardDescription>
            Ingresa los datos del cliente. Recibirá un correo con el enlace para completar su registro y activar su demo de 30 días.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo del cliente *</FormLabel>
                  <FormControl><Input placeholder="Ej: Carlos Martínez" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="businessName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del negocio *</FormLabel>
                  <FormControl><Input placeholder="Máximo 30 caracteres. Ej: DrogueriaSanAngel" maxLength={30} {...field} /></FormControl>
                  <p className="text-xs text-muted-foreground">Máximo 30 caracteres</p>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="businessType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de negocio *</FormLabel>
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
                    <FormControl><Input placeholder="Ej: Bucaramanga" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="whatsapp" render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp del cliente *</FormLabel>
                  <div className="flex gap-2">
                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">+57</div>
                    <FormControl>
                      <Input placeholder="3176268307" maxLength={10} inputMode="numeric" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico del cliente *</FormLabel>
                  <FormControl><Input type="email" placeholder="correo@cliente.com" {...field} /></FormControl>
                  <p className="text-xs text-muted-foreground">Aquí le llegarán las credenciales de la demo</p>
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
                {isSubmitting ? "Registrando..." : "Solicitar Demo para Cliente"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
