import { Link } from "react-router-dom";
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
  FileText,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { categories, products, formatPrice } from "@/data/products";

const getCategoryIcon = (category: string) => {
  const icons: Record<string, typeof Printer> = {
    impresoras: Printer,
    etiquetas: Tag,
    cajones: CircleDollarSign,
    lectores: Barcode,
    papel: ScrollText,
    licencias: FileText
  };
  return icons[category] || Printer;
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
                    .map((product, index) => {
                      const CategoryIcon = getCategoryIcon(product.category);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="h-full flex flex-col border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                            <CardContent className="p-6 flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                  <CategoryIcon className="h-6 w-6 text-primary" />
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

                            <CardFooter className="p-6 pt-0 flex gap-2">
                              <Button 
                                variant="outline"
                                className="flex-1 gap-1"
                                asChild
                              >
                                <Link to={`/productos/${product.slug}`}>
                                  Ver más
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button 
                                className="flex-1 bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-1"
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
                      );
                    })}
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
