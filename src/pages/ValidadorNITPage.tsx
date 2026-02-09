import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Hash, CheckCircle2, XCircle, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";
import { Link } from "react-router-dom";

/**
 * Calculates the verification digit for a Colombian NIT.
 * Uses the official DIAN algorithm (modular weighted sum).
 */
function calculateVerificationDigit(nit: string): number {
  const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  const digits = nit.padStart(15, "0").split("").map(Number);
  const sum = digits.reduce((acc, digit, i) => acc + digit * weights[i], 0);
  const remainder = sum % 11;
  return remainder >= 2 ? 11 - remainder : remainder;
}

const faqs = [
  {
    question: "¿Qué es el dígito de verificación del NIT?",
    answer:
      "Es un número que se agrega al NIT para validar su autenticidad. Se calcula con un algoritmo oficial de la DIAN basado en pesos ponderados. Aparece después del guion: 900.123.456-7.",
  },
  {
    question: "¿Para qué necesito validar el NIT?",
    answer:
      "Para asegurarte de que los datos de tus proveedores y clientes sean correctos al emitir facturas electrónicas. Un NIT con dígito de verificación incorrecto puede generar rechazos en la DIAN.",
  },
  {
    question: "¿SistecPOS valida el NIT automáticamente?",
    answer:
      "Sí. SistecPOS calcula y valida el dígito de verificación automáticamente cuando registras un cliente o proveedor. No tienes que calcularlo manualmente.",
  },
];

export default function ValidadorNITPage() {
  const [nit, setNit] = useState("");
  const [userDigit, setUserDigit] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    expectedDigit: number;
  } | null>(null);

  const handleValidate = () => {
    const cleanNit = nit.replace(/[^0-9]/g, "");
    if (cleanNit.length < 5 || cleanNit.length > 15) {
      setResult(null);
      return;
    }
    const expectedDigit = calculateVerificationDigit(cleanNit);
    const inputDigit = parseInt(userDigit, 10);
    setResult({
      valid: inputDigit === expectedDigit,
      expectedDigit,
    });
  };

  const handleNitChange = (value: string) => {
    // Auto-extract digit after hyphen if present
    const parts = value.split("-");
    if (parts.length === 2) {
      setNit(parts[0].replace(/[^0-9]/g, ""));
      setUserDigit(parts[1].replace(/[^0-9]/g, "").slice(0, 1));
    } else {
      setNit(value.replace(/[^0-9.]/g, ""));
    }
    setResult(null);
  };

  return (
    <Layout>
      <SEO
        title="Validador de NIT Colombia: Verifica el Dígito de Verificación | SistecPOS"
        description="Verifica si un NIT colombiano tiene el dígito de verificación correcto. Herramienta gratuita con el algoritmo oficial de la DIAN."
        canonical="https://sistecpos.com/herramientas/validador-nit"
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs
        items={[
          { label: "Guías DIAN", href: "/guias-dian" },
          { label: "Validador de NIT" },
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
                <Hash className="h-3 w-3 mr-1" />
                Herramienta Gratuita
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4" id="titulo">
                Validador de NIT Colombia
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Verifica si un NIT tiene el dígito de verificación correcto usando el algoritmo oficial de la DIAN.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Validator */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label htmlFor="nit" className="text-sm font-medium mb-2 block">
                      NIT (sin dígito de verificación)
                    </Label>
                    <Input
                      id="nit"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 900123456 o 900.123.456-7"
                      value={nit}
                      onChange={(e) => handleNitChange(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Puedes pegar el NIT completo con guion (900.123.456-7)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="digit" className="text-sm font-medium mb-2 block">
                      Dígito de verificación
                    </Label>
                    <Input
                      id="digit"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 7"
                      value={userDigit}
                      onChange={(e) => {
                        setUserDigit(e.target.value.replace(/[^0-9]/g, "").slice(0, 1));
                        setResult(null);
                      }}
                      className="text-lg w-24"
                      maxLength={1}
                    />
                  </div>

                  <Button onClick={handleValidate} className="w-full" size="lg">
                    Validar NIT
                  </Button>

                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-lg text-center ${
                        result.valid
                          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      {result.valid ? (
                        <>
                          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="font-bold text-green-700 dark:text-green-400">
                            ✓ NIT Válido
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            El dígito de verificación {userDigit} es correcto.
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="font-bold text-red-700 dark:text-red-400">
                            ✗ Dígito Incorrecto
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            El dígito correcto para este NIT es: <strong>{result.expectedDigit}</strong>
                          </p>
                        </>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Only digit calculator */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-2">¿No sabes el dígito? Calcúlalo aquí</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ingresa solo el NIT arriba y deja vacío el dígito de verificación. Haz clic en "Validar NIT" y el sistema te dirá cuál es el dígito correcto.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    El algoritmo usa pesos ponderados oficiales de la DIAN (71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3).
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
              Preguntas sobre el <span className="gradient-text">NIT</span>
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
          <h2 className="text-3xl font-bold mb-4">¿Cansado de verificar NITs manualmente?</h2>
          <p className="text-primary-foreground/80 mb-6">
            SistecPOS valida el dígito de verificación automáticamente al registrar clientes y proveedores. Cero errores en tus facturas electrónicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a href="https://wa.me/573176268307?text=Hola,%20quiero%20un%20POS%20que%20valide%20NITs%20automáticamente" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Prueba Gratis 7 Días
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/herramientas/calculadora-uvt" className="gap-2">
                Calculadora UVT
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
