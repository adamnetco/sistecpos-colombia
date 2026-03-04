import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { businessTypes } from "@/data/businessTypes";
import { usePageContent, getContent } from "@/hooks/usePageContent";

function SolutionCard({ solution }: { solution: typeof businessTypes[0] }) {
  return (
    <Link to={`/soluciones/${solution.slug}`}>
      <Card className="h-full border shadow-soft hover:shadow-card transition-all hover:-translate-y-1 bg-card group cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${solution.color} group-hover:scale-110 transition-transform`}>
              <solution.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{solution.titleShort}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{solution.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SolutionsSection() {
  const [showAll, setShowAll] = useState(false);
  const { data: blocks } = usePageContent("/");

  const title = getContent(blocks, "solutions_title", 'Soluciones para <span class="gradient-text">todos los Tipos de Negocio</span>');
  const subtitle = getContent(blocks, "solutions_subtitle", "Software adaptado a las necesidades específicas de tu industria con módulos especializados.");

  const initialItems = businessTypes.slice(0, 12);
  const extraItems = businessTypes.slice(12);

  return (
    <section id="soluciones" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" dangerouslySetInnerHTML={{ __html: title }} />
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
          {initialItems.map((solution, index) => (
            <motion.div
              key={solution.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <SolutionCard solution={solution} />
            </motion.div>
          ))}
          <AnimatePresence>
            {showAll && extraItems.map((solution, index) => (
              <motion.div
                key={solution.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <SolutionCard solution={solution} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {extraItems.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
              {showAll ? (<>Ver menos<ChevronUp className="h-4 w-4" /></>) : (<>Ver los {businessTypes.length} tipos de negocio<ChevronDown className="h-4 w-4" /></>)}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
