import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface WhatToLookForSectionProps {
  nicheTitle: string;
  items: string[];
}

export function WhatToLookForSection({ nicheTitle, items }: WhatToLookForSectionProps) {
  if (!items || items.length === 0) return null;

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
            ¿Qué debe tener un buen POS para <span className="gradient-text">{nicheTitle}</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Checklist de funcionalidades esenciales que debes buscar al elegir tu sistema POS.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
