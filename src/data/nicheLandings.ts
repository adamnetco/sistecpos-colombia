import {
  Utensils,
  ShoppingCart,
  Shirt,
  Wrench,
  Smartphone,
  Scissors,
  Pill,
  PawPrint,
  ClipboardList,
  Users,
  ChefHat,
  Receipt,
  Clock,
  Printer,
  Settings,
  BarChart3,
  Package,
  Palette,
  Cpu,
  Heart,
  Stethoscope,
  Store,
  ShoppingBag,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface NicheBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface NicheInstallItem {
  icon: LucideIcon;
  text: string;
}

export interface NicheLanding {
  slug: string;
  title: string;
  subtitle: string;
  heroLabel: string;
  heroIcon: LucideIcon;
  h1: string;
  heroDescription: string;
  whatsappMessage: string;
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: NicheBenefit[];
  installationItems: NicheInstallItem[];
  visualLabel: string;
  visualSubLabel: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaWhatsappMessage: string;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
}

export const nicheLandings: NicheLanding[] = [
  {
    slug: "restaurantes",
    title: "Restaurantes",
    subtitle: "Bares, cafeterías y cocinas",
    heroLabel: "Solución para Restaurantes",
    heroIcon: Utensils,
    h1: "Software POS para Restaurantes en Colombia",
    heroDescription: "Instalación presencial + capacitación a tu equipo + soporte local. Optimiza tu operación desde el primer día.",
    whatsappMessage: "Hola, quiero información sobre el POS para restaurantes",
    benefitsTitle: "Todo lo que necesita tu restaurante",
    benefitsSubtitle: "Funcionalidades diseñadas específicamente para bares, cafeterías y restaurantes",
    benefits: [
      { icon: ClipboardList, title: "Gestión de Comandas", description: "Envía pedidos directamente a cocina desde cualquier mesa" },
      { icon: Users, title: "Control de Mesas", description: "Visualiza el estado de cada mesa en tiempo real" },
      { icon: ChefHat, title: "Recetas y Costos", description: "Calcula automáticamente el costo de cada plato" },
      { icon: Receipt, title: "División de Cuentas", description: "Divide la cuenta entre comensales fácilmente" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu restaurante" },
      { icon: Settings, text: "Configuración de mesas, menú y precios" },
      { icon: Clock, text: "Capacitación a meseros y cajeros" },
      { icon: Printer, text: "Conexión de impresoras de cocina y caja" },
    ],
    visualLabel: "Restaurantes",
    visualSubLabel: "Bares • Cafeterías • Cocinas",
    ctaTitle: "¿Listo para optimizar tu restaurante?",
    ctaDescription: "Contáctanos hoy y agenda una demostración en tu negocio. Soporte presencial y remoto en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi restaurante",
    metaTitle: "Software POS para Restaurantes en Colombia | SistecPOS",
    metaDescription: "Sistema POS especializado para restaurantes, bares y cafeterías. Gestión de comandas, mesas, recetas y división de cuentas. Instalación presencial.",
    canonical: "https://sistecpos.com/pos-para-restaurantes",
  },
  {
    slug: "mini-market",
    title: "Mini Market",
    subtitle: "Tiendas y supermercados",
    heroLabel: "Solución para Mini Markets",
    heroIcon: ShoppingCart,
    h1: "Software POS para Mini Markets y Supermercados en Colombia",
    heroDescription: "Control de inventario, lector de código de barras y facturación electrónica. Todo listo con instalación presencial.",
    whatsappMessage: "Hola, quiero información sobre el POS para mini market",
    benefitsTitle: "Todo lo que necesita tu mini market",
    benefitsSubtitle: "Funcionalidades diseñadas para tiendas, supermercados y autoservicios",
    benefits: [
      { icon: Package, title: "Control de Inventario", description: "Gestiona miles de productos con alertas de stock mínimo" },
      { icon: BarChart3, title: "Reportes de Ventas", description: "Conoce tus productos más vendidos y márgenes en tiempo real" },
      { icon: ShoppingCart, title: "Ventas Rápidas", description: "Factura con lector de código de barras en segundos" },
      { icon: Receipt, title: "Facturación DIAN", description: "Facturación electrónica ilimitada incluida desde el día 1" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu tienda o supermercado" },
      { icon: Settings, text: "Carga masiva de productos desde Excel" },
      { icon: Clock, text: "Capacitación a cajeros y administrador" },
      { icon: Printer, text: "Conexión de impresora, lector y cajón monedero" },
    ],
    visualLabel: "Mini Market",
    visualSubLabel: "Tiendas • Supermercados • Autoservicios",
    ctaTitle: "¿Listo para modernizar tu mini market?",
    ctaDescription: "Contáctanos hoy y agenda una demostración. Instalación presencial y soporte en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi mini market",
    metaTitle: "Software POS para Mini Markets y Supermercados | SistecPOS",
    metaDescription: "Sistema POS para mini markets, tiendas y supermercados. Control de inventario, código de barras, facturación DIAN. Instalación presencial en Colombia.",
    canonical: "https://sistecpos.com/pos-para-mini-market",
  },
  {
    slug: "moda-calzado",
    title: "Moda y Calzado",
    subtitle: "Ropa y accesorios",
    heroLabel: "Solución para Moda y Calzado",
    heroIcon: Shirt,
    h1: "Software POS para Tiendas de Moda y Calzado en Colombia",
    heroDescription: "Gestiona tallas, colores, referencias y sucursales. Inventario inteligente con instalación presencial.",
    whatsappMessage: "Hola, quiero información sobre el POS para tienda de ropa y calzado",
    benefitsTitle: "Todo lo que necesita tu tienda de moda",
    benefitsSubtitle: "Funcionalidades diseñadas para tiendas de ropa, calzado y accesorios",
    benefits: [
      { icon: Layers, title: "Tallas y Colores", description: "Controla variantes de talla, color y referencia por producto" },
      { icon: Package, title: "Inventario por Sucursal", description: "Gestiona stock en múltiples tiendas de forma centralizada" },
      { icon: Palette, title: "Catálogo Visual", description: "Organiza productos con imágenes y categorías personalizadas" },
      { icon: BarChart3, title: "Rotación de Inventario", description: "Identifica productos de baja rotación y optimiza tu compra" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu tienda de moda" },
      { icon: Settings, text: "Configuración de categorías, tallas y precios" },
      { icon: Clock, text: "Capacitación a vendedores y administrador" },
      { icon: Printer, text: "Conexión de impresora y lector de código de barras" },
    ],
    visualLabel: "Moda y Calzado",
    visualSubLabel: "Ropa • Calzado • Accesorios",
    ctaTitle: "¿Listo para potenciar tu tienda de moda?",
    ctaDescription: "Contáctanos y agenda una demostración personalizada. Instalación presencial en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi tienda de ropa",
    metaTitle: "Software POS para Tiendas de Ropa y Calzado | SistecPOS",
    metaDescription: "Sistema POS para tiendas de moda, calzado y accesorios. Control de tallas, colores, inventario multi-tienda. Instalación presencial en Colombia.",
    canonical: "https://sistecpos.com/pos-para-moda-calzado",
  },
  {
    slug: "ferreterias",
    title: "Ferreterías",
    subtitle: "Materiales y herramientas",
    heroLabel: "Solución para Ferreterías",
    heroIcon: Wrench,
    h1: "Software POS para Ferreterías en Colombia",
    heroDescription: "Miles de referencias, ventas por fracción y facturación electrónica DIAN. Instalación presencial incluida.",
    whatsappMessage: "Hola, quiero información sobre el POS para ferretería",
    benefitsTitle: "Todo lo que necesita tu ferretería",
    benefitsSubtitle: "Funcionalidades diseñadas para ferreterías, depósitos y tiendas de materiales",
    benefits: [
      { icon: Package, title: "Miles de Referencias", description: "Gestiona inventarios masivos con importación desde Excel" },
      { icon: BarChart3, title: "Venta por Fracción", description: "Vende por metros, kilos, unidades o fracción según necesites" },
      { icon: Receipt, title: "Cotizaciones Rápidas", description: "Genera cotizaciones profesionales y conviértelas en facturas" },
      { icon: Store, title: "Multi-bodega", description: "Controla inventario en varios depósitos o sucursales" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu ferretería o depósito" },
      { icon: Settings, text: "Carga masiva de productos y precios desde Excel" },
      { icon: Clock, text: "Capacitación a vendedores y cajeros" },
      { icon: Printer, text: "Conexión de impresora y lector de código de barras" },
    ],
    visualLabel: "Ferreterías",
    visualSubLabel: "Materiales • Herramientas • Depósitos",
    ctaTitle: "¿Listo para modernizar tu ferretería?",
    ctaDescription: "Contáctanos y agenda una demostración. Instalación presencial y soporte en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi ferretería",
    metaTitle: "Software POS para Ferreterías en Colombia | SistecPOS",
    metaDescription: "Sistema POS para ferreterías y depósitos. Inventario masivo, venta por fracción, facturación DIAN. Instalación presencial en Colombia.",
    canonical: "https://sistecpos.com/pos-para-ferreterias",
  },
  {
    slug: "tecnologia",
    title: "Tecnología",
    subtitle: "Electrónica y móviles",
    heroLabel: "Solución para Tiendas de Tecnología",
    heroIcon: Smartphone,
    h1: "Software POS para Tiendas de Tecnología en Colombia",
    heroDescription: "Módulo de servicio técnico integrado, control de seriales y garantías. Instalación presencial incluida.",
    whatsappMessage: "Hola, quiero información sobre el POS para tienda de tecnología",
    benefitsTitle: "Todo lo que necesita tu tienda de tecnología",
    benefitsSubtitle: "Funcionalidades diseñadas para tiendas de electrónica, móviles y computadores",
    benefits: [
      { icon: Cpu, title: "Servicio Técnico", description: "Módulo integrado para recepción y seguimiento de reparaciones" },
      { icon: Package, title: "Control de Seriales", description: "Registra IMEIs, seriales y garantías por producto vendido" },
      { icon: BarChart3, title: "Márgenes por Producto", description: "Conoce tu rentabilidad real por cada artículo vendido" },
      { icon: Receipt, title: "Facturación DIAN", description: "Facturación electrónica ilimitada incluida desde el día 1" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu tienda de tecnología" },
      { icon: Settings, text: "Configuración de categorías, seriales y servicios" },
      { icon: Clock, text: "Capacitación a vendedores y técnicos" },
      { icon: Printer, text: "Conexión de impresora y lector de código de barras" },
    ],
    visualLabel: "Tecnología",
    visualSubLabel: "Electrónica • Móviles • Computadores",
    ctaTitle: "¿Listo para potenciar tu tienda de tecnología?",
    ctaDescription: "Contáctanos y agenda una demostración personalizada. Instalación presencial en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi tienda de tecnología",
    metaTitle: "Software POS para Tiendas de Tecnología y Electrónica | SistecPOS",
    metaDescription: "Sistema POS para tiendas de tecnología. Módulo servicio técnico, seriales, garantías, facturación DIAN. Instalación presencial en Colombia.",
    canonical: "https://sistecpos.com/pos-para-tecnologia",
  },
  {
    slug: "salon-belleza",
    title: "Salón de Belleza",
    subtitle: "Salones y spa",
    heroLabel: "Solución para Salones de Belleza",
    heroIcon: Scissors,
    h1: "Software POS para Salones de Belleza en Colombia",
    heroDescription: "Gestión de citas, servicios por estilista y control de productos. Instalación presencial incluida.",
    whatsappMessage: "Hola, quiero información sobre el POS para salón de belleza",
    benefitsTitle: "Todo lo que necesita tu salón de belleza",
    benefitsSubtitle: "Funcionalidades diseñadas para salones, barberías y spas",
    benefits: [
      { icon: Clock, title: "Gestión de Citas", description: "Agenda servicios por estilista con horarios disponibles" },
      { icon: Users, title: "Comisiones por Estilista", description: "Calcula comisiones automáticas por servicios realizados" },
      { icon: Package, title: "Control de Productos", description: "Gestiona inventario de productos de belleza y consumibles" },
      { icon: Receipt, title: "Facturación DIAN", description: "Facturación electrónica ilimitada incluida desde el día 1" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu salón de belleza o spa" },
      { icon: Settings, text: "Configuración de servicios, estilistas y precios" },
      { icon: Clock, text: "Capacitación al equipo de recepción" },
      { icon: Printer, text: "Conexión de impresora térmica para recibos" },
    ],
    visualLabel: "Salón de Belleza",
    visualSubLabel: "Salones • Barberías • Spas",
    ctaTitle: "¿Listo para modernizar tu salón?",
    ctaDescription: "Contáctanos y agenda una demostración. Instalación presencial y soporte en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi salón de belleza",
    metaTitle: "Software POS para Salones de Belleza y Spas | SistecPOS",
    metaDescription: "Sistema POS para salones de belleza, barberías y spas. Gestión de citas, comisiones, inventario. Instalación presencial en Colombia.",
    canonical: "https://sistecpos.com/pos-para-salon-belleza",
  },
  {
    slug: "farmacias",
    title: "Farmacias",
    subtitle: "Droguerías y medicamentos",
    heroLabel: "Solución para Farmacias",
    heroIcon: Pill,
    h1: "Software POS para Farmacias y Droguerías en Colombia",
    heroDescription: "Control de lotes, fechas de vencimiento y medicamentos regulados. Facturación DIAN con instalación presencial.",
    whatsappMessage: "Hola, quiero información sobre el POS para droguería",
    benefitsTitle: "Todo lo que necesita tu droguería",
    benefitsSubtitle: "Funcionalidades diseñadas para droguerías, farmacias y tiendas naturistas",
    benefits: [
      { icon: Package, title: "Control de Lotes", description: "Registra lotes y fechas de vencimiento por producto" },
      { icon: Heart, title: "Productos Regulados", description: "Gestiona medicamentos con registro INVIMA y restricciones" },
      { icon: BarChart3, title: "Alertas de Vencimiento", description: "Recibe alertas automáticas de productos próximos a vencer" },
      { icon: Receipt, title: "Facturación DIAN", description: "Facturación electrónica ilimitada incluida desde el día 1" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu droguería o farmacia" },
      { icon: Settings, text: "Carga masiva de medicamentos y productos" },
      { icon: Clock, text: "Capacitación a dependientes y administrador" },
      { icon: Printer, text: "Conexión de impresora y lector de código de barras" },
    ],
    visualLabel: "Farmacias",
    visualSubLabel: "Droguerías • Medicamentos • Naturistas",
    ctaTitle: "¿Listo para modernizar tu droguería?",
    ctaDescription: "Contáctanos y agenda una demostración. Instalación presencial y soporte en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi droguería",
    metaTitle: "Software POS para Farmacias y Droguerías en Colombia | SistecPOS",
    metaDescription: "Sistema POS para farmacias y droguerías. Control de lotes, vencimientos, facturación DIAN. Instalación presencial en Colombia.",
    canonical: "https://sistecpos.com/pos-para-farmacias",
  },
  {
    slug: "veterinarias",
    title: "Veterinarias",
    subtitle: "Clínicas de mascotas",
    heroLabel: "Solución para Veterinarias",
    heroIcon: PawPrint,
    h1: "Software POS para Veterinarias en Colombia",
    heroDescription: "Historial de pacientes, control de productos veterinarios y facturación DIAN. Instalación presencial incluida.",
    whatsappMessage: "Hola, quiero información sobre el POS para veterinaria",
    benefitsTitle: "Todo lo que necesita tu veterinaria",
    benefitsSubtitle: "Funcionalidades diseñadas para clínicas veterinarias y pet shops",
    benefits: [
      { icon: Stethoscope, title: "Historial de Pacientes", description: "Registra fichas clínicas de mascotas con historial completo" },
      { icon: Package, title: "Inventario Veterinario", description: "Gestiona medicamentos, alimentos y accesorios para mascotas" },
      { icon: Clock, title: "Gestión de Citas", description: "Programa consultas, vacunaciones y procedimientos" },
      { icon: Receipt, title: "Facturación DIAN", description: "Facturación electrónica ilimitada incluida desde el día 1" },
    ],
    installationItems: [
      { icon: Users, text: "Visita a tu clínica veterinaria" },
      { icon: Settings, text: "Configuración de servicios, productos y fichas" },
      { icon: Clock, text: "Capacitación a recepcionistas y veterinarios" },
      { icon: Printer, text: "Conexión de impresora térmica para recibos" },
    ],
    visualLabel: "Veterinarias",
    visualSubLabel: "Clínicas • Pet Shops • Grooming",
    ctaTitle: "¿Listo para modernizar tu veterinaria?",
    ctaDescription: "Contáctanos y agenda una demostración. Instalación presencial y soporte en toda Colombia.",
    ctaWhatsappMessage: "Hola, quiero agendar una demostración del POS para mi veterinaria",
    metaTitle: "Software POS para Veterinarias y Clínicas de Mascotas | SistecPOS",
    metaDescription: "Sistema POS para veterinarias y pet shops. Historial de pacientes, inventario, citas, facturación DIAN. Instalación presencial en Colombia.",
    canonical: "https://sistecpos.com/pos-para-veterinarias",
  },
];

export function getNicheLandingBySlug(slug: string): NicheLanding | undefined {
  return nicheLandings.find((n) => n.slug === slug);
}
