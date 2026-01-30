import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  Tag, 
  CircleDollarSign, 
  Barcode, 
  ScrollText,
  MessageCircle,
  CheckCircle2,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { id: "all", name: "Todos", icon: null },
  { id: "impresoras", name: "Impresoras", icon: Printer },
  { id: "etiquetas", name: "Etiquetas", icon: Tag },
  { id: "cajones", name: "Cajones", icon: CircleDollarSign },
  { id: "lectores", name: "Lectores", icon: Barcode },
  { id: "papel", name: "Papel", icon: ScrollText },
  { id: "licencias", name: "Licencias", icon: FileText },
];

const products = [
  {
    id: 1,
    name: "Impresora Térmica 80mm",
    category: "impresoras",
    price: 280000,
    description: "Impresora de recibos de alta velocidad, ideal para restaurantes y retail",
    features: ["Velocidad 250mm/s", "USB + Ethernet", "Corte automático"],
    popular: true
  },
  {
    id: 2,
    name: "Impresora Térmica 58mm",
    category: "impresoras",
    price: 150000,
    description: "Impresora compacta perfecta para negocios pequeños",
    features: ["Velocidad 90mm/s", "Conexión USB", "Tamaño compacto"],
    popular: false
  },
  {
    id: 3,
    name: "Impresora de Etiquetas",
    category: "etiquetas",
    price: 450000,
    description: "Imprime etiquetas de códigos de barras y precios",
    features: ["Resolución 203dpi", "Ancho hasta 108mm", "USB + Bluetooth"],
    popular: false
  },
  {
    id: 4,
    name: "Cajón Monedero Metálico",
    category: "cajones",
    price: 180000,
    description: "Cajón de dinero resistente con apertura automática",
    features: ["5 espacios billetes", "8 espacios monedas", "Apertura RJ11"],
    popular: true
  },
  {
    id: 5,
    name: "Cajón Monedero Compacto",
    category: "cajones",
    price: 120000,
    description: "Cajón económico para negocios pequeños",
    features: ["4 espacios billetes", "5 espacios monedas", "Apertura RJ11"],
    popular: false
  },
  {
    id: 6,
    name: "Lector de Código de Barras USB",
    category: "lectores",
    price: 85000,
    description: "Lector láser con cable USB plug & play",
    features: ["Lectura láser", "Cable 1.5m", "Compatible Windows/Mac"],
    popular: true
  },
  {
    id: 7,
    name: "Lector de Código de Barras Inalámbrico",
    category: "lectores",
    price: 150000,
    description: "Lector con batería recargable y base",
    features: ["Alcance 100m", "Batería 8hrs", "Base de carga incluida"],
    popular: false
  },
  {
    id: 8,
    name: "Papel Térmico 80mm (Caja x 50)",
    category: "papel",
    price: 120000,
    description: "Rollos de papel térmico para impresora 80mm",
    features: ["50 rollos por caja", "80mm x 80m", "Alta durabilidad"],
    popular: false
  },
  {
    id: 9,
    name: "Papel Térmico 58mm (Caja x 50)",
    category: "papel",
    price: 85000,
    description: "Rollos de papel térmico para impresora 58mm",
    features: ["50 rollos por caja", "58mm x 40m", "Alta durabilidad"],
    popular: false
  },
  {
    id: 10,
    name: "Licencia Anual SistecPOS",
    category: "licencias",
    price: 600000,
    description: "Licencia completa del software con soporte incluido",
    features: ["1 año de uso", "Soporte prioritario", "Actualizaciones gratis"],
    popular: true
  },
  {
    id: 11,
    name: "Licencia Mensual SistecPOS",
    category: "licencias",
    price: 60000,
    description: "Licencia mensual flexible para empezar",
    features: ["Pago mensual", "Soporte incluido", "Sin permanencia"],
    popular: false
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const ProductosPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Catálogo de{" "}
                <span className="gradient-text">Productos</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Hardware y licencias con instalación incluida en tu negocio
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
              <TabsList className="h-auto flex-wrap">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="px-4 py-2"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products
                    .filter(p => category.id === "all" || p.category === category.id)
                    .map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="h-full flex flex-col border-0 shadow-card hover:shadow-card-hover transition-shadow">
                          <CardContent className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                {product.category === "impresoras" && <Printer className="h-6 w-6 text-primary" />}
                                {product.category === "etiquetas" && <Tag className="h-6 w-6 text-primary" />}
                                {product.category === "cajones" && <CircleDollarSign className="h-6 w-6 text-primary" />}
                                {product.category === "lectores" && <Barcode className="h-6 w-6 text-primary" />}
                                {product.category === "papel" && <ScrollText className="h-6 w-6 text-primary" />}
                                {product.category === "licencias" && <FileText className="h-6 w-6 text-primary" />}
                              </div>
                              {product.popular && (
                                <Badge className="bg-whatsapp/10 text-whatsapp border-0">
                                  Popular
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{product.description}</p>

                            <div className="space-y-2 mb-4">
                              {product.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 border-t">
                              <p className="text-2xl font-bold text-primary">
                                {formatPrice(product.price)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Incluye instalación y configuración
                              </p>
                            </div>
                          </CardContent>

                          <CardFooter className="p-6 pt-0">
                            <Button 
                              className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2"
                              asChild
                            >
                              <a 
                                href={`https://wa.me/573176268307?text=Hola,%20quiero%20cotizar:%20${encodeURIComponent(product.name)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Cotizar
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Installation Notice */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp/10 text-whatsapp mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Servicio Incluido</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Todos los productos incluyen instalación
            </h2>
            <p className="text-muted-foreground mb-6">
              Vamos a tu negocio en el Área Metropolitana de Bucaramanga, 
              instalamos y configuramos todo para que funcione perfectamente.
            </p>
            <Button 
              size="lg"
              className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2"
              asChild
            >
              <a 
                href="https://wa.me/573176268307?text=Hola,%20quiero%20cotizar%20equipos%20para%20mi%20negocio"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Solicitar Cotización Completa
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductosPage;
