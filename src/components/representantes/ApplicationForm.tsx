import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const cityOptions = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
  "Santa Marta", "Cúcuta", "Pereira", "Manizales", "Ibagué",
  "Neiva", "Villavicencio", "Pasto", "Armenia", "Montería",
  "Valledupar", "Sincelejo", "Popayán", "Tunja", "Riohacha",
  "Buenaventura", "Soledad", "Soacha", "Bello", "Envigado",
  "Otra ciudad",
];

const experienceOptions = [
  "Sin experiencia comercial",
  "Menos de 1 año",
  "1-3 años",
  "3-5 años",
  "Más de 5 años",
];

export function ApplicationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    experience: "",
    motivation: "",
  });

  const isValid =
    form.name.trim().length >= 2 &&
    form.city &&
    form.experience &&
    form.motivation.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    const name = form.name.trim().slice(0, 100);
    const city = form.city.slice(0, 50);
    const experience = form.experience.slice(0, 50);
    const motivation = form.motivation.trim().slice(0, 500);

    const message = [
      `Hola, quiero ser representante de SistecPOS.`,
      ``,
      `*Nombre:* ${name}`,
      `*Ciudad:* ${city}`,
      `*Experiencia comercial:* ${experience}`,
      `*Motivación:* ${motivation}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/573176268307?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    toast({
      title: "¡Formulario listo!",
      description: "Se abrió WhatsApp con tu postulación. Envía el mensaje para completar.",
    });

    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="border-primary/20 shadow-lg max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Formulario de Postulación</CardTitle>
          <p className="text-sm text-muted-foreground">
            Completa tus datos y te contactamos en menos de 24 horas.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="rep-name">Nombre completo *</Label>
              <Input
                id="rep-name"
                placeholder="Tu nombre completo"
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rep-city">Ciudad *</Label>
              <Select
                value={form.city}
                onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}
              >
                <SelectTrigger id="rep-city">
                  <SelectValue placeholder="Selecciona tu ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rep-exp">Experiencia comercial *</Label>
              <Select
                value={form.experience}
                onValueChange={(v) => setForm((f) => ({ ...f, experience: v }))}
              >
                <SelectTrigger id="rep-exp">
                  <SelectValue placeholder="Selecciona tu experiencia" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rep-motivation">
                ¿Por qué quieres ser representante? *
              </Label>
              <Textarea
                id="rep-motivation"
                placeholder="Cuéntanos qué te motiva y por qué serías un buen representante..."
                maxLength={500}
                rows={4}
                value={form.motivation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, motivation: e.target.value }))
                }
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.motivation.length}/500
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white gap-2"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar Postulación por WhatsApp
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Al enviar, se abrirá WhatsApp con tus datos pre-cargados.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
