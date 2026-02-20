import { 
  Utensils, ShoppingCart, Shirt, Wrench, Laptop, Scissors, 
  Store, Building2, Stethoscope, PawPrint, Globe, Banknote,
  Settings, BookOpen, Briefcase, Warehouse, Package, Pill,
  CakeSlice, Apple, Beef, Coffee, Car, Glasses,
  IceCreamCone, Wine, Pizza, Gem
} from "lucide-react";

export interface BusinessType {
  slug: string;
  title: string;
  titleShort: string;
  description: string;
  longDescription: string;
  icon: typeof Utensils;
  color: string;
  heroImage?: string;
  features: string[];
  modules: string[];
  benefits: {
    title: string;
    description: string;
  }[];
  cta: string;
  metaTitle: string;
  metaDescription: string;
}

export const businessTypes: BusinessType[] = [
  {
    slug: "restaurantes",
    title: "POS para Restaurantes",
    titleShort: "Restaurantes",
    description: "Restaurantes, bares, cantinas y comidas rápidas.",
    longDescription: "Sistema POS especializado para restaurantes con control de mesas, comandas de cocina, división de cuentas y monitor KDS. Ideal para restaurantes, bares, cantinas, comidas rápidas y cualquier negocio gastronómico.",
    icon: Utensils,
    color: "bg-orange-500/10 text-orange-600",
    features: [
      "Control de mesas y zonas",
      "Comandas de cocina impresas",
      "Monitor KDS para cocina",
      "División de cuentas",
      "Propinas y servicio",
      "Recetas y costos",
      "Reservas de mesas",
      "Domicilios integrados"
    ],
    modules: ["Mesas", "Comandas", "KDS", "Recetas", "Inventario", "Reportes"],
    benefits: [
      { title: "Reduce errores", description: "Las comandas van directo a cocina, eliminando errores de transcripción" },
      { title: "Control de costos", description: "Conoce el costo real de cada plato con el módulo de recetas" },
      { title: "Más rotación", description: "Agiliza el servicio y aumenta la rotación de mesas" },
    ],
    cta: "Agenda tu demo para restaurantes",
    metaTitle: "Software POS para Restaurantes en Bucaramanga | SistecPOS",
    metaDescription: "Sistema POS especializado para restaurantes con control de mesas, comandas de cocina y monitor KDS. Instalación presencial en Santander."
  },
  {
    slug: "mini-market",
    title: "POS para Mini Market",
    titleShort: "Mini Market",
    description: "Tiendas, supermercados y autoservicios.",
    longDescription: "Software punto de venta para mini markets y tiendas de barrio con control de inventario, lector de código de barras y gestión de proveedores. Perfecto para tiendas, supermercados y autoservicios.",
    icon: ShoppingCart,
    color: "bg-blue-500/10 text-blue-600",
    features: [
      "Lector de código de barras",
      "Control de inventario",
      "Alertas de stock bajo",
      "Gestión de proveedores",
      "Precios por unidad y granel",
      "Ofertas y promociones",
      "Ventas fiadas",
      "Básculas integradas"
    ],
    modules: ["Inventario", "Proveedores", "Clientes", "Reportes", "Facturación"],
    benefits: [
      { title: "Nunca te quedes sin stock", description: "Alertas automáticas cuando un producto está por agotarse" },
      { title: "Control total", description: "Sabe exactamente qué productos rotan más y cuáles no" },
      { title: "Ventas más rápidas", description: "Con lector de barras, cobra en segundos" },
    ],
    cta: "Agenda tu demo para mini market",
    metaTitle: "Software POS para Mini Market y Tiendas | SistecPOS",
    metaDescription: "Sistema POS para mini markets con control de inventario, lector de códigos y ventas rápidas. Instalación en Bucaramanga y Santander."
  },
  {
    slug: "almacen",
    title: "POS para Almacenes",
    titleShort: "Almacén",
    description: "Compra y venta de mercancías en general.",
    longDescription: "Sistema POS completo para almacenes de compra y venta de mercancías. Control de inventario, proveedores, clientes y facturación en un solo lugar.",
    icon: Store,
    color: "bg-indigo-500/10 text-indigo-600",
    features: [
      "Catálogo de productos ilimitado",
      "Gestión de proveedores",
      "Control de inventario",
      "Múltiples listas de precios",
      "Facturación electrónica",
      "Reportes de ventas",
      "Clientes y créditos",
      "Importación desde Excel"
    ],
    modules: ["Inventario", "Proveedores", "Clientes", "Facturación", "Reportes"],
    benefits: [
      { title: "Organiza tu almacén", description: "Todos tus productos catalogados y controlados" },
      { title: "Múltiples precios", description: "Diferentes precios para mayoristas y minoristas" },
      { title: "Importa tu inventario", description: "Sube tus productos desde Excel en minutos" },
    ],
    cta: "Agenda tu demo para almacenes",
    metaTitle: "Software POS para Almacenes | SistecPOS Bucaramanga",
    metaDescription: "Sistema POS para almacenes con inventario, proveedores y facturación. Instalación presencial en Santander."
  },
  {
    slug: "moda-calzado",
    title: "POS para Tiendas de Moda",
    titleShort: "Moda y Calzado",
    description: "Tiendas de moda, ropa, calzado y accesorios.",
    longDescription: "Software POS especializado para tiendas de moda, ropa y calzado con control de tallas, colores y variantes. Gestiona tu inventario por temporadas.",
    icon: Shirt,
    color: "bg-pink-500/10 text-pink-600",
    features: [
      "Control de tallas y colores",
      "Variantes de productos",
      "Gestión por temporadas",
      "Etiquetas con código de barras",
      "Promociones y descuentos",
      "Ventas a crédito",
      "Apartados de mercancía",
      "Reportes por categoría"
    ],
    modules: ["Inventario", "Variantes", "Clientes", "Promociones", "Reportes"],
    benefits: [
      { title: "Control de variantes", description: "Gestiona tallas S, M, L, XL y colores fácilmente" },
      { title: "Temporadas", description: "Organiza tu inventario por temporadas y colecciones" },
      { title: "Apartados", description: "Permite a tus clientes apartar productos" },
    ],
    cta: "Agenda tu demo para tiendas de moda",
    metaTitle: "Software POS para Tiendas de Ropa y Calzado | SistecPOS",
    metaDescription: "Sistema POS para tiendas de moda con control de tallas, colores y temporadas. Instalación en Bucaramanga."
  },
  {
    slug: "ferreterias",
    title: "POS para Ferreterías",
    titleShort: "Ferreterías",
    description: "Ferreterías, eléctricos y materiales de construcción.",
    longDescription: "Sistema POS diseñado para ferreterías con miles de productos. Importación masiva desde Excel, búsqueda rápida y control de inventario robusto.",
    icon: Wrench,
    color: "bg-amber-500/10 text-amber-600",
    features: [
      "Catálogo de +10,000 productos",
      "Importación masiva Excel",
      "Búsqueda rápida por código",
      "Múltiples unidades de medida",
      "Listas de precios por cliente",
      "Control de inventario",
      "Ventas a crédito",
      "Facturación electrónica"
    ],
    modules: ["Inventario", "Proveedores", "Clientes", "Facturación", "Reportes"],
    benefits: [
      { title: "Miles de productos", description: "Maneja catálogos extensos sin problemas" },
      { title: "Importación rápida", description: "Sube tu inventario completo desde Excel" },
      { title: "Búsqueda inteligente", description: "Encuentra cualquier producto en segundos" },
    ],
    cta: "Agenda tu demo para ferreterías",
    metaTitle: "Software POS para Ferreterías | SistecPOS Bucaramanga",
    metaDescription: "Sistema POS para ferreterías con catálogo extenso e importación desde Excel. Instalación presencial en Santander."
  },
  {
    slug: "papelerias",
    title: "POS para Papelerías",
    titleShort: "Papelerías",
    description: "Papelerías, librerías y misceláneas.",
    longDescription: "Software POS para papelerías y misceláneas con control de productos variados, recargas, servicios y ventas rápidas.",
    icon: BookOpen,
    color: "bg-teal-500/10 text-teal-600",
    features: [
      "Productos y servicios",
      "Recargas de celular",
      "Impresiones y copias",
      "Control de inventario",
      "Ventas rápidas",
      "Clientes frecuentes",
      "Reportes de ventas",
      "Caja registradora"
    ],
    modules: ["Inventario", "Servicios", "Clientes", "Caja", "Reportes"],
    benefits: [
      { title: "Todo en uno", description: "Productos, servicios y recargas en un solo sistema" },
      { title: "Ventas rápidas", description: "Cobra en segundos con atajos de teclado" },
      { title: "Control de caja", description: "Sabe cuánto dinero tienes en caja siempre" },
    ],
    cta: "Agenda tu demo para papelerías",
    metaTitle: "Software POS para Papelerías y Misceláneas | SistecPOS",
    metaDescription: "Sistema POS para papelerías con productos, servicios y recargas. Instalación en Bucaramanga y Santander."
  },
  {
    slug: "tecnologia",
    title: "POS para Tiendas de Tecnología",
    titleShort: "Tecnología",
    description: "Computadoras, móviles y electrodomésticos.",
    longDescription: "Sistema POS para almacenes de tecnología con control de seriales, garantías y servicio técnico integrado.",
    icon: Laptop,
    color: "bg-cyan-500/10 text-cyan-600",
    features: [
      "Control de seriales/IMEI",
      "Gestión de garantías",
      "Servicio técnico integrado",
      "Catálogo de accesorios",
      "Ventas a crédito",
      "Proveedores",
      "Reportes detallados",
      "Facturación electrónica"
    ],
    modules: ["Inventario", "Seriales", "Garantías", "Servicio Técnico", "Reportes"],
    benefits: [
      { title: "Control de seriales", description: "Rastrea cada equipo por su serial o IMEI" },
      { title: "Garantías", description: "Gestiona garantías y fechas de vencimiento" },
      { title: "Servicio técnico", description: "Recibe equipos para reparación y haz seguimiento" },
    ],
    cta: "Agenda tu demo para tecnología",
    metaTitle: "Software POS para Tiendas de Tecnología | SistecPOS",
    metaDescription: "Sistema POS para almacenes de tecnología con seriales, garantías y servicio técnico. Instalación en Santander."
  },
  {
    slug: "salon-belleza",
    title: "POS para Salones de Belleza",
    titleShort: "Salón de Belleza",
    description: "Salones de belleza, spas y centros de estética.",
    longDescription: "Software POS para salones de belleza con agenda de citas, servicios, productos y comisiones por estilista.",
    icon: Scissors,
    color: "bg-purple-500/10 text-purple-600",
    features: [
      "Agenda de citas",
      "Servicios y tratamientos",
      "Comisiones por estilista",
      "Venta de productos",
      "Clientes frecuentes",
      "Paquetes y promociones",
      "Control de inventario",
      "Reportes por servicio"
    ],
    modules: ["Agenda", "Servicios", "Comisiones", "Inventario", "Reportes"],
    benefits: [
      { title: "Agenda digital", description: "Tus clientes agendan citas fácilmente" },
      { title: "Comisiones automáticas", description: "Calcula comisiones de cada estilista" },
      { title: "Fidelización", description: "Premia a tus clientes frecuentes" },
    ],
    cta: "Agenda tu demo para salones de belleza",
    metaTitle: "Software POS para Salones de Belleza y Spa | SistecPOS",
    metaDescription: "Sistema POS para salones de belleza con agenda, comisiones y servicios. Instalación en Bucaramanga."
  },
  {
    slug: "tienda-online",
    title: "POS con Tienda Online",
    titleShort: "Tienda Online",
    description: "Tiendas en línea con inventario centralizado.",
    longDescription: "Integra tu punto de venta físico con tu tienda online. Inventario sincronizado, pedidos unificados y gestión centralizada.",
    icon: Globe,
    color: "bg-green-500/10 text-green-600",
    features: [
      "Tienda web integrada",
      "Inventario sincronizado",
      "Pedidos online",
      "Pagos en línea",
      "Gestión de envíos",
      "Catálogo web",
      "Notificaciones",
      "Reportes unificados"
    ],
    modules: ["Tienda Web", "Inventario", "Pedidos", "Envíos", "Reportes"],
    benefits: [
      { title: "Vende 24/7", description: "Tu tienda online abierta todo el tiempo" },
      { title: "Inventario único", description: "No vendas lo que no tienes" },
      { title: "Gestión central", description: "Administra todo desde un solo lugar" },
    ],
    cta: "Agenda tu demo de tienda online",
    metaTitle: "Software POS con Tienda Online Integrada | SistecPOS",
    metaDescription: "Sistema POS con tienda online integrada e inventario sincronizado. Instalación en Santander."
  },
  {
    slug: "casas-cambio",
    title: "POS para Casas de Cambio",
    titleShort: "Casas de Cambio",
    description: "Compra y venta de divisas y giros internacionales.",
    longDescription: "Software especializado para casas de cambio con control de divisas, tasas de cambio, giros y cumplimiento normativo.",
    icon: Banknote,
    color: "bg-emerald-500/10 text-emerald-600",
    features: [
      "Múltiples divisas",
      "Tasas de cambio en tiempo real",
      "Giros internacionales",
      "Control de efectivo",
      "Reportes UIAF",
      "Clientes registrados",
      "Límites de operación",
      "Arqueo de caja"
    ],
    modules: ["Divisas", "Giros", "Clientes", "Reportes", "Cumplimiento"],
    benefits: [
      { title: "Multi-divisa", description: "Maneja USD, EUR, VES y más" },
      { title: "Cumplimiento", description: "Reportes para entidades reguladoras" },
      { title: "Control de caja", description: "Arqueo preciso de cada moneda" },
    ],
    cta: "Agenda tu demo para casas de cambio",
    metaTitle: "Software POS para Casas de Cambio | SistecPOS",
    metaDescription: "Sistema POS para casas de cambio con divisas, giros y reportes UIAF. Instalación en Bucaramanga."
  },
  {
    slug: "servicio-tecnico",
    title: "POS para Servicio Técnico",
    titleShort: "Servicio Técnico",
    description: "Reparación de tecnología, automotriz y herramientas.",
    longDescription: "Software POS con módulo de servicio técnico para talleres de reparación. Control de órdenes de servicio, repuestos y seguimiento.",
    icon: Settings,
    color: "bg-slate-500/10 text-slate-600",
    features: [
      "Órdenes de servicio",
      "Estados de reparación",
      "Notificaciones al cliente",
      "Control de repuestos",
      "Garantías de servicio",
      "Cotizaciones",
      "Historial por cliente",
      "Reportes de productividad"
    ],
    modules: ["Órdenes", "Repuestos", "Clientes", "Garantías", "Reportes"],
    benefits: [
      { title: "Seguimiento completo", description: "El cliente sabe el estado de su equipo" },
      { title: "Historial", description: "Consulta reparaciones anteriores de cada cliente" },
      { title: "Control de repuestos", description: "Sabe qué repuestos usaste en cada orden" },
    ],
    cta: "Agenda tu demo para servicio técnico",
    metaTitle: "Software POS para Servicio Técnico | SistecPOS",
    metaDescription: "Sistema POS con órdenes de servicio, repuestos y seguimiento. Instalación en Santander."
  },
  {
    slug: "multi-tienda",
    title: "POS Multi-tienda",
    titleShort: "Multi-tienda",
    description: "Varias tiendas bajo una sola administración.",
    longDescription: "Administra múltiples sucursales desde un solo lugar. Inventarios separados o centralizados, reportes consolidados y control total.",
    icon: Building2,
    color: "bg-violet-500/10 text-violet-600",
    features: [
      "Múltiples sucursales",
      "Inventarios por sede",
      "Traslados entre tiendas",
      "Reportes consolidados",
      "Usuarios por sucursal",
      "Precios diferenciados",
      "Control centralizado",
      "Dashboard gerencial"
    ],
    modules: ["Multi-sede", "Traslados", "Inventario", "Usuarios", "Reportes"],
    benefits: [
      { title: "Vista gerencial", description: "Ve todas tus tiendas en un dashboard" },
      { title: "Traslados fáciles", description: "Mueve inventario entre sucursales" },
      { title: "Reportes unificados", description: "Compara el rendimiento de cada tienda" },
    ],
    cta: "Agenda tu demo multi-tienda",
    metaTitle: "Software POS Multi-tienda | SistecPOS",
    metaDescription: "Sistema POS para múltiples sucursales con inventario centralizado. Instalación en Bucaramanga."
  },
  {
    slug: "consultorios",
    title: "POS para Consultorios",
    titleShort: "Consultorios",
    description: "Atención médica, odontológica y especializada.",
    longDescription: "Software POS para consultorios médicos y odontológicos con agenda de citas, historia clínica y facturación de servicios.",
    icon: Stethoscope,
    color: "bg-red-500/10 text-red-600",
    features: [
      "Agenda de citas",
      "Historia clínica básica",
      "Servicios médicos",
      "Venta de medicamentos",
      "Facturación",
      "Recordatorios",
      "Pacientes registrados",
      "Reportes"
    ],
    modules: ["Agenda", "Pacientes", "Servicios", "Facturación", "Reportes"],
    benefits: [
      { title: "Agenda organizada", description: "Nunca pierdas una cita" },
      { title: "Historial de pacientes", description: "Consulta visitas anteriores" },
      { title: "Facturación integrada", description: "Cobra servicios y productos" },
    ],
    cta: "Agenda tu demo para consultorios",
    metaTitle: "Software POS para Consultorios Médicos | SistecPOS",
    metaDescription: "Sistema POS para consultorios con agenda, pacientes y facturación. Instalación en Santander."
  },
  {
    slug: "veterinarias",
    title: "POS para Veterinarias",
    titleShort: "Veterinarias",
    description: "Veterinarias y clínicas de animales.",
    longDescription: "Software POS para veterinarias con fichas de pacientes (mascotas), agenda de citas, servicios y venta de productos.",
    icon: PawPrint,
    color: "bg-lime-500/10 text-lime-600",
    features: [
      "Fichas de mascotas",
      "Agenda de citas",
      "Servicios veterinarios",
      "Venta de productos",
      "Vacunas y tratamientos",
      "Recordatorios",
      "Dueños registrados",
      "Reportes"
    ],
    modules: ["Pacientes", "Agenda", "Servicios", "Inventario", "Reportes"],
    benefits: [
      { title: "Fichas completas", description: "Historial de cada mascota" },
      { title: "Recordatorios", description: "Avisa sobre vacunas pendientes" },
      { title: "Venta integrada", description: "Productos y servicios en un solo cobro" },
    ],
    cta: "Agenda tu demo para veterinarias",
    metaTitle: "Software POS para Veterinarias | SistecPOS",
    metaDescription: "Sistema POS para veterinarias con fichas de mascotas y agenda. Instalación en Bucaramanga."
  },
  {
    slug: "multi-moneda",
    title: "POS Multi-moneda",
    titleShort: "Multi-moneda",
    description: "Negocios que operan con diferentes monedas.",
    longDescription: "Software POS que permite facturar en múltiples monedas. Ideal para zonas fronterizas y negocios con clientes internacionales.",
    icon: Warehouse,
    color: "bg-yellow-500/10 text-yellow-600",
    features: [
      "Hasta 3 monedas",
      "Tasas de cambio",
      "Facturación dual",
      "Reportes por moneda",
      "Caja multi-divisa",
      "Precios en USD y COP",
      "Arqueo separado",
      "Conversión automática"
    ],
    modules: ["Divisas", "Facturación", "Caja", "Reportes"],
    benefits: [
      { title: "Flexibilidad", description: "Acepta USD, COP, VES según tu zona" },
      { title: "Tasas automáticas", description: "Actualiza tasas de cambio fácilmente" },
      { title: "Reportes claros", description: "Sabe cuánto vendiste en cada moneda" },
    ],
    cta: "Agenda tu demo multi-moneda",
    metaTitle: "Software POS Multi-moneda | SistecPOS",
    metaDescription: "Sistema POS con múltiples monedas para zonas fronterizas. Instalación en Santander."
  },
  {
    slug: "droguerias",
    title: "POS para Droguerías",
    titleShort: "Droguerías",
    description: "Farmacias, droguerías y productos de salud.",
    longDescription: "Software POS para droguerías con control de medicamentos, fechas de vencimiento, lotes y facturación electrónica.",
    icon: Pill,
    color: "bg-rose-500/10 text-rose-600",
    features: [
      "Control de vencimientos",
      "Lotes de productos",
      "Medicamentos controlados",
      "Recetas médicas",
      "Alertas de stock",
      "Proveedores",
      "Facturación electrónica",
      "Reportes INVIMA"
    ],
    modules: ["Inventario", "Vencimientos", "Lotes", "Proveedores", "Reportes"],
    benefits: [
      { title: "Control de vencimientos", description: "Nunca vendas productos vencidos" },
      { title: "Trazabilidad", description: "Rastrea cada lote de medicamentos" },
      { title: "Cumplimiento", description: "Reportes para entidades de salud" },
    ],
    cta: "Agenda tu demo para droguerías",
    metaTitle: "Software POS para Droguerías y Farmacias | SistecPOS",
    metaDescription: "Sistema POS para droguerías con vencimientos, lotes y facturación. Instalación en Bucaramanga."
  },
  {
    slug: "panaderias",
    title: "POS para Panaderías",
    titleShort: "Panaderías",
    description: "Panaderías, pastelerías y repostería.",
    longDescription: "Software POS para panaderías con control de producción, ventas rápidas y gestión de pedidos especiales.",
    icon: CakeSlice,
    color: "bg-orange-400/10 text-orange-500",
    features: [
      "Ventas rápidas",
      "Producción diaria",
      "Pedidos especiales",
      "Control de ingredientes",
      "Recetas y costos",
      "Clientes frecuentes",
      "Domicilios",
      "Reportes de producción"
    ],
    modules: ["Ventas", "Producción", "Pedidos", "Inventario", "Reportes"],
    benefits: [
      { title: "Producción organizada", description: "Planifica la producción diaria" },
      { title: "Pedidos especiales", description: "Gestiona tortas y pedidos a medida" },
      { title: "Costos por receta", description: "Conoce el costo real de cada producto" },
    ],
    cta: "Agenda tu demo para panaderías",
    metaTitle: "Software POS para Panaderías y Pastelerías | SistecPOS",
    metaDescription: "Sistema POS para panaderías con producción y pedidos. Instalación en Santander."
  },
  {
    slug: "fruver",
    title: "POS para Fruterías y Verduras",
    titleShort: "Fruver",
    description: "Fruterías, verdulerías y productos frescos.",
    longDescription: "Software POS para fruterías y verdulerías con integración de básculas, venta por peso y control de mermas.",
    icon: Apple,
    color: "bg-green-400/10 text-green-500",
    features: [
      "Integración de básculas",
      "Venta por peso",
      "Control de mermas",
      "Precios del día",
      "Inventario de frescos",
      "Proveedores",
      "Ventas rápidas",
      "Reportes de merma"
    ],
    modules: ["Básculas", "Inventario", "Proveedores", "Ventas", "Reportes"],
    benefits: [
      { title: "Básculas integradas", description: "El peso va directo a la factura" },
      { title: "Control de mermas", description: "Sabe cuánto pierdes por día" },
      { title: "Precios flexibles", description: "Actualiza precios según el mercado" },
    ],
    cta: "Agenda tu demo para fruver",
    metaTitle: "Software POS para Fruterías y Verdulerías | SistecPOS",
    metaDescription: "Sistema POS para fruterías con básculas integradas. Instalación en Bucaramanga."
  },
  {
    slug: "carnicerias",
    title: "POS para Carnicerías",
    titleShort: "Carnicerías",
    description: "Carnicerías con integración de básculas.",
    longDescription: "Software POS para carnicerías y expendios de carne con básculas integradas, cortes especiales y control de inventario por peso.",
    icon: Beef,
    color: "bg-red-400/10 text-red-500",
    features: [
      "Básculas integradas",
      "Cortes de carne",
      "Inventario por peso",
      "Precios por kilo",
      "Control de mermas",
      "Proveedores",
      "Facturación",
      "Reportes de ventas"
    ],
    modules: ["Básculas", "Inventario", "Proveedores", "Ventas", "Reportes"],
    benefits: [
      { title: "Peso exacto", description: "Conecta tu báscula y cobra al gramo" },
      { title: "Cortes especiales", description: "Gestiona diferentes tipos de corte" },
      { title: "Control de merma", description: "Optimiza tu inventario de carne" },
    ],
    cta: "Agenda tu demo para carnicerías",
    metaTitle: "Software POS para Carnicerías | SistecPOS",
    metaDescription: "Sistema POS para carnicerías con básculas integradas. Instalación en Santander."
  },
  {
    slug: "cafeterias",
    title: "POS para Cafeterías",
    titleShort: "Cafeterías",
    description: "Cafeterías, juguerías y bebidas.",
    longDescription: "Software POS para cafeterías con ventas rápidas, modificadores de productos y control de ingredientes.",
    icon: Coffee,
    color: "bg-amber-400/10 text-amber-500",
    features: [
      "Ventas rápidas",
      "Modificadores (tamaño, azúcar)",
      "Combos y promociones",
      "Control de ingredientes",
      "Impresión de órdenes",
      "Fila de pedidos",
      "Domicilios",
      "Reportes"
    ],
    modules: ["Ventas", "Modificadores", "Ingredientes", "Pedidos", "Reportes"],
    benefits: [
      { title: "Pedidos personalizados", description: "Grande, mediano, sin azúcar, etc." },
      { title: "Fila organizada", description: "Gestiona los pedidos en orden" },
      { title: "Combos", description: "Crea combos y aumenta el ticket promedio" },
    ],
    cta: "Agenda tu demo para cafeterías",
    metaTitle: "Software POS para Cafeterías | SistecPOS",
    metaDescription: "Sistema POS para cafeterías con modificadores y combos. Instalación en Bucaramanga."
  },
  {
    slug: "distribuidoras",
    title: "POS para Distribuidoras",
    titleShort: "Distribuidoras",
    description: "Distribuidoras mayoristas y logística.",
    longDescription: "Software POS para distribuidoras mayoristas con gestión de rutas, preventas y control de cartera.",
    icon: Package,
    color: "bg-blue-400/10 text-blue-500",
    features: [
      "Ventas mayoristas",
      "Rutas de distribución",
      "Preventas",
      "Control de cartera",
      "Múltiples bodegas",
      "Precios por volumen",
      "Facturación masiva",
      "Reportes de rutas"
    ],
    modules: ["Ventas", "Rutas", "Cartera", "Bodegas", "Reportes"],
    benefits: [
      { title: "Rutas organizadas", description: "Gestiona tus rutas de distribución" },
      { title: "Preventas", description: "Toma pedidos antes de despachar" },
      { title: "Cartera controlada", description: "Sabe quién te debe y cuánto" },
    ],
    cta: "Agenda tu demo para distribuidoras",
    metaTitle: "Software POS para Distribuidoras | SistecPOS",
    metaDescription: "Sistema POS para distribuidoras con rutas y preventas. Instalación en Santander."
  },
  {
    slug: "gastrobar",
    title: "POS para Gastrobares",
    titleShort: "Gastrobar",
    description: "Gastrobares y coctelería especializada.",
    longDescription: "Software POS para gastrobares con control de bar, coctelería, mesas y comandas divididas entre cocina y bar.",
    icon: Briefcase,
    color: "bg-purple-400/10 text-purple-500",
    features: [
      "Control de bar",
      "Recetas de cocteles",
      "Comandas a bar y cocina",
      "Control de mesas",
      "División de cuentas",
      "Inventario de licores",
      "Happy hour automático",
      "Reportes de consumo"
    ],
    modules: ["Mesas", "Bar", "Cocina", "Recetas", "Reportes"],
    benefits: [
      { title: "Bar organizado", description: "Comandas separadas para bar y cocina" },
      { title: "Happy hour", description: "Precios especiales automáticos por horario" },
      { title: "Control de licores", description: "Sabe cuánto se consume de cada botella" },
    ],
    cta: "Agenda tu demo para gastrobares",
    metaTitle: "Software POS para Gastrobares | SistecPOS",
    metaDescription: "Sistema POS para gastrobares con bar y coctelería. Instalación en Bucaramanga."
  },
  {
    slug: "opticas",
    title: "POS para Ópticas",
    titleShort: "Ópticas",
    description: "Ópticas y tiendas de lentes.",
    longDescription: "Software POS para ópticas con gestión de fórmulas, inventario de monturas y lentes, y pedidos especiales.",
    icon: Glasses,
    color: "bg-sky-500/10 text-sky-600",
    features: [
      "Gestión de fórmulas",
      "Pedidos de lentes",
      "Inventario de monturas",
      "Órdenes de laboratorio",
      "Clientes y fórmulas",
      "Garantías",
      "Facturación",
      "Reportes"
    ],
    modules: ["Fórmulas", "Inventario", "Pedidos", "Clientes", "Reportes"],
    benefits: [
      { title: "Fórmulas guardadas", description: "Historial de fórmulas de cada cliente" },
      { title: "Pedidos a laboratorio", description: "Gestiona pedidos de lentes especiales" },
      { title: "Inventario de monturas", description: "Control de marcas y modelos" },
    ],
    cta: "Agenda tu demo para ópticas",
    metaTitle: "Software POS para Ópticas | SistecPOS",
    metaDescription: "Sistema POS para ópticas con fórmulas y pedidos. Instalación en Santander."
  },
  {
    slug: "lavaderos-autos",
    title: "POS para Lavaderos de Autos",
    titleShort: "Lavaderos",
    description: "Lavaderos de autos y servicios automotrices.",
    longDescription: "Software POS para lavaderos de autos con servicios, turnos y comisiones por empleado.",
    icon: Car,
    color: "bg-blue-600/10 text-blue-700",
    features: [
      "Servicios de lavado",
      "Turnos de atención",
      "Comisiones por empleado",
      "Clientes frecuentes",
      "Paquetes de servicios",
      "Productos adicionales",
      "Facturación",
      "Reportes"
    ],
    modules: ["Servicios", "Turnos", "Comisiones", "Clientes", "Reportes"],
    benefits: [
      { title: "Turnos organizados", description: "Gestiona la fila de vehículos" },
      { title: "Comisiones automáticas", description: "Calcula pagos por servicio" },
      { title: "Clientes VIP", description: "Fideliza con tarjetas de puntos" },
    ],
    cta: "Agenda tu demo para lavaderos",
    metaTitle: "Software POS para Lavaderos de Autos | SistecPOS",
    metaDescription: "Sistema POS para lavaderos con turnos y comisiones. Instalación en Bucaramanga."
  },
  {
    slug: "heladerias",
    title: "POS para Heladerías y Fruterías",
    titleShort: "Heladerías",
    description: "Heladerías, fruterías, juguerías y postres.",
    longDescription: "Software POS especializado para heladerías y fruterías con gestión de toppings, porciones, combos de helado y control de insumos perecederos. Ideal para heladerías artesanales, fruterías con jugos naturales, açaí bowls y negocios de postres fríos.",
    icon: IceCreamCone,
    color: "bg-fuchsia-400/10 text-fuchsia-500",
    features: [
      "Toppings y porciones",
      "Combos de helado",
      "Ventas rápidas",
      "Control de insumos perecederos",
      "Modificadores de producto",
      "Domicilios integrados",
      "Facturación electrónica",
      "Reportes de merma"
    ],
    modules: ["Ventas", "Modificadores", "Ingredientes", "Inventario", "Reportes"],
    benefits: [
      { title: "Personalización total", description: "Toppings, salsas y porciones configurables por producto" },
      { title: "Control de merma", description: "Registra pérdidas de insumos perecederos (frutas, crema)" },
      { title: "Ventas ágiles", description: "Despacha rápido con pantalla táctil y atajos" },
    ],
    cta: "Agenda tu demo para heladerías",
    metaTitle: "Software POS para Heladerías y Fruterías | SistecPOS",
    metaDescription: "Sistema POS para heladerías y fruterías con toppings, combos y control de insumos. Instalación presencial en Colombia."
  },
  {
    slug: "bares-discotecas",
    title: "POS para Bares y Discotecas",
    titleShort: "Bares y Discotecas",
    description: "Bares, discotecas, lounges y vida nocturna.",
    longDescription: "Software POS para bares y discotecas con control de barra, cuentas abiertas, cierres de caja por turnos e inventario de licores por onza. Diseñado para ambientes de alta congestión y turnos nocturnos.",
    icon: Wine,
    color: "bg-violet-400/10 text-violet-500",
    features: [
      "Cuentas abiertas",
      "Control de barra por onza",
      "Cierres de caja por turno",
      "Inventario de licores",
      "Prevención de fugas",
      "Happy hour automático",
      "Facturación electrónica",
      "Reportes por turno"
    ],
    modules: ["Barra", "Cuentas", "Inventario", "Turnos", "Reportes"],
    benefits: [
      { title: "Cuentas abiertas", description: "Los clientes consumen y pagan al final sin perder el control" },
      { title: "Sin fugas de inventario", description: "Controla cada onza de licor servida vs vendida" },
      { title: "Cierres por turno", description: "Cada mesero cuadra su caja al final del turno" },
    ],
    cta: "Agenda tu demo para bares",
    metaTitle: "Software POS para Bares y Discotecas | SistecPOS",
    metaDescription: "Sistema POS para bares y discotecas con cuentas abiertas, control de barra y cierres por turno. Instalación presencial en Colombia."
  },
  {
    slug: "pizzerias",
    title: "POS para Pizzerías y Comidas Rápidas",
    titleShort: "Pizzerías",
    description: "Pizzerías, comidas rápidas y domicilios.",
    longDescription: "Software POS para pizzerías y comidas rápidas con integración profunda de domicilios, captura rápida de datos del cliente para facturación electrónica y zonas de entrega configurables. Optimizado para alto volumen de pedidos.",
    icon: Pizza,
    color: "bg-red-400/10 text-red-500",
    features: [
      "Domicilios integrados",
      "Zonas de entrega",
      "Captura rápida de cliente",
      "Modificadores de masa y tamaño",
      "Combos y promociones",
      "Impresión de órdenes",
      "Facturación electrónica DIAN",
      "Reportes por zona"
    ],
    modules: ["Domicilios", "Ventas", "Modificadores", "Clientes", "Reportes"],
    benefits: [
      { title: "Domicilios eficientes", description: "Captura datos del cliente y asigna zona de entrega en segundos" },
      { title: "Personalización", description: "Masa delgada, gruesa, mitad y mitad con facilidad" },
      { title: "Alto volumen", description: "Optimizado para despachar muchos pedidos simultáneos" },
    ],
    cta: "Agenda tu demo para pizzerías",
    metaTitle: "Software POS para Pizzerías y Comidas Rápidas | SistecPOS",
    metaDescription: "Sistema POS para pizzerías con domicilios, zonas de entrega y facturación DIAN. Instalación presencial en Colombia."
  },
  {
    slug: "joyerias",
    title: "POS para Joyerías",
    titleShort: "Joyerías",
    description: "Joyerías, relojerías y artículos de alto valor.",
    longDescription: "Software POS para joyerías con trazabilidad por gramo, certificados de autenticidad integrados en la factura, control de materiales preciosos y gestión de consignaciones. Seguridad y auditoría en cada transacción.",
    icon: Gem,
    color: "bg-amber-500/10 text-amber-600",
    features: [
      "Trazabilidad por gramo",
      "Certificados de autenticidad",
      "Control de materiales preciosos",
      "Consignaciones",
      "Avalúos y cotizaciones",
      "Garantías de producto",
      "Facturación electrónica DIAN",
      "Auditoría de transacciones"
    ],
    modules: ["Inventario", "Certificados", "Consignaciones", "Garantías", "Reportes"],
    benefits: [
      { title: "Trazabilidad total", description: "Rastrea cada gramo de oro, plata o piedras preciosas" },
      { title: "Certificados en factura", description: "Emite certificados de autenticidad integrados en la factura" },
      { title: "Máxima seguridad", description: "Auditoría completa de cada transacción y movimiento" },
    ],
    cta: "Agenda tu demo para joyerías",
    metaTitle: "Software POS para Joyerías | SistecPOS",
    metaDescription: "Sistema POS para joyerías con trazabilidad, certificados de autenticidad y control de materiales preciosos. Instalación presencial en Colombia."
  },
  {
    slug: "farmacia",
    title: "POS para Farmacias",
    titleShort: "Farmacias",
    description: "Farmacias, droguerías y tiendas naturistas.",
    longDescription: "Software POS especializado para farmacias y droguerías con control de lotes, fechas de vencimiento, medicamentos regulados y facturación electrónica DIAN. Ideal para droguerías de barrio, farmacias independientes y tiendas naturistas.",
    icon: Pill,
    color: "bg-rose-500/10 text-rose-600",
    features: [
      "Control de fechas de vencimiento",
      "Gestión de lotes por producto",
      "Medicamentos controlados",
      "Alertas de stock mínimo",
      "Recetas médicas digitales",
      "Proveedores y compras",
      "Facturación electrónica DIAN",
      "Reportes INVIMA"
    ],
    modules: ["Inventario", "Vencimientos", "Lotes", "Proveedores", "Facturación", "Reportes"],
    benefits: [
      { title: "Control de vencimientos", description: "Alertas automáticas de productos próximos a vencer para evitar pérdidas" },
      { title: "Trazabilidad completa", description: "Rastrea cada lote de medicamentos desde la compra hasta la venta" },
      { title: "Cumplimiento normativo", description: "Genera reportes para INVIMA y entidades reguladoras de salud" },
    ],
    cta: "Agenda tu demo para farmacias",
    metaTitle: "Software POS para Farmacias y Droguerías en Colombia | SistecPOS",
    metaDescription: "Sistema POS para farmacias con control de vencimientos, lotes, medicamentos regulados y facturación DIAN. Instalación presencial en Colombia."
  },
];

export const getBusinessTypeBySlug = (slug: string): BusinessType | undefined => {
  return businessTypes.find(bt => bt.slug === slug);
};

export const getAllBusinessSlugs = (): string[] => {
  return businessTypes.map(bt => bt.slug);
};
