import { motion } from "framer-motion";

interface NicheIntroSectionProps {
  nicheTitle: string;
  seoIntro: string;
  whyPosMatters: string;
}

export function NicheIntroSection({ nicheTitle, seoIntro, whyPosMatters }: NicheIntroSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-6">
              ¿Qué es un sistema POS para <span className="gradient-text">{nicheTitle}</span>?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">{seoIntro}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-10"
          >
            <h3 className="text-2xl font-bold mb-4">
              ¿Por qué tu {nicheTitle.toLowerCase()} necesita un sistema POS?
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">{whyPosMatters}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
