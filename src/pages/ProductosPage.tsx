import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
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
  ArrowRight,
  Sparkles,
  Crown,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { categories, products, formatPrice, formatPriceUSD, Product } from "@/data/products";

const getCategoryIcon = (category: string) => {
  const icons: Record<string, typeof Printer> = {
    impresoras: Printer,
    etiquetas: Tag,
    cajones: CircleDollarSign,
    lectores: Barcode,
    papel: ScrollText,
    licencias: FileText,
    modulos: FileText
  };
  return icons[category] || Printer;
};

const getLicenseIcon = (product: Product) => {
  if (product.name.includes("Multitienda") || product.name.includes("sucursales")) {
    return Building2;
  }
  if (product.name.includes("PREMIUM") || product.name.includes("Premium")) {
    return Crown;
  }
  return FileText;
};

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const CategoryIcon = product.category === "licencias" || product.category === "modulos" 
    ? getLicenseIcon(product) 
    : getCategoryIcon(product.category);
  
  const isLicense = product.category === "licencias" || product.category === "modulos";
  const hasImage = product.image && !isLicense;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 relative overflow-hidden">
        {product.isOffer && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className="rounded-none rounded-bl-lg bg-destructive text-destructive-foreground font-bold px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              ¡Oferta!
            </Badge>
          </div>
        )}
        
        <CardContent className="p-6 flex-1">
          {hasImage ? (
            <div className="relative mb-4 bg-muted/30 rounded-xl p-4 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-32 w-auto object-contain"
              />
              {product.popular && (
                <Badge className="absolute top-2 left-2 bg-whatsapp/10 text-whatsapp border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isLicense 
                  ? "bg-gradient-to-br from-primary/20 to-primary/5" 
                  : "bg-primary/10"
              }`}>
                <CategoryIcon className="h-6 w-6 text-primary" />
              </div>
              {product.popular && (
                <Badge className="bg-whatsapp/10 text-whatsapp border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          )}

          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-4">{product.description}</p>

          <div className="space-y-2 mb-4">
            {product.features.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            {isLicense && product.priceUSD ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  {product.originalPriceUSD && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPriceUSD(product.originalPriceUSD)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-primary">
                    {formatPriceUSD(product.priceUSD)}
                  </span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ≈ {formatPrice(product.price)} COP
                </p>
              </div>
            ) : (
              <>
                {product.originalPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </p>
                )}
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
              </>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isLicense ? "Instalación y configuración incluida" : "Incluye instalación y configuración"}
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
};

const ProductosPage = () => {
  return (
    <Layout>
      <DynamicMeta
        title="Productos y Hardware POS | Impresoras, Lectores, Cajones | SistecPOS"
        description="Encuentra impresoras térmicas, lectores de códigos de barras, cajones monederos y papel térmico para tu punto de venta. Envío a toda Colombia."
        canonical="https://sistecpos.lovable.app/productos"
      />
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
              <Badge className="mb-4 bg-destructive/10 text-destructive border-0 px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Ofertas Especiales Disponibles
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Licencias y{" "}
                <span className="gradient-text">Equipos POS</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Licencias de software y hardware con instalación presencial en tu negocio
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <Tabs defaultValue="licencias" className="w-full">
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
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Licenses CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Distribuidor Autorizado
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Licencias con{" "}
                  <span className="gradient-text">Instalación Incluida</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Somos distribuidores autorizados del software POS en la nube más completo de Colombia. 
                  Precios directos de fábrica con servicio local en Santander.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                    <span>Instalación y configuración presencial incluida</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                    <span>Capacitación a tu equipo de trabajo</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                    <span>Soporte técnico local y remoto</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                    <span>Precios en USD, pagas en pesos colombianos</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-semibold text-lg mb-4">¿No sabes cuál licencia elegir?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Te asesoramos gratis según el tamaño de tu negocio, cantidad de usuarios y necesidades específicas.
                </p>
                <div className="space-y-3">
                  <Button 
                    size="lg"
                    className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2"
                    asChild
                  >
                    <a 
                      href="https://wa.me/573176268307?text=Hola,%20necesito%20asesoría%20para%20elegir%20la%20licencia%20correcta%20para%20mi%20negocio"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Asesoría Gratuita
                    </a>
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    asChild
                  >
                    <Link to="/comparativa-licencias">
                      <ArrowRight className="h-5 w-5" />
                      Comparar con otros POS
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
