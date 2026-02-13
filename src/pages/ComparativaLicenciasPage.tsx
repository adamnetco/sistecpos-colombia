import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, softwareApplicationSchema } from "@/components/seo/JsonLd";
import { motion } from "framer-motion";
import { Check, X, Crown, Star, Zap, Building2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const posProviders = [
  {
    id: "sistecpos",
    name: "SistecPOS",
    recommended: true,
    description: "Software POS 100% en la nube con soporte presencial en Santander",
    logo: "/images/sistecpos.png",
    color: "bg-primary",
    url: "https://sistecpos.com",
  },
  {
    id: "tiendana",
    name: "Tiendana",
    recommended: false,
    description: "App todo en uno para negocios con enfoque móvil",
    logo: "/images/tiendana.png",
    color: "bg-blue-500",
    url: "https://www.tiendana.com",
  },
  {
    id: "vectorpos",
    name: "VectorPOS",
    recommended: false,
    description: "Software especializado para restaurantes",
    logo: "/images/vectorpos.png",
    color: "bg-orange-500",
    url: "https://vectorposweb.com",
  },
  {
    id: "sitricpos",
    name: "SitricPOS",
    recommended: false,
    description: "Sistema POS con facturación electrónica",
    logo: "/images/sitricpos.png",
    color: "bg-purple-500",
    url: "https://sitricpos.com",
  },
];

const comparisonFeatures = [
  {
    category: "Funcionalidades Básicas",
    features: [
      { name: "Ventas y facturación", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: true },
      { name: "Control de inventario", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: true },
      { name: "Usuarios ilimitados", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: true },
      { name: "Facturas ilimitadas", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: true },
      { name: "Reportes y estadísticas", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: true },
    ],
  },
  {
    category: "Funcionalidades Avanzadas",
    features: [
      { name: "Modo offline (hasta 8 días)", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "16+ módulos especializados", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Multi-tienda centralizada", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: true },
      { name: "Módulo Servicio Técnico", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Importación masiva Excel", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Integración contable", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Tienda Online integrada", sistecpos: true, tiendana: true, vectorpos: false, sitricpos: false },
      { name: "Casa de cambio/divisas", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
    ],
  },
  {
    category: "Restaurantes",
    features: [
      { name: "Control de mesas", sistecpos: true, tiendana: false, vectorpos: true, sitricpos: true },
      { name: "Comandas de cocina", sistecpos: true, tiendana: false, vectorpos: true, sitricpos: true },
      { name: "Monitor KDS cocina", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: false },
      { name: "Recetas y costos", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: false },
      { name: "División de cuentas", sistecpos: true, tiendana: false, vectorpos: true, sitricpos: false },
    ],
  },
  {
    category: "Soporte y Servicio",
    features: [
      { name: "Instalación presencial", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Capacitación en tu local", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Soporte mismo día", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Configuración personalizada", sistecpos: true, tiendana: false, vectorpos: false, sitricpos: false },
      { name: "Soporte WhatsApp", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: true },
      { name: "Tutoriales en video", sistecpos: true, tiendana: true, vectorpos: true, sitricpos: true },
    ],
  },
];

const pricingPlans = {
  sistecpos: [
    { name: "Plan Emprendedor", price: "$11 USD/mes", priceCOP: "$129 USD/año", popular: false, desc: "1 punto de venta, ideal para pequeños negocios" },
    { name: "Plan Negocio", price: "$20 USD/mes", priceCOP: "$237 USD/año", popular: true, desc: "Inventario detallado y reportes avanzados" },
    { name: "Plan Empresarial", price: "$29 USD/mes", priceCOP: "$347 USD/año", popular: false, desc: "Múltiples sedes o bodegas" },
    { name: "Licencia Vitalicia", price: "$900 USD (pago único)", priceCOP: "Hosting anual: $99 USD", popular: false, desc: "Pago único, sin mensualidades" },
  ],
  tiendana: [
    { name: "Básico", price: "Gratis", priceCOP: "Limitado", popular: false },
    { name: "Pro", price: "$29.900 COP/mes", priceCOP: "", popular: true },
    { name: "Business", price: "$59.900 COP/mes", priceCOP: "", popular: false },
  ],
  vectorpos: [
    { name: "Básico", price: "$35.000 COP/mes", priceCOP: "", popular: false },
    { name: "Medio", price: "$55.000 COP/mes", priceCOP: "", popular: true },
    { name: "Avanzado", price: "$75.000 COP/mes", priceCOP: "", popular: false },
  ],
  sitricpos: [
    { name: "Básico", price: "Desde $40.000 COP/mes", priceCOP: "", popular: false },
    { name: "Pro", price: "Desde $60.000 COP/mes", priceCOP: "", popular: true },
  ],
};

const FeatureCheck = ({ value }: { value: boolean }) =>
  value ? (
    <Check className="h-5 w-5 text-whatsapp mx-auto" />
  ) : (
    <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
  );

const ComparativaLicenciasPage = () => {
  return (
    <Layout>
      <DynamicMeta
        title="Comparativa de Software POS en Colombia | SistecPOS vs Competencia"
        description="Compara SistecPOS con otros proveedores POS en Colombia. Funcionalidades, precios y soporte. Encuentra el mejor software para tu negocio."
        canonical="https://sistecpos.com/comparativa-licencias"
      />
      <JsonLd data={softwareApplicationSchema({ name: "SistecPOS", description: "Comparativa de software POS en Colombia: SistecPOS vs Tiendana, VectorPOS y SitricPOS.", url: "https://sistecpos.com/comparativa-licencias" })} />
      <Breadcrumbs items={[
        { label: "Software POS Colombia", href: "/software-pos-colombia" },
        { label: "Comparativa" },
      ]} />

      {/* Hero Section */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">Comparativa 2025</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Compara los Mejores Software POS de Colombia</h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              Análisis detallado de SistecPOS vs Tiendana, VectorPOS y SitricPOS. Encuentra el sistema ideal para tu
              negocio.
            </p>
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <a
                href="https://wa.me/573176268307?text=Hola,%20quiero%20asesoría%20para%20elegir%20el%20mejor%20POS%20para%20mi%20negocio"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Asesoría Personalizada Gratis
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Providers Overview */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {posProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`h-full ${provider.recommended ? "border-primary ring-2 ring-primary/20" : ""}`}>
                  <CardHeader className="text-center pb-2">
                    {provider.recommended && (
                      <Badge className="w-fit mx-auto mb-2 bg-primary">
                        <Star className="h-3 w-3 mr-1" /> Recomendado
                      </Badge>
                    )}
                    <a href={provider.url} target="_blank" rel="noopener noreferrer" className="block">
                      <div
                        className={`h-16 w-16 rounded-xl ${provider.logo ? "bg-white" : provider.color} mx-auto flex items-center justify-center mb-3 p-2 shadow-md hover:shadow-lg transition-shadow`}
                      >
                        {provider.logo ? (
                          <img src={provider.logo} alt={provider.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-white font-bold text-xl">{provider.name.charAt(0)}</span>
                        )}
                      </div>
                    </a>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">{provider.description}</p>
                    {provider.id !== "sistecpos" ? (
                      <Link
                        to={`/comparar/${provider.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Ver comparativa →
                      </Link>
                    ) : (
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Visitar sitio →
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Comparativa de <span className="gradient-text">Funcionalidades</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre qué ofrece cada sistema y elige el mejor para tu negocio.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Característica</th>
                  {posProviders.map((provider) => (
                    <th key={provider.id} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-semibold ${provider.recommended ? "text-primary" : ""}`}>
                          {provider.name}
                        </span>
                        {provider.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" /> #1
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <>
                    <tr key={category.category} className="bg-muted/50">
                      <td
                        colSpan={5}
                        className="p-3 font-semibold text-sm uppercase tracking-wider text-muted-foreground"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm">{feature.name}</td>
                        <td className="p-4 bg-primary/5">
                          <FeatureCheck value={feature.sistecpos} />
                        </td>
                        <td className="p-4">
                          <FeatureCheck value={feature.tiendana} />
                        </td>
                        <td className="p-4">
                          <FeatureCheck value={feature.vectorpos} />
                        </td>
                        <td className="p-4">
                          <FeatureCheck value={feature.sitricpos} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Compara <span className="gradient-text">Precios</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Planes y precios actualizados de cada proveedor.
            </p>
          </motion.div>

          <Tabs defaultValue="sistecpos" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              {posProviders.map((provider) => (
                <TabsTrigger key={provider.id} value={provider.id} className="gap-2">
                  {provider.recommended && <Star className="h-3 w-3" />}
                  {provider.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(pricingPlans).map(([providerId, plans]) => (
              <TabsContent key={providerId} value={providerId}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className={`h-full ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}>
                        <CardHeader>
                          {plan.popular && <Badge className="w-fit mb-2">Popular</Badge>}
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-primary mb-1">{plan.price}</div>
                          {plan.priceCOP && <div className="text-sm text-muted-foreground">{plan.priceCOP}</div>}
                          {"desc" in plan && (plan as any).desc && (
                            <p className="mt-2 text-xs text-muted-foreground">{(plan as any).desc}</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Why SistecPOS */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                ¿Por qué Elegir <span className="gradient-text">SistecPOS</span>?
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Modo Offline Único</h3>
                      <p className="text-sm text-muted-foreground">
                        Funciona hasta 8 días sin internet con sincronización automática. Ningún otro POS en Colombia
                        ofrece esto.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Soporte Presencial Local</h3>
                      <p className="text-sm text-muted-foreground">
                        Instalación, configuración y capacitación directamente en tu local. Somos de Santander, para
                        Santander.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">16 Módulos Especializados</h3>
                      <p className="text-sm text-muted-foreground">
                        Inventario, Multi-tienda, Servicio Técnico, Casa de Cambio y más. Todo incluido sin costos
                        adicionales.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">También Comercializamos Otros POS</h3>
                      <p className="text-sm text-muted-foreground">
                        Si otro sistema se adapta mejor a tu negocio, también podemos implementarlo con el mismo
                        servicio premium.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Necesitas Ayuda para Decidir?</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Agenda una asesoría gratuita y te ayudamos a elegir el mejor sistema para las necesidades específicas de
              tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-whatsapp gap-2" asChild>
                <a
                  href="https://wa.me/573176268307?text=Hola,%20quiero%20asesoría%20para%20elegir%20el%20mejor%20POS"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Asesoría por WhatsApp
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/60 text-white hover:bg-white hover:text-primary transition-all hover:scale-105" asChild>
                <a href="/productos">Ver Todos los Productos</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ComparativaLicenciasPage;
