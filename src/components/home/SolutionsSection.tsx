import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { businessTypes } from "@/data/businessTypes";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function SolutionsSection() {
  const [showAll, setShowAll] = useState(false);
  const displayedSolutions = showAll ? businessTypes : businessTypes.slice(0, 12);

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
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Soluciones para <span className="gradient-text">+{businessTypes.length} Tipos de Negocio</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Software adaptado a las necesidades específicas de tu industria con módulos especializados.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto"
        >
          {displayedSolutions.map((solution) => (
            <motion.div key={solution.slug} variants={itemVariants}>
              <Link to={`/soluciones/${solution.slug}`}>
                <Card className="h-full border shadow-soft hover:shadow-card transition-all hover:-translate-y-1 bg-card group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${solution.color} group-hover:scale-110 transition-transform`}>
                        <solution.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                          {solution.titleShort}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {solution.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {businessTypes.length > 12 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? "Ver menos" : `Ver los ${businessTypes.length} tipos de negocio`}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
