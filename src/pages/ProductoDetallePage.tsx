import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  CheckCircle2, 
  ArrowLeft,
  Printer,
  Tag,
  CircleDollarSign,
  Barcode,
  ScrollText,
  FileText,
  Package,
  Settings,
  Truck
} from "lucide-react";
import { motion } from "framer-motion";
import { getProductBySlug, formatPrice, products } from "@/data/products";
import { SEO } from "@/components/seo/SEO";
import { JsonLd, productSchema } from "@/components/seo/JsonLd";

const getCategoryIcon = (category: string) => {
  const icons: Record<string, typeof Printer> = {
    impresoras: Printer,
    etiquetas: Tag,
    cajones: CircleDollarSign,
    lectores: Barcode,
    papel: ScrollText,
    licencias: FileText
  };
  return icons[category] || Package;
};

const ProductoDetallePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;

  if (!product) {
    return <Navigate to="/productos" replace />;
  }

  const CategoryIcon = getCategoryIcon(product.category);

  // Get related products (same category, excluding current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <Layout>
      <SEO
        title={`${product.name} | Hardware POS Colombia | SistecPOS`}
        description={product.longDescription || `Compra ${product.name} para tu punto de venta. Envío a toda Colombia con soporte técnico incluido.`}
        canonical={`https://sistecpos.com/productos/${slug}`}
      />
      <JsonLd
        data={productSchema({
          name: product.name,
          description: product.longDescription || product.description,
          url: `https://sistecpos.com/productos/${slug}`,
          image: product.image,
          priceCOP: product.price,
          priceUSD: product.priceUSD,
          category: product.category,
        })}
      />
      <section className="border-b">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link to="/productos" className="hover:text-foreground transition-colors">
              Productos
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Header */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <Link 
            to="/productos" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image/Icon */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-square rounded-2xl gradient-bg p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <CategoryIcon className="h-32 w-32 mx-auto mb-6 opacity-90" />
                  <p className="text-lg font-medium opacity-80 capitalize">{product.category}</p>
                </div>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              <div className="flex items-start gap-3 mb-4">
                {product.popular && (
                  <Badge className="bg-whatsapp/10 text-whatsapp border-0">
                    Popular
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {product.longDescription}
              </p>

              <div className="space-y-3 mb-6">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="mb-6">
                <p className="text-4xl font-bold text-primary mb-1">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Incluye instalación y configuración en tu negocio
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg"
                  className="flex-1 bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2"
                  asChild
                >
                  <a 
                    href={`https://wa.me/573176268307?text=Hola,%20quiero%20cotizar:%20${encodeURIComponent(product.name)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Cotizar por WhatsApp
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 gap-2" asChild>
                  <a href="tel:+573176268307">
                    Llamar ahora
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specifications & Includes */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Especificaciones Técnicas</h2>
                  </div>

                  <div className="space-y-3">
                    {product.specifications.map((spec, index) => (
                      <div 
                        key={spec.label}
                        className={`flex justify-between py-3 ${
                          index < product.specifications.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Includes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-whatsapp/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-whatsapp" />
                    </div>
                    <h2 className="text-xl font-bold">¿Qué incluye?</h2>
                  </div>

                  <div className="space-y-3">
                    {product.includes.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Productos Relacionados</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct, index) => {
                const RelatedIcon = getCategoryIcon(relatedProduct.category);
                return (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link to={`/productos/${relatedProduct.slug}`}>
                      <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <RelatedIcon className="h-6 w-6 text-primary" />
                            </div>
                            {relatedProduct.popular && (
                              <Badge className="bg-whatsapp/10 text-whatsapp border-0">
                                Popular
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-2">{relatedProduct.name}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{relatedProduct.description}</p>

                          <p className="text-xl font-bold text-primary">
                            {formatPrice(relatedProduct.price)}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Tienes preguntas sobre este producto?
            </h2>
            <p className="text-muted-foreground mb-6">
              Escríbenos por WhatsApp y te asesoramos sin compromiso.
              Estamos en el Área Metropolitana de Bucaramanga.
            </p>
            <Button 
              size="lg"
              className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2"
              asChild
            >
              <a 
                href={`https://wa.me/573176268307?text=Hola,%20tengo%20preguntas%20sobre:%20${encodeURIComponent(product.name)}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Preguntar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductoDetallePage;
