import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Store, MapPin, Star, Zap } from "lucide-react";
import { usePageContent, getJsonContent } from "@/hooks/usePageContent";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ end, suffix = "", duration = 2 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("es-CO")}{suffix}
    </span>
  );
}

const iconMap: Record<string, React.ElementType> = { Store, MapPin, Star, Zap };

const defaultStats = [
  { icon: "Store", value: 500, suffix: "+", label: "Negocios activos" },
  { icon: "MapPin", value: 27, suffix: "", label: "Ciudades en Colombia" },
  { icon: "Star", value: 4.8, suffix: "/5", label: "Satisfacción clientes", isDecimal: true },
  { icon: "Zap", value: 99.9, suffix: "%", label: "Disponibilidad", isDecimal: true },
];

export function SocialProofBar() {
  const { data: blocks } = usePageContent("/");
  const stats = getJsonContent(blocks, "social_proof_data", defaultStats);

  return (
    <section id="resultados" className="relative -mt-8 z-10 pb-8">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl rounded-2xl border bg-card p-6 shadow-card md:p-8"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {stats.map((stat: any) => {
              const Icon = iconMap[stat.icon] || Store;
              return (
                <div key={stat.label} className="flex flex-col items-center text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                    {stat.isDecimal ? (
                      <span>{stat.value}{stat.suffix}</span>
                    ) : (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground md:text-sm">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
