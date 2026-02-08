import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const demoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),
  businessName: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Ingresa 10 dígitos (ej: 3176268307)"),
  email: z
    .string()
    .trim()
    .email("Correo no válido")
    .max(255, "Máximo 255 caracteres"),
  habeasData: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de datos" }),
  }),
});

type DemoFormValues = z.infer<typeof demoSchema>;

export function DemoRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

    // Build WhatsApp message with form data
    const message = encodeURIComponent(
      `Hola SistecPOS, quiero solicitar una demo gratis.\n\n` +
        `👤 Nombre: ${data.fullName}\n` +
        `🏪 Negocio: ${data.businessName}\n` +
        `📱 WhatsApp: ${data.whatsapp}\n` +
        `📧 Correo: ${data.email}`
    );

    // Open WhatsApp with the pre-filled message
    window.open(
      `https://wa.me/573176268307?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );

    toast({
      title: "¡Solicitud enviada con éxito! 🎉",
      description:
        "Te contactaremos por WhatsApp para coordinar tu demo gratuita.",
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/gracias");
    }, 1500);
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Carlos Martínez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Negocio *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Droguería San Ángel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="3176268307"
                    maxLength={10}
                    inputMode="numeric"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Corporativo *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@minegocio.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="habeasData"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-xs text-muted-foreground font-normal cursor-pointer">
                    Acepto la política de tratamiento de datos personales (Habeas
                    Data) y autorizo recibir información comercial vía WhatsApp.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

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

          <p className="text-center text-xs text-muted-foreground">
            🔒 Tus datos están protegidos. No compartimos tu información.
          </p>
        </form>
      </Form>
    </div>
  );
}
