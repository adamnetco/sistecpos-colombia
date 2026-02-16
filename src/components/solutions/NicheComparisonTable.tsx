import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

interface ComparisonRow {
  feature: string;
  sistecpos: string | boolean;
  others: string;
}

interface NicheComparisonTableProps {
  rows: ComparisonRow[];
  nicheTitle: string;
}

export function NicheComparisonTable({ rows, nicheTitle }: NicheComparisonTableProps) {
  if (!rows || rows.length === 0) return null;

  const renderValue = (val: string | boolean) => {
    if (val === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
    if (val === false) return <X className="h-5 w-5 text-destructive mx-auto" />;
    return <span className="text-sm">{val}</span>;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Comparativa: SistecPOS vs <span className="gradient-text">Otros POS</span> para {nicheTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mira por qué SistecPOS es la opción más completa para tu {nicheTitle.toLowerCase()}.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-3 px-4 text-sm font-semibold">Funcionalidad</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-primary">SistecPOS</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Otros POS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium">{row.feature}</td>
                  <td className="py-3 px-4 text-center">{renderValue(row.sistecpos)}</td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">{row.others}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
