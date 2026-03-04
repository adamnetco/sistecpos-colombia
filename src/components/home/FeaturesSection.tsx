import { motion } from "framer-motion";
import { 
  Cloud, WifiOff, Shield, BarChart3, Smartphone, Monitor, Users, Package, 
  CreditCard, FileSpreadsheet, Settings, Warehouse, Gift, Store, Receipt, 
  Truck, DollarSign, Boxes
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePageContent, getContent } from "@/hooks/usePageContent";

const mainFeatures = [
  { icon: Cloud, title: "100% en la Nube", description: "Accede desde cualquier dispositivo, en cualquier lugar. Cero instalaciones, solo abre tu navegador." },
  { icon: WifiOff, title: "Funciona Sin Internet", description: "Trabaja hasta 8 días sin conexión. Sincroniza automáticamente cuando vuelva el internet." },
  { icon: Shield, title: "Información Segura", description: "3 respaldos diarios en diferentes servidores de USA. Tu data siempre protegida." },
  { icon: Smartphone, title: "Multi-Dispositivo", description: "Funciona en PC, laptop, tablet y celular. Compatible con Windows, Mac, Linux y Android." },
];

const modules = [
  { icon: Receipt, title: "Ventas", description: "Fácil facturación, lector código de barras, pantallas táctiles, múltiples métodos de pago." },
  { icon: Package, title: "Inventario", description: "Importador masivo de Excel, varios tipos de precio, sistema de seriales." },
  { icon: Users, title: "Empleados", description: "Control de permisos por cada módulo y función. Asignación de comisiones." },
  { icon: Warehouse, title: "Bodega", description: "Envío en tiempo real de ventas a bodega. Alarmas y estados de pedidos." },
  { icon: Store, title: "Multi-Tiendas", description: "Varias sucursales con diferentes inventarios. Transferencias entre tiendas." },
  { icon: BarChart3, title: "Reportes", description: "Conoce tus ventas, inventario y ganancias en tiempo real desde cualquier lugar." },
  { icon: Truck, title: "Proveedores", description: "Gestión de proveedores, cuentas por pagar, bonos e importación masiva en Excel." },
  { icon: DollarSign, title: "Mov. de Caja", description: "Registra todos tus gastos y salidas de dinero. Imprime ticket del gasto." },
  { icon: FileSpreadsheet, title: "Compras", description: "Control de todas las compras de mercancía. Permite pagar a crédito." },
  { icon: Gift, title: "Tarjetas de Regalo", description: "Genera tarjetas con número de documento. Redime en cualquier sucursal." },
  { icon: Settings, title: "Servicio Técnico", description: "Control de todo tipo de servicio técnico, repuestos, seriales y garantías." },
  { icon: Boxes, title: "Kits", description: "Crea kits de 2 o más productos. Mejora rotación combinando productos." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  const { data: blocks } = usePageContent("/");

  const label = getContent(blocks, "features_label", "Sistema en la Nube de Última Tecnología");
  const title = getContent(blocks, "features_title", 'Trabaja tranquilo, <span class="gradient-text">nosotros respaldamos</span>');
  const subtitle = getContent(blocks, "features_subtitle", "Toda la información se almacena en servidores de USA. Ya no tendrás que preocuparte si tu equipo o sistema operativo falla.");
  const modulesTitle = getContent(blocks, "features_modules_title", 'Módulos <span class="gradient-text">Completos</span>');
  const modulesSubtitle = getContent(blocks, "features_modules_subtitle", "Todo lo que necesitas para administrar tu negocio en una sola plataforma.");

  return (
    <section className="py-16 md:py-24 bg-background" id="caracteristicas">
      <div className="container px-4">
        {/* Main Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-2 block">{label}</span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" dangerouslySetInnerHTML={{ __html: title }} />
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-20"
        >
          {mainFeatures.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full border shadow-soft hover:shadow-card transition-all hover:-translate-y-1 bg-card group">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" dangerouslySetInnerHTML={{ __html: modulesTitle }} />
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{modulesSubtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto"
        >
          {modules.map((module) => (
            <motion.div key={module.title} variants={itemVariants}>
              <Card className="h-full border shadow-soft hover:shadow-card transition-all hover:-translate-y-1 bg-card group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <module.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{module.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
