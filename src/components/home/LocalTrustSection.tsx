import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, UserCheck, ShieldCheck, Clock, Zap } from "lucide-react";
import { usePageContent, getContent } from "@/hooks/usePageContent";

const trustPoints = [
  { icon: MapPin, title: "Instalación Presencial", description: "Vamos a tu negocio. Instalamos, configuramos y capacitamos a tu equipo en sitio." },
  { icon: Clock, title: "Respuesta en < 5 Minutos", description: "Nos escribes por WhatsApp y un humano real te responde en minutos, no en horas." },
  { icon: UserCheck, title: "Sin Call Centers Robóticos", description: "Soporte humano que conoce tu negocio. No te pasan de agente en agente." },
  { icon: ShieldCheck, title: "Soporte Remoto en Todo Colombia", description: "Para el resto del país, instalación remota asistida el mismo día con soporte continuo." },
];

export function LocalTrustSection() {
  const { data: blocks } = usePageContent("/");
  const badge = getContent(blocks, "local_trust_badge", "Nuestro Diferencial: Soporte Humano Real");
  const title = getContent(blocks, "local_trust_title", "Soporte Local Real");
  const subtitle = getContent(blocks, "local_trust_subtitle", "No somos un Call Center internacional. Somos un equipo local que va a tu negocio y te resuelve en persona.");

  const { data: stories = [] } = useQuery({
    queryKey: ["local_trust_stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("business_name, business_type, city")
        .eq("is_published", true)
        .order("sort_order")
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  const displayBusinesses = stories.length > 0
    ? stories.map((s) => ({ name: s.business_name, type: s.business_type, city: s.city }))
    : [
        { name: "Droguería San Ángel", type: "Droguería", city: null },
        { name: "Ferretería Mejía", type: "Ferretería", city: null },
        { name: "Tienda Doña Carmen", type: "Minimercado", city: null },
        { name: "Café La Esquina", type: "Cafetería", city: null },
      ];

  return (
    <section id="soporte-local" className="py-16 md:py-24 bg-secondary/50" aria-labelledby="soporte-local-heading">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-whatsapp/10 px-4 py-1.5 text-sm font-semibold text-whatsapp">
            <Zap className="h-4 w-4" />
            {badge}
          </div>
          <h2 id="soporte-local-heading" className="text-3xl font-bold md:text-4xl">{title}</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border bg-card p-6 text-center shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <point.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{point.title}</h3>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Negocios que confían en nosotros
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {displayBusinesses.map((biz) => (
              <div key={biz.name} className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm shadow-sm">
                <span className="h-2 w-2 rounded-full bg-whatsapp" />
                <span className="font-medium text-foreground">{biz.name}</span>
                <span className="text-muted-foreground text-xs">({biz.type}{biz.city ? `, ${biz.city}` : ""})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
