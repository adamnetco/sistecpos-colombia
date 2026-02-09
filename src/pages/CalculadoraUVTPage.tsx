import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, MessageCircle, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";
import { Link } from "react-router-dom";

// UVT values by year (official DIAN)
const UVT_VALUES: Record<number, number> = {
  2020: 35607,
  2021: 36308,
  2022: 38004,
  2023: 42412,
  2024: 47065,
  2025: 49799,
  2026: 52631, // Projected
};

const currentYear = 2026;

const faqs = [
  {
    question: "¿Qué es la UVT en Colombia?",
    answer:
      "La Unidad de Valor Tributario (UVT) es una medida de referencia creada por la DIAN para estandarizar los valores tributarios en Colombia. Se actualiza anualmente según el IPC y se usa para calcular impuestos, sanciones, topes de facturación y más.",
  },
  {
    question: `¿Cuánto vale la UVT en ${currentYear}?`,
    answer: `Para el año ${currentYear}, el valor de la UVT es de $${UVT_VALUES[currentYear]?.toLocaleString("es-CO")} COP. Este valor es fijado por la DIAN mediante resolución oficial.`,
  },
  {
    question: "¿Para qué se usa la UVT en facturación electrónica?",
    answer:
      "La UVT se usa para determinar topes como el límite de 5 UVT para tiquetes POS (ventas sin factura electrónica obligatoria), sanciones por no facturar y bases gravables para diferentes impuestos.",
  },
  {
    question: "¿SistecPOS actualiza la UVT automáticamente?",
    answer:
      "Sí. SistecPOS actualiza el valor de la UVT automáticamente cada año sin que tengas que hacer nada. El sistema calcula los topes y sanciones con el valor vigente.",
  },
];

export default function CalculadoraUVTPage() {
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState(currentYear);
  const [mode, setMode] = useState<"pesos-to-uvt" | "uvt-to-pesos">("pesos-to-uvt");

  const uvtValue = UVT_VALUES[year] || UVT_VALUES[currentYear];

  const result = useMemo(() => {
    const num = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(num) || num <= 0) return null;
    if (mode === "pesos-to-uvt") {
      return { value: num / uvtValue, label: "UVT" };
    }
    return { value: num * uvtValue, label: "COP" };
  }, [amount, uvtValue, mode]);

  const formatNumber = (n: number) =>
    n < 1
      ? n.toFixed(4)
      : n.toLocaleString("es-CO", { maximumFractionDigits: 2 });

  return (
    <Layout>
      <SEO
        title={`Calculadora UVT ${currentYear}: Convierte Pesos a UVT | SistecPOS`}
        description={`Convierte pesos colombianos a UVT y viceversa. Valor UVT ${currentYear}: $${uvtValue.toLocaleString("es-CO")}. Herramienta gratuita de SistecPOS.`}
        canonical="https://sistecpos.com/herramientas/calculadora-uvt"
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs
        items={[
          { label: "Guías DIAN", href: "/guias-dian" },
          { label: "Calculadora UVT" },
        ]}
      />

      {/* Hero */}
      <section className="relative py-16 md:py-20 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Calculator className="h-3 w-3 mr-1" />
                Herramienta Gratuita
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4" id="titulo">
                Calculadora UVT {currentYear}
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-2">
                Convierte pesos colombianos a UVT y viceversa con el valor oficial vigente.
              </p>
              <p className="text-sm text-primary-foreground/60">
                Valor UVT {year}: <strong>${uvtValue.toLocaleString("es-CO")} COP</strong>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Year selector */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Año fiscal</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(UVT_VALUES)
                        .map(Number)
                        .sort((a, b) => b - a)
                        .map((y) => (
                          <button
                            key={y}
                            onClick={() => setYear(y)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              year === y
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {y}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Mode toggle */}
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setMode(mode === "pesos-to-uvt" ? "uvt-to-pesos" : "pesos-to-uvt");
                        setAmount("");
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      {mode === "pesos-to-uvt" ? "Pesos → UVT" : "UVT → Pesos"}
                    </button>
                  </div>

                  {/* Input */}
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
                      {mode === "pesos-to-uvt" ? "Valor en pesos (COP)" : "Cantidad de UVT"}
                    </Label>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder={mode === "pesos-to-uvt" ? "Ej: 5.000.000" : "Ej: 100"}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  {/* Result */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-lg bg-primary/10 text-center"
                    >
                      <p className="text-sm text-muted-foreground mb-1">Resultado</p>
                      <p className="text-3xl font-bold text-primary">
                        {result.label === "COP" ? "$" : ""}
                        {formatNumber(result.value)}
                        <span className="text-base font-normal ml-2 text-muted-foreground">
                          {result.label}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        1 UVT ({year}) = ${uvtValue.toLocaleString("es-CO")} COP
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick reference */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8">
              <h2 className="text-xl font-bold mb-4">Referencia Rápida UVT {year}</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { uvt: 5, label: "Tope tiquete POS" },
                  { uvt: 100, label: "Referencia menor" },
                  { uvt: 246, label: "Sanción por factura" },
                  { uvt: 1000, label: "Referencia mayor" },
                ].map((ref) => (
                  <Card key={ref.uvt} className="text-center">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">{ref.label}</p>
                      <p className="font-bold">{ref.uvt} UVT</p>
                      <p className="text-sm text-primary">
                        ${(ref.uvt * uvtValue).toLocaleString("es-CO")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
              Preguntas sobre la <span className="gradient-text">UVT</span>
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold mb-1">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container px-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Cansado de calcular UVTs manualmente?</h2>
          <p className="text-primary-foreground/80 mb-6">
            SistecPOS actualiza la UVT automáticamente cada año. Tú vendes, nosotros hacemos las cuentas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2" asChild>
              <a href="https://wa.me/573176268307?text=Hola,%20quiero%20un%20POS%20que%20maneje%20la%20UVT%20automáticamente" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Prueba Gratis 7 Días
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/guias-dian" className="gap-2">
                Ver más guías DIAN
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
