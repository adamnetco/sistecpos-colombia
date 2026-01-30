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
  description: string;
  longDescription: string;
  features: string[];
  specifications: ProductSpec[];
  includes: string[];
  popular: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon | null;
}

export const categories: Category[] = [
  { id: "all", name: "Todos", icon: null },
  { id: "impresoras", name: "Impresoras", icon: Printer },
  { id: "etiquetas", name: "Etiquetas", icon: Tag },
  { id: "cajones", name: "Cajones", icon: CircleDollarSign },
  { id: "lectores", name: "Lectores", icon: Barcode },
  { id: "papel", name: "Papel", icon: ScrollText },
  { id: "licencias", name: "Licencias", icon: FileText },
];

export const products: Product[] = [
  {
    id: 1,
    slug: "impresora-termica-80mm",
    name: "Impresora Térmica 80mm",
    category: "impresoras",
    price: 280000,
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
  },
  {
    id: 10,
    slug: "licencia-anual-sistecpos",
    name: "Licencia Anual SistecPOS",
    category: "licencias",
    price: 600000,
    description: "Licencia completa del software con soporte incluido",
    longDescription: "La Licencia Anual SistecPOS te da acceso completo a todas las funcionalidades del software por un año. Incluye soporte prioritario, actualizaciones gratuitas y capacitación inicial. La mejor opción para negocios establecidos.",
    features: ["1 año de uso", "Soporte prioritario", "Actualizaciones gratis"],
    specifications: [
      { label: "Duración", value: "12 meses" },
      { label: "Tipo de licencia", value: "Por punto de venta" },
      { label: "Usuarios incluidos", value: "Ilimitados" },
      { label: "Productos", value: "Ilimitados" },
      { label: "Reportes", value: "Completos" },
      { label: "Soporte", value: "Prioritario (WhatsApp + Presencial)" },
      { label: "Actualizaciones", value: "Incluidas" },
      { label: "Respaldos", value: "Automáticos en la nube" }
    ],
    includes: [
      "Licencia de software por 12 meses",
      "Instalación en tu equipo",
      "Configuración inicial completa",
      "Carga de productos (hasta 500)",
      "Capacitación presencial (2 horas)",
      "Soporte prioritario por WhatsApp",
      "Visitas de soporte presencial"
    ],
    popular: true
  },
  {
    id: 11,
    slug: "licencia-mensual-sistecpos",
    name: "Licencia Mensual SistecPOS",
    category: "licencias",
    price: 60000,
    description: "Licencia mensual flexible para empezar",
    longDescription: "La Licencia Mensual SistecPOS es perfecta para negocios nuevos o que quieren probar el sistema sin compromiso a largo plazo. Paga mes a mes y escala cuando lo necesites.",
    features: ["Pago mensual", "Soporte incluido", "Sin permanencia"],
    specifications: [
      { label: "Duración", value: "Mensual renovable" },
      { label: "Tipo de licencia", value: "Por punto de venta" },
      { label: "Usuarios incluidos", value: "Ilimitados" },
      { label: "Productos", value: "Ilimitados" },
      { label: "Reportes", value: "Completos" },
      { label: "Soporte", value: "Estándar (WhatsApp)" },
      { label: "Actualizaciones", value: "Incluidas" },
      { label: "Permanencia", value: "Sin contrato" }
    ],
    includes: [
      "Licencia de software mensual",
      "Instalación en tu equipo (primera vez)",
      "Configuración inicial",
      "Carga de productos (hasta 200)",
      "Capacitación remota (1 hora)",
      "Soporte por WhatsApp"
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

export const getCategoryIcon = (categoryId: string): LucideIcon | null => {
  const category = categories.find(c => c.id === categoryId);
  return category?.icon || null;
};
