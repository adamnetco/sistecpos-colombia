import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Package, 
  Barcode, 
  Building2, 
  ArrowLeftRight, 
  CheckCircle2, 
  MessageCircle,
  Truck,
  Settings,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { DynamicMeta } from "@/components/seo/DynamicMeta";

const benefits = [
  {
    icon: Package,
    title: "Inventario en Tiempo Real",
    description: "Conoce el stock exacto de cada producto al instante"
  },
  {
    icon: Barcode,
    title: "Lector de Códigos de Barras",
    description: "Escanea productos para ventas y entradas de inventario"
  },
  {
    icon: Building2,
    title: "Multi-Sucursal",
    description: "Administra varias tiendas desde un solo lugar"
  },
  {
    icon: ArrowLeftRight,
    title: "Transferencias entre Tiendas",
    description: "Mueve productos entre sucursales fácilmente"
  }
];

const installationIncludes = [
  { icon: Users, text: "Visita a tu tienda" },
  { icon: Truck, text: "Carga de inventario inicial" },
  { icon: Barcode, text: "Configuración de códigos de barras" },
  { icon: Settings, text: "Capacitación a vendedores" }
];

const RetailPage = () => {
  return (
    <Layout>
      <DynamicMeta
        title="Software POS para Tiendas y Retail | SistecPOS"
        description="Sistema POS para tiendas, minimarkets y ferreterías. Control de inventario, códigos de barras y multi-sucursal. Soporte presencial en Floridablanca."
        canonical="https://sistecpos.com/pos-para-retail"
      />
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm font-medium">Solución para Retail</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Software POS para{" "}
                <span className="gradient-text">Tiendas en Floridablanca</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Control de inventario + códigos de barras + soporte presencial.
                Tu tienda organizada desde el primer día.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2"
                  asChild
                >
                  <a 
                    href="https://wa.me/573176268307?text=Hola,%20quiero%20información%20sobre%20el%20POS%20para%20tiendas" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Solicitar Demostración
                  </a>
                </Button>
                <Button size="lg" variant="outline">
                  Ver Funcionalidades
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesita tu tienda
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Funcionalidades diseñadas para minimarkets, supermercados, ferreterías y más
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Lo que incluye tu{" "}
                <span className="gradient-text">instalación</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Vamos a tu tienda, cargamos tu inventario y capacitamos a tus 
                vendedores para que empiecen a vender de inmediato.
              </p>

              <div className="space-y-4">
                {installationIncludes.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-whatsapp/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-whatsapp" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl gradient-bg p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <ShoppingBag className="h-24 w-24 mx-auto mb-6 opacity-90" />
                  <p className="text-2xl font-bold mb-2">Retail</p>
                  <p className="text-white/80">Tiendas • Minimarkets • Ferreterías</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para organizar tu tienda?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Contáctanos hoy y agenda una demostración en tu negocio.
              Estamos en el Área Metropolitana de Bucaramanga.
            </p>
            <Button 
              size="lg" 
              className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2"
              asChild
            >
              <a 
                href="https://wa.me/573176268307?text=Hola,%20quiero%20agendar%20una%20demostración%20del%20POS%20para%20mi%20tienda" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Agendar Demostración Gratis
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default RetailPage;
