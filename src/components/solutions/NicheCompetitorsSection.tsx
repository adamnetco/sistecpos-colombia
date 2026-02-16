import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { NicheCompetitorEntry } from "@/data/nicheEditorial";

interface NicheCompetitorsSectionProps {
  nicheTitle: string;
  competitors: NicheCompetitorEntry[];
}

export function NicheCompetitorsSection({ nicheTitle, competitors }: NicheCompetitorsSectionProps) {
  if (!competitors || competitors.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Top Sistemas POS para <span className="gradient-text">{nicheTitle}</span> en Colombia
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analizamos las principales alternativas del mercado para que tomes la mejor decisión.
          </p>
        </motion.div>

        {/* SistecPOS as #1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-6"
        >
          <Card className="border-primary/30 bg-primary/5 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-primary text-primary-foreground">🥇 #1</Badge>
                <h3 className="text-xl font-bold">SistecPOS</h3>
                <Badge variant="secondary">Recomendado</Badge>
              </div>
              <p className="text-muted-foreground mb-3">
                El sistema POS más completo para {nicheTitle.toLowerCase()} en Colombia. Instalación presencial, modo offline de 8 días, facturación DIAN ilimitada y 16 módulos especializados.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">✅ Facturación DIAN</Badge>
                <Badge variant="outline" className="text-xs">✅ Offline 8 días</Badge>
                <Badge variant="outline" className="text-xs">✅ Soporte presencial</Badge>
                <Badge variant="outline" className="text-xs">✅ Desde $12 USD/mes</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Other competitors */}
        <div className="max-w-3xl mx-auto space-y-4">
          {competitors.map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary">#{i + 2}</Badge>
                    <h3 className="font-semibold">{comp.name}</h3>
                    {comp.slug && (
                      <Link
                        to={`/comparar/${comp.slug}`}
                        className="text-xs text-primary hover:underline ml-auto inline-flex items-center gap-1"
                      >
                        Ver comparativa <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{comp.description}</p>
                  <p className="text-sm">
                    <span className="text-destructive font-medium">Limitación:</span>{" "}
                    <span className="text-muted-foreground">{comp.weakness}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
