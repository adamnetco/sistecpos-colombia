import { 
  Printer, 
  Tag, 
  CircleDollarSign, 
  Barcode, 
  ScrollText,
  FileText,
  LucideIcon
} from "lucide-react";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  priceUSD?: number;
  originalPriceUSD?: number;
  description: string;
  longDescription: string;
  features: string[];
  specifications: ProductSpec[];
  includes: string[];
  popular: boolean;
  isOffer?: boolean;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon | null;
}

export const categories: Category[] = [
  { id: "all", name: "Todos", icon: null },
  { id: "licencias", name: "Licencias", icon: FileText },
  { id: "modulos", name: "Módulos", icon: FileText },
  { id: "impresoras", name: "Impresoras", icon: Printer },
  { id: "etiquetas", name: "Etiquetas", icon: Tag },
  { id: "cajones", name: "Cajones", icon: CircleDollarSign },
  { id: "lectores", name: "Lectores", icon: Barcode },
  { id: "papel", name: "Papel", icon: ScrollText },
];

export const products: Product[] = [
  // ============ LICENCIAS ============
  {
    id: 109,
    slug: "licencia-software-pos-vitalicia",
    name: "Licencia Software POS Vitalicia",
    category: "licencias",
    price: 3780000,
    originalPrice: 4620000,
    priceUSD: 900,
    originalPriceUSD: 1100,
    description: "Licencia de por vida. Solo pagas hosting anual de $99 USD. Sin límites.",
    longDescription: "La Licencia Vitalicia de SistecPOS es una inversión única que te da acceso permanente al software POS más completo de Colombia. No vuelves a pagar licencia: solo un hosting anual de $99 USD para mantener tu sistema en la nube, actualizaciones y respaldos. Ideal para negocios que quieren eliminar costos recurrentes de software.",
    features: ["Pago único de por vida", "Hosting anual $99 USD", "Usuarios ilimitados", "F.E. ilimitada"],
    specifications: [
      { label: "Duración", value: "Vitalicia (de por vida)" },
      { label: "Usuarios", value: "Ilimitados" },
      { label: "Ventas por mes", value: "Ilimitadas" },
      { label: "Facturación electrónica", value: "Ilimitada" },
      { label: "Sucursales", value: "1 sucursal" },
      { label: "Hosting anual", value: "$99 USD/año (obligatorio)" },
      { label: "Soporte", value: "Prioritario WhatsApp + Presencial" },
      { label: "Actualizaciones", value: "Incluidas de por vida" },
      { label: "Respaldos", value: "3 diarios en la nube" }
    ],
    includes: [
      "Licencia permanente del software POS",
      "Instalación y configuración en tu negocio",
      "Capacitación presencial (3 horas)",
      "Configuración de facturación electrónica",
      "Soporte prioritario por WhatsApp",
      "Actualizaciones de por vida incluidas",
      "Primer año de hosting incluido"
    ],
    popular: true,
    isOffer: true
  },
  {
    id: 102,
    slug: "licencia-anual-basica",
    name: "Licencia Anual BÁSICA",
    category: "licencias",
    price: 541800,
    originalPrice: 714000,
    priceUSD: 129,
    originalPriceUSD: 170,
    description: "Licencia anual para negocios pequeños. 900 ventas/mes, 2 usuarios.",
    longDescription: "La Licencia Anual Básica es perfecta para negocios pequeños que buscan una solución económica y confiable. Incluye las funcionalidades esenciales del sistema con límites adecuados para tiendas de bajo volumen.",
    features: ["900 ventas/mes", "2 usuarios", "Sin contabilidad", "Ahorra 20%"],
    specifications: [
      { label: "Duración", value: "12 meses" },
      { label: "Usuarios", value: "2 usuarios" },
      { label: "Ventas por mes", value: "900 ventas" },
      { label: "Sucursales", value: "1 sucursal" },
      { label: "Contabilidad", value: "No incluida" },
      { label: "Soporte", value: "WhatsApp + Presencial" },
      { label: "Actualizaciones", value: "Incluidas" },
      { label: "Respaldos", value: "3 diarios en la nube" }
    ],
    includes: [
      "Licencia de software por 12 meses",
      "Instalación en tu equipo",
      "Configuración inicial completa",
      "Carga de productos (hasta 300)",
      "Capacitación presencial (1 hora)",
      "Soporte por WhatsApp"
    ],
    popular: false,
    isOffer: true
  },
  {
    id: 103,
    slug: "licencia-anual-intermedio",
    name: "Licencia Anual INTERMEDIO",
    category: "licencias",
    price: 995400,
    originalPrice: 1121400,
    priceUSD: 237,
    originalPriceUSD: 267,
    description: "Licencia anual con facturación electrónica. 2000 ventas/mes, 4 usuarios.",
    longDescription: "La Licencia Anual Intermedio está diseñada para negocios en crecimiento que necesitan facturación electrónica y más capacidad. Ideal para tiendas con volumen medio de ventas.",
    features: ["2.000 ventas/mes", "4 usuarios", "Facturación electrónica", "Más capacidad"],
    specifications: [
      { label: "Duración", value: "12 meses" },
      { label: "Usuarios", value: "4 usuarios" },
      { label: "Ventas por mes", value: "2.000 ventas" },
      { label: "Facturación electrónica", value: "Incluida" },
      { label: "Sucursales", value: "1 sucursal" },
      { label: "Soporte", value: "WhatsApp + Presencial" },
      { label: "Actualizaciones", value: "Incluidas" },
      { label: "Respaldos", value: "3 diarios en la nube" }
    ],
    includes: [
      "Licencia de software por 12 meses",
      "Instalación en tu equipo",
      "Configuración inicial completa",
      "Carga de productos (hasta 500)",
      "Capacitación presencial (2 horas)",
      "Configuración de facturación electrónica",
      "Soporte prioritario por WhatsApp"
    ],
    popular: false,
    isOffer: true
  },
  {
    id: 104,
    slug: "licencia-anual-premium",
    name: "Licencia Anual PREMIUM",
    category: "licencias",
    price: 1457400,
    originalPrice: 1554000,
    priceUSD: 347,
    originalPriceUSD: 370,
    description: "Licencia anual premium con usuarios y facturación ilimitada. La más vendida.",
    longDescription: "La Licencia Anual Premium es nuestra opción más popular. Sin límites de usuarios ni de facturación electrónica, es la solución completa para negocios establecidos que necesitan todas las funcionalidades.",
    features: ["Usuarios ilimitados", "Ventas ilimitadas", "F.E. ilimitada", "La más vendida"],
    specifications: [
      { label: "Duración", value: "12 meses" },
      { label: "Usuarios", value: "Ilimitados" },
      { label: "Ventas por mes", value: "Ilimitadas" },
      { label: "Facturación electrónica", value: "Ilimitada" },
      { label: "Sucursales", value: "1 sucursal" },
      { label: "Soporte", value: "Prioritario WhatsApp + Presencial" },
      { label: "Actualizaciones", value: "Incluidas" },
      { label: "Respaldos", value: "3 diarios en la nube" }
    ],
    includes: [
      "Licencia de software por 12 meses",
      "Instalación en tu equipo",
      "Configuración inicial completa",
      "Carga de productos (hasta 1000)",
      "Capacitación presencial (3 horas)",
      "Configuración de facturación electrónica",
      "Soporte prioritario por WhatsApp",
      "Visitas de soporte presencial incluidas"
    ],
    popular: true,
    isOffer: true
  },
  {
    id: 105,
    slug: "licencia-anual-premium-contabilidad",
    name: "Licencia Anual PREMIUM + Contabilidad",
    category: "licencias",
    price: 2095800,
    originalPrice: 2339400,
    priceUSD: 499,
    originalPriceUSD: 557,
    description: "Licencia premium con módulo de contabilidad integrado. Ahorra 10%.",
    longDescription: "La Licencia Premium + Contabilidad incluye todo lo de la licencia Premium más el módulo de contabilidad completo para llevar tus libros fiscales directamente desde el sistema. Incluye también tienda online gratis.",
    features: ["Todo Premium", "Contabilidad integrada", "Tienda online gratis", "Ahorra 10%"],
    specifications: [
      { label: "Duración", value: "12 meses" },
      { label: "Usuarios", value: "Ilimitados" },
      { label: "Ventas por mes", value: "Ilimitadas" },
      { label: "Facturación electrónica", value: "Ilimitada" },
      { label: "Contabilidad", value: "Módulo completo incluido" },
      { label: "Tienda online", value: "Incluida gratis" },
      { label: "Sucursales", value: "1 sucursal" },
      { label: "Soporte", value: "VIP WhatsApp + Presencial" }
    ],
    includes: [
      "Licencia Premium por 12 meses",
      "Módulo de contabilidad incluido",
      "Tienda online incluida",
      "Instalación en tu equipo",
      "Configuración contable inicial",
      "Capacitación presencial (4 horas)",
      "Soporte VIP prioritario"
    ],
    popular: false,
    isOffer: true
  },
  {
    id: 106,
    slug: "licencia-anual-premium-multitienda-2",
    name: "Licencia Anual PREMIUM Multitienda 2 Sucursales",
    category: "licencias",
    price: 2331000,
    originalPrice: 2914800,
    priceUSD: 555,
    originalPriceUSD: 694,
    description: "Licencia premium para 2 sucursales con todo ilimitado. Ahorra 20%.",
    longDescription: "La Licencia Premium Multitienda para 2 sucursales te permite administrar dos puntos de venta desde un solo panel. Inventarios separados o compartidos, transferencias entre tiendas, reportes consolidados.",
    features: ["2 sucursales", "Usuarios ilimitados", "F.E. ilimitada", "Ahorra 20%"],
    specifications: [
      { label: "Duración", value: "12 meses" },
      { label: "Sucursales", value: "2 sucursales" },
      { label: "Usuarios", value: "Ilimitados" },
      { label: "Ventas por mes", value: "Ilimitadas" },
      { label: "Facturación electrónica", value: "Ilimitada" },
      { label: "Inventarios", value: "Independientes o compartidos" },
      { label: "Transferencias", value: "Entre sucursales" },
      { label: "Reportes", value: "Consolidados o por sucursal" }
    ],
    includes: [
      "Licencia Premium para 2 sucursales",
      "Instalación en ambos puntos de venta",
      "Configuración de inventarios",
      "Capacitación al equipo de cada sucursal",
      "Soporte VIP prioritario",
      "Panel de administración centralizado"
    ],
    popular: true,
    isOffer: true
  },
  {
    id: 107,
    slug: "licencia-anual-premium-multitienda-3",
    name: "Licencia Anual PREMIUM Multitienda 3 Sucursales",
    category: "licencias",
    price: 3494400,
    originalPrice: 4372200,
    priceUSD: 832,
    originalPriceUSD: 1041,
    description: "Licencia premium para 3 sucursales con todo ilimitado. Ahorra 20%.",
    longDescription: "La Licencia Premium Multitienda para 3 sucursales es ideal para cadenas en crecimiento. Administra todos tus puntos de venta desde un panel centralizado con control total.",
    features: ["3 sucursales", "Usuarios ilimitados", "F.E. ilimitada", "Ahorra 20%"],
    specifications: [
      { label: "Duración", value: "12 meses" },
      { label: "Sucursales", value: "3 sucursales" },
      { label: "Usuarios", value: "Ilimitados" },
      { label: "Ventas por mes", value: "Ilimitadas" },
      { label: "Facturación electrónica", value: "Ilimitada" },
      { label: "Inventarios", value: "Independientes o compartidos" },
      { label: "Transferencias", value: "Entre sucursales" },
      { label: "Reportes", value: "Consolidados o por sucursal" }
    ],
    includes: [
      "Licencia Premium para 3 sucursales",
      "Instalación en todos los puntos de venta",
      "Configuración de inventarios multitienda",
      "Capacitación al equipo de cada sucursal",
      "Soporte VIP prioritario",
      "Panel de administración centralizado"
    ],
    popular: false,
    isOffer: true
  },
  {
    id: 108,
    slug: "licencia-2-anos-premium",
    name: "Licencia 2 Años PREMIUM + 2 Meses Gratis",
    category: "licencias",
    price: 2331000,
    originalPrice: 2914800,
    priceUSD: 555,
    originalPriceUSD: 694,
    description: "Licencia premium por 2 años completos + tienda online gratis. Ahorra 20%.",
    longDescription: "Asegura el mejor precio por 2 años completos más 2 meses adicionales gratis. Incluye tienda online gratis. La opción más económica a largo plazo para negocios establecidos.",
    features: ["2 años + 2 meses gratis", "Tienda online gratis", "Mayor ahorro", "Tranquilidad total"],
    specifications: [
      { label: "Duración", value: "26 meses (2 años + 2 meses)" },
      { label: "Usuarios", value: "Ilimitados" },
      { label: "Ventas por mes", value: "Ilimitadas" },
      { label: "Facturación electrónica", value: "Ilimitada" },
      { label: "Tienda online", value: "Incluida gratis" },
      { label: "Sucursales", value: "1 sucursal" },
      { label: "Soporte", value: "VIP por 2 años" },
      { label: "Ahorro", value: "20% vs licencias anuales" }
    ],
    includes: [
      "Licencia Premium por 26 meses",
      "Tienda online incluida",
      "Instalación en tu equipo",
      "Configuración completa",
      "Capacitación presencial (3 horas)",
      "Soporte VIP durante toda la licencia"
    ],
    popular: false,
    isOffer: true
  },
  // ============ MÓDULOS ADICIONALES ============
  {
    id: 201,
    slug: "modulo-contable",
    name: "Módulo Contable",
    category: "modulos",
    price: 882000,
    originalPrice: 1302000,
    priceUSD: 210,
    originalPriceUSD: 310,
    description: "Módulo de contabilidad integrado con el POS. Lleva tus libros fiscales.",
    longDescription: "El Módulo Contable se integra perfectamente con tu sistema POS para automatizar la contabilidad. Genera balances, estados de resultados, libros fiscales y más sin salir del sistema.",
    features: ["Contabilidad automatizada", "Libros fiscales", "Integración total", "Reportes contables"],
    specifications: [
      { label: "Tipo", value: "Módulo adicional (requiere licencia activa)" },
      { label: "Duración", value: "12 meses" },
      { label: "Integración", value: "Automática con POS" },
      { label: "Libros fiscales", value: "Generación automática" },
      { label: "Balance", value: "Generación automática" },
      { label: "Estados financieros", value: "Incluidos" },
      { label: "Exportación", value: "Excel, PDF" },
      { label: "Soporte", value: "Incluido" }
    ],
    includes: [
      "Módulo contable por 12 meses",
      "Configuración del plan de cuentas",
      "Integración con tu licencia POS",
      "Capacitación en el módulo (1 hora)",
      "Soporte especializado"
    ],
    popular: false,
    isOffer: true
  },
  {
    id: 202,
    slug: "modulo-tienda-online",
    name: "Módulo Tienda Online",
    category: "modulos",
    price: 882000,
    originalPrice: 1302000,
    priceUSD: 210,
    originalPriceUSD: 310,
    description: "Tienda online integrada con tu inventario. Vende por internet 24/7.",
    longDescription: "El Módulo Tienda Online te permite tener tu propia tienda virtual integrada con el inventario del POS. Los productos, precios y stock se sincronizan automáticamente.",
    features: ["Tienda 24/7", "Inventario sincronizado", "Pagos online", "Tu propia URL"],
    specifications: [
      { label: "Tipo", value: "Módulo adicional (requiere licencia activa)" },
      { label: "Duración", value: "12 meses" },
      { label: "Productos", value: "Sincronizados con POS" },
      { label: "Inventario", value: "Sincronización automática" },
      { label: "Pagos", value: "Tarjetas, PSE, efectivo" },
      { label: "Dominio", value: "Subdominio incluido" },
      { label: "SSL", value: "Certificado incluido" },
      { label: "Diseño", value: "Personalizable" }
    ],
    includes: [
      "Módulo tienda online por 12 meses",
      "Configuración de productos",
      "Integración de pasarela de pagos",
      "Subdominio personalizado",
      "Capacitación (1 hora)",
      "Soporte técnico"
    ],
    popular: false,
    isOffer: true
  },
  // ============ HARDWARE - IMPRESORAS ============
  {
    id: 1,
    slug: "impresora-termica-80mm",
    name: "Impresora Térmica 80mm",
    category: "impresoras",
    price: 280000,
    image: "/images/impresora-termica-80mm.png",
    description: "Impresora de recibos de alta velocidad, ideal para restaurantes y retail",
    longDescription: "La Impresora Térmica de 80mm es la solución profesional para negocios de alto volumen. Con una velocidad de impresión de 250mm/s, garantiza recibos rápidos y claros. Ideal para restaurantes, supermercados y tiendas con alto tráfico de clientes.",
    features: ["Velocidad 250mm/s", "USB + Ethernet", "Corte automático"],
    specifications: [
      { label: "Ancho de papel", value: "80mm" },
      { label: "Velocidad de impresión", value: "250mm/s" },
      { label: "Resolución", value: "203 DPI" },
      { label: "Conectividad", value: "USB + Ethernet + Serial" },
      { label: "Corte", value: "Automático parcial y total" },
      { label: "Vida útil cabezal", value: "150km" },
      { label: "Ancho máximo impresión", value: "72mm" },
      { label: "Voltaje", value: "24V DC" }
    ],
    includes: [
      "Impresora térmica 80mm",
      "Cable USB",
      "Cable de poder",
      "Rollo de papel de prueba",
      "CD con drivers",
      "Manual de usuario",
      "Instalación y configuración en tu negocio"
    ],
    popular: true
  },
  {
    id: 2,
    slug: "impresora-termica-58mm",
    name: "Impresora Térmica 58mm",
    category: "impresoras",
    price: 150000,
    image: "/images/impresora-termica-58mm.png",
    description: "Impresora compacta perfecta para negocios pequeños",
    longDescription: "La Impresora Térmica de 58mm es perfecta para negocios pequeños que necesitan una solución económica y confiable. Su tamaño compacto la hace ideal para espacios reducidos sin sacrificar calidad de impresión.",
    features: ["Velocidad 90mm/s", "Conexión USB", "Tamaño compacto"],
    specifications: [
      { label: "Ancho de papel", value: "58mm" },
      { label: "Velocidad de impresión", value: "90mm/s" },
      { label: "Resolución", value: "203 DPI" },
      { label: "Conectividad", value: "USB" },
      { label: "Corte", value: "Manual" },
      { label: "Vida útil cabezal", value: "50km" },
      { label: "Ancho máximo impresión", value: "48mm" },
      { label: "Voltaje", value: "12V DC" }
    ],
    includes: [
      "Impresora térmica 58mm",
      "Cable USB",
      "Adaptador de poder",
      "Rollo de papel de prueba",
      "Manual de usuario",
      "Instalación y configuración en tu negocio"
    ],
    popular: false
  },
  {
    id: 3,
    slug: "impresora-etiquetas",
    name: "Impresora de Etiquetas",
    category: "etiquetas",
    price: 450000,
    description: "Imprime etiquetas de códigos de barras y precios",
    longDescription: "La Impresora de Etiquetas profesional te permite crear etiquetas con códigos de barras, precios y descripciones para todos tus productos. Compatible con etiquetas adhesivas de diferentes tamaños y materiales.",
    features: ["Resolución 203dpi", "Ancho hasta 108mm", "USB + Bluetooth"],
    specifications: [
      { label: "Ancho máximo etiqueta", value: "108mm" },
      { label: "Velocidad de impresión", value: "127mm/s" },
      { label: "Resolución", value: "203 DPI" },
      { label: "Conectividad", value: "USB + Bluetooth 4.0" },
      { label: "Método de impresión", value: "Térmica directa / Transferencia" },
      { label: "Memoria", value: "8MB Flash, 8MB SDRAM" },
      { label: "Sensores", value: "Reflectivo y transmisivo" },
      { label: "Voltaje", value: "24V DC" }
    ],
    includes: [
      "Impresora de etiquetas",
      "Cable USB",
      "Cable de poder",
      "Rollo de etiquetas de prueba",
      "Software de diseño de etiquetas",
      "Manual de usuario",
      "Instalación y configuración en tu negocio"
    ],
    popular: false
  },
  {
    id: 4,
    slug: "cajon-monedero-metalico",
    name: "Cajón Monedero Metálico",
    category: "cajones",
    price: 180000,
    image: "/images/cajon-monedero.png",
    description: "Cajón de dinero resistente con apertura automática",
    longDescription: "El Cajón Monedero Metálico es la solución robusta y segura para manejar el efectivo de tu negocio. Construcción en acero con pintura electrostática, apertura automática mediante señal de impresora o manual con llave.",
    features: ["5 espacios billetes", "8 espacios monedas", "Apertura RJ11"],
    specifications: [
      { label: "Material", value: "Acero laminado" },
      { label: "Compartimentos billetes", value: "5 espacios ajustables" },
      { label: "Compartimentos monedas", value: "8 espacios" },
      { label: "Conexión", value: "RJ11 (compatible impresoras)" },
      { label: "Apertura", value: "Automática + llave de seguridad" },
      { label: "Dimensiones", value: "410 x 415 x 100mm" },
      { label: "Peso", value: "6.5kg" },
      { label: "Color", value: "Negro" }
    ],
    includes: [
      "Cajón monedero metálico",
      "2 llaves de seguridad",
      "Cable RJ11",
      "Bandeja removible",
      "Manual de instalación",
      "Instalación y configuración en tu negocio"
    ],
    popular: true
  },
  {
    id: 5,
    slug: "cajon-monedero-compacto",
    name: "Cajón Monedero Compacto",
    category: "cajones",
    price: 120000,
    description: "Cajón económico para negocios pequeños",
    longDescription: "El Cajón Monedero Compacto es ideal para negocios pequeños o puntos de venta con espacio limitado. Ofrece funcionalidad completa en un formato reducido, perfecto para tiendas, cafeterías y quioscos.",
    features: ["4 espacios billetes", "5 espacios monedas", "Apertura RJ11"],
    specifications: [
      { label: "Material", value: "Acero laminado" },
      { label: "Compartimentos billetes", value: "4 espacios" },
      { label: "Compartimentos monedas", value: "5 espacios" },
      { label: "Conexión", value: "RJ11 (compatible impresoras)" },
      { label: "Apertura", value: "Automática + llave de seguridad" },
      { label: "Dimensiones", value: "335 x 335 x 90mm" },
      { label: "Peso", value: "4kg" },
      { label: "Color", value: "Negro" }
    ],
    includes: [
      "Cajón monedero compacto",
      "2 llaves de seguridad",
      "Cable RJ11",
      "Bandeja removible",
      "Manual de instalación",
      "Instalación y configuración en tu negocio"
    ],
    popular: false
  },
  {
    id: 6,
    slug: "lector-codigo-barras-usb",
    name: "Lector de Código de Barras USB",
    category: "lectores",
    price: 85000,
    image: "/images/lector-codigo-barras.png",
    description: "Lector láser con cable USB plug & play",
    longDescription: "El Lector de Código de Barras USB es la solución más práctica y económica para agilizar las ventas en tu negocio. Conexión plug & play, no requiere instalación de drivers. Compatible con todos los códigos de barras estándar.",
    features: ["Lectura láser", "Cable 1.5m", "Compatible Windows/Mac"],
    specifications: [
      { label: "Tipo de lectura", value: "Láser" },
      { label: "Códigos soportados", value: "EAN-13, UPC-A, Code 128, Code 39, QR" },
      { label: "Velocidad de lectura", value: "100 lecturas/segundo" },
      { label: "Distancia de lectura", value: "5-30cm" },
      { label: "Conectividad", value: "USB 2.0" },
      { label: "Longitud cable", value: "1.5 metros" },
      { label: "Indicadores", value: "LED + Beep" },
      { label: "Compatibilidad", value: "Windows, Mac, Linux" }
    ],
    includes: [
      "Lector de código de barras",
      "Cable USB integrado",
      "Base de soporte",
      "Manual de usuario",
      "Instalación y configuración en tu negocio"
    ],
    popular: true
  },
  {
    id: 7,
    slug: "lector-codigo-barras-inalambrico",
    name: "Lector de Código de Barras Inalámbrico",
    category: "lectores",
    price: 150000,
    image: "/images/lector-inalambrico.png",
    description: "Lector con batería recargable y base",
    longDescription: "El Lector de Código de Barras Inalámbrico te da libertad de movimiento en tu negocio. Con alcance de hasta 100 metros y batería de larga duración, es ideal para inventarios, bodegas y tiendas grandes.",
    features: ["Alcance 100m", "Batería 8hrs", "Base de carga incluida"],
    specifications: [
      { label: "Tipo de lectura", value: "Láser" },
      { label: "Códigos soportados", value: "EAN-13, UPC-A, Code 128, Code 39, QR" },
      { label: "Velocidad de lectura", value: "100 lecturas/segundo" },
      { label: "Alcance inalámbrico", value: "Hasta 100 metros" },
      { label: "Conectividad", value: "2.4GHz Wireless + USB" },
      { label: "Batería", value: "Li-ion 1800mAh (8 horas)" },
      { label: "Memoria interna", value: "16MB (almacena 50,000+ códigos)" },
      { label: "Compatibilidad", value: "Windows, Mac, Linux, Android" }
    ],
    includes: [
      "Lector de código de barras inalámbrico",
      "Base de carga con receptor USB",
      "Cable USB de carga",
      "Manual de usuario",
      "Instalación y configuración en tu negocio"
    ],
    popular: false
  },
  {
    id: 8,
    slug: "papel-termico-80mm",
    name: "Papel Térmico 80mm (Caja x 50)",
    category: "papel",
    price: 120000,
    image: "/images/papel-termico-80mm.png",
    description: "Rollos de papel térmico para impresora 80mm",
    longDescription: "Papel térmico de alta calidad para impresoras de 80mm. Excelente definición de impresión y durabilidad. Ideal para recibos, tickets y comandas. Presentación en caja de 50 rollos.",
    features: ["50 rollos por caja", "80mm x 80m", "Alta durabilidad"],
    specifications: [
      { label: "Ancho del rollo", value: "80mm" },
      { label: "Largo del rollo", value: "80 metros" },
      { label: "Diámetro externo", value: "80mm" },
      { label: "Diámetro interno", value: "12mm (estándar)" },
      { label: "Gramaje", value: "55g/m²" },
      { label: "Contenido", value: "50 rollos por caja" },
      { label: "Color", value: "Blanco" },
      { label: "Duración impresión", value: "5+ años" }
    ],
    includes: [
      "Caja con 50 rollos de papel térmico",
      "Empaque protector individual",
      "Entrega en tu negocio"
    ],
    popular: false
  },
  {
    id: 9,
    slug: "papel-termico-58mm",
    name: "Papel Térmico 58mm (Caja x 50)",
    category: "papel",
    price: 85000,
    description: "Rollos de papel térmico para impresora 58mm",
    longDescription: "Papel térmico de alta calidad para impresoras de 58mm. Ideal para impresoras compactas y puntos de venta pequeños. Presentación en caja de 50 rollos.",
    features: ["50 rollos por caja", "58mm x 40m", "Alta durabilidad"],
    specifications: [
      { label: "Ancho del rollo", value: "58mm" },
      { label: "Largo del rollo", value: "40 metros" },
      { label: "Diámetro externo", value: "50mm" },
      { label: "Diámetro interno", value: "12mm (estándar)" },
      { label: "Gramaje", value: "55g/m²" },
      { label: "Contenido", value: "50 rollos por caja" },
      { label: "Color", value: "Blanco" },
      { label: "Duración impresión", value: "5+ años" }
    ],
    includes: [
      "Caja con 50 rollos de papel térmico",
      "Empaque protector individual",
      "Entrega en tu negocio"
    ],
    popular: false
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === "all") return products;
  return products.filter(p => p.category === categoryId);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatPriceUSD = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const getCategoryIcon = (categoryId: string): LucideIcon | null => {
  const category = categories.find(c => c.id === categoryId);
  return category?.icon || null;
};
