import {
  AlertTriangle,
  Calendar,
  Clock,
  FileCheck,
  FileText,
  Gavel,
  HelpCircle,
  LogIn,
  Globe,
  Receipt,
  Shield,
  type LucideIcon,
} from "lucide-react";

export interface DianArticle {
  slug: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  heroIcon: LucideIcon;
  heroBadge: string;
  h1: string;
  heroSubtitle: string;
  /** Sections of rich content */
  sections: {
    title: string;
    content: string;
    /** optional bullet list */
    bullets?: string[];
  }[];
  /** Pain / solution comparison */
  painVsSolution?: {
    pain: string;
    solution: string;
  }[];
  /** CTA text for WhatsApp */
  ctaText: string;
  ctaWhatsappMessage: string;
  /** FAQ for schema markup */
  faqs: { question: string; answer: string }[];
  /** Related internal links */
  relatedLinks: { label: string; href: string }[];
}

export const dianArticles: DianArticle[] = [
  {
    slug: "facturacion-gratuita-dian",
    keyword: "facturación gratuita dian",
    metaTitle: "¿La Facturación Gratuita DIAN sirve para mi negocio? | SistecPOS",
    metaDescription:
      "Descubre si el facturador gratuito de la DIAN es suficiente para tu negocio. Analizamos limitaciones, tiempos y alternativas profesionales.",
    heroIcon: HelpCircle,
    heroBadge: "Análisis Completo",
    h1: "¿La Facturación Gratuita DIAN Sirve para Tu Negocio?",
    heroSubtitle:
      "El gobierno ofrece un facturador gratuito, pero ¿realmente sirve para un negocio que vende a diario? Analizamos sus limitaciones reales y por qué la mayoría de comerciantes migran a un POS profesional.",
    sections: [
      {
        title: "¿Qué es el facturador gratuito de la DIAN?",
        content:
          "Es una herramienta web proporcionada por la DIAN para que los contribuyentes emitan facturas electrónicas sin costo. Fue diseñada pensando en freelancers, trabajadores independientes y microempresas que emiten pocas facturas al mes.",
        bullets: [
          "Acceso desde el portal Muisca de la DIAN",
          "Requiere firma digital o certificado electrónico",
          "Permite emitir facturas, notas crédito y débito",
          "No incluye inventario, POS ni reportes avanzados",
        ],
      },
      {
        title: "Las 5 limitaciones que nadie te cuenta",
        content:
          "Aunque es gratuito, el facturador de la DIAN tiene restricciones críticas que impactan directamente la productividad de cualquier negocio con flujo diario de clientes.",
        bullets: [
          "⏱ Cada factura toma 3 a 5 minutos (vs 10 segundos en un POS)",
          "📶 Si la web de la DIAN se cae, no puedes facturar",
          "📦 Cero control de inventario: no sabes cuánto stock te queda",
          "🔁 Los errores te obligan a empezar la factura desde cero",
          "📊 Sin reportes de ventas, rotación ni inteligencia de negocio",
        ],
      },
      {
        title: "¿Cuánto te cuesta el \"gratis\" realmente?",
        content:
          "Si emites 20 facturas diarias y cada una toma 4 minutos en la DIAN, pierdes 80 minutos al día. Eso son 40 horas al mes — una semana laboral completa digitando datos manualmente. Con un POS como SistecPOS, esas mismas 20 facturas toman menos de 4 minutos en total.",
      },
      {
        title: "La solución: SistecPOS automatiza todo",
        content:
          "SistecPOS es proveedor tecnológico autorizado por la DIAN. Emites facturas electrónicas en 3 clics mientras vendes. Además, controlas inventario, generas reportes y sigues vendiendo aunque la DIAN se caiga, gracias al modo offline de hasta 8 días.",
        bullets: [
          "Facturación DIAN automática desde el punto de venta",
          "Modo offline: si la DIAN se cae, tú sigues facturando",
          "Control de inventario con alertas de stock bajo",
          "16 módulos especializados por tipo de negocio",
          "Desde $12 USD/mes con facturación electrónica ilimitada",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "3-5 minutos por factura en la DIAN",
        solution: "10 segundos por factura en SistecPOS",
      },
      {
        pain: "Sin inventario ni control de stock",
        solution: "Inventario automático con alertas y rotación",
      },
      {
        pain: "Si la DIAN se cae, no facturas",
        solution: "Modo offline hasta 8 días",
      },
    ],
    ctaText: "Migra del facturador gratuito a un POS profesional",
    ctaWhatsappMessage:
      "Hola, quiero migrar del facturador gratuito DIAN a SistecPOS",
    faqs: [
      {
        question: "¿Es obligatorio usar el facturador gratuito de la DIAN?",
        answer:
          "No. La DIAN permite usar cualquier proveedor tecnológico autorizado para emitir facturas electrónicas. SistecPOS es proveedor autorizado y cumple toda la normativa DIAN vigente.",
      },
      {
        question: "¿El facturador gratuito DIAN sirve para un restaurante?",
        answer:
          "No es práctico. Un restaurante con alto flujo de clientes necesita velocidad en caja, comandas, mesas y modo offline. El facturador gratuito no ofrece nada de eso.",
      },
      {
        question:
          "¿Cuánto cuesta pasar del facturador gratuito a SistecPOS?",
        answer:
          "Desde $12 USD/mes (~$50.000 COP). La migración es gratuita: nuestro equipo te configura todo y te capacita presencialmente.",
      },
    ],
    relatedLinks: [
      { label: "Comparar Facturador DIAN vs SistecPOS", href: "/comparar/facturador-gratuito-dian" },
      { label: "Facturación Electrónica DIAN", href: "/facturacion-electronica" },
      { label: "Software POS Colombia", href: "/software-pos-colombia" },
    ],
  },
  {
    slug: "facturador-gratuito-dian-no-funciona",
    keyword: "facturador gratuito dian no funciona",
    metaTitle: "¿Caído el Facturador Gratuito DIAN? Solución de Contingencia | SistecPOS",
    metaDescription:
      "El facturador gratuito de la DIAN se cae frecuentemente. Conoce la solución de contingencia profesional que te permite seguir facturando sin interrupciones.",
    heroIcon: AlertTriangle,
    heroBadge: "Contingencia DIAN",
    h1: "¿Caído el Facturador Gratuito DIAN? Solución de Contingencia Aquí",
    heroSubtitle:
      "Si estás leyendo esto, probablemente la web de la DIAN está caída y no puedes facturar. No estás solo: esto sucede cada quincena, fin de mes y en periodos de alta demanda. Hay una solución permanente.",
    sections: [
      {
        title: "¿Por qué se cae la DIAN tan seguido?",
        content:
          "El facturador gratuito es un servicio web centralizado que depende 100% de los servidores de la DIAN. Cuando miles de comerciantes intentan facturar al mismo tiempo (quincenas, fin de mes, cierres fiscales), los servidores se saturan. Resultado: pantalla en blanco, errores de timeout y horas sin poder facturar.",
        bullets: [
          "Caídas frecuentes en quincena y fin de mes",
          "Errores de timeout al cargar el micrositio",
          "Pérdida de facturas a medio digitar",
          "Sin notificación oficial de mantenimiento",
          "Colas de clientes esperando mientras la DIAN vuelve",
        ],
      },
      {
        title: "El costo real de cada caída",
        content:
          "Cada hora que la DIAN está caída es una hora que no facturas. Si tu negocio vende $500.000 COP/hora en promedio, una caída de 3 horas te cuesta $1.500.000 en ventas potencialmente no registradas, clientes frustrados y posibles problemas fiscales por facturas sin emitir.",
      },
      {
        title: "La solución: modo offline y contingencia automática",
        content:
          "SistecPOS no depende de los servidores de la DIAN para funcionar. Gracias a su tecnología híbrida, puedes seguir facturando de forma local y el sistema envía automáticamente las facturas a la DIAN cuando el servicio se restablezca. Tus clientes nunca esperan.",
        bullets: [
          "Modo offline hasta 8 días sin perder datos",
          "Facturas se generan localmente con numeración válida",
          "Envío automático a la DIAN cuando vuelve la conexión",
          "Contingencia cumple con la normativa vigente",
          "Nunca dejas de vender ni de facturar",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "DIAN caída = negocio paralizado",
        solution: "Modo offline: sigues vendiendo y facturando",
      },
      {
        pain: "Clientes esperando en cola",
        solution: "Facturación instantánea sin depender de servidores externos",
      },
      {
        pain: "Facturas perdidas por timeout",
        solution: "Datos guardados localmente, sincronización automática",
      },
    ],
    ctaText: "No dejes que la DIAN pare tu negocio",
    ctaWhatsappMessage:
      "Hola, la DIAN se cae mucho y necesito una solución de contingencia para facturar",
    faqs: [
      {
        question: "¿Puedo facturar si la DIAN está caída?",
        answer:
          "Con el facturador gratuito, no. Con SistecPOS sí: el modo offline genera facturas localmente y las envía a la DIAN automáticamente cuando el servicio se restablezca.",
      },
      {
        question: "¿La facturación offline de SistecPOS es legal?",
        answer:
          "Sí. La DIAN permite la facturación de contingencia cuando sus servicios no están disponibles. SistecPOS cumple con la resolución vigente y envía los documentos cuando se restablece la conexión.",
      },
      {
        question: "¿Cuánto tiempo puedo estar offline facturando?",
        answer:
          "Hasta 8 días consecutivos. SistecPOS almacena todas las facturas, ventas e inventario localmente y sincroniza automáticamente cuando vuelve la conexión.",
      },
    ],
    relatedLinks: [
      { label: "Facturación Electrónica DIAN", href: "/facturacion-electronica" },
      { label: "Comparar Facturador DIAN vs SistecPOS", href: "/comparar/facturador-gratuito-dian" },
      { label: "Software POS Colombia", href: "/software-pos-colombia" },
    ],
  },
  {
    slug: "como-facturar-electronicamente-gratis-dian",
    keyword: "como facturar electronicamente gratis dian",
    metaTitle: "Cómo Facturar Electrónicamente en la DIAN (Guía Paso a Paso) | SistecPOS",
    metaDescription:
      "Guía paso a paso para facturar electrónicamente gratis en la DIAN. Aprende el proceso completo y descubre por qué tardas tanto (y cómo acelerarlo).",
    heroIcon: FileCheck,
    heroBadge: "Guía Tutorial",
    h1: "Cómo Facturar en la DIAN Gratis: Guía Paso a Paso (y Por Qué Tardas Tanto)",
    heroSubtitle:
      "Tutorial completo para emitir facturas electrónicas desde el portal Muisca de la DIAN. Te explicamos cada paso y al final te mostramos cómo hacerlo 30 veces más rápido.",
    sections: [
      {
        title: "Requisitos previos",
        content:
          "Antes de poder emitir tu primera factura electrónica en el portal de la DIAN, necesitas cumplir varios requisitos técnicos y administrativos.",
        bullets: [
          "RUT actualizado con responsabilidad de facturación electrónica",
          "Resolución de facturación aprobada por la DIAN",
          "Certificado digital o firma electrónica vigente",
          "Clave del portal Muisca de la DIAN",
          "Computador con navegador compatible (Chrome o Edge)",
        ],
      },
      {
        title: "Paso a paso: facturar en el portal DIAN",
        content:
          "Este es el proceso completo que debes seguir cada vez que necesitas emitir una factura electrónica desde el facturador gratuito de la DIAN.",
        bullets: [
          "1. Ingresa a www.dian.gov.co → Transaccional → Facturación Electrónica",
          "2. Inicia sesión con tu NIT y clave Muisca",
          "3. Selecciona 'Emitir Factura de Venta'",
          "4. Digita los datos del comprador (NIT, nombre, dirección, correo)",
          "5. Agrega cada producto manualmente (descripción, cantidad, precio, IVA)",
          "6. Revisa totales, descuentos e impuestos",
          "7. Firma con tu certificado digital",
          "8. Envía y descarga el PDF de representación gráfica",
        ],
      },
      {
        title: "¿Por qué tarda tanto?",
        content:
          "Cada factura requiere digitar 15+ campos manualmente. No hay autocompletado de clientes ni productos. Si cometes un error, debes empezar de cero. Multiplicado por 20, 30 o 50 facturas diarias, son horas perdidas cada día.",
      },
      {
        title: "La alternativa: factura en 10 segundos con SistecPOS",
        content:
          "SistecPOS automatiza todo este proceso. Tus clientes y productos ya están cargados. Solo escaneas el código de barras, seleccionas el cliente y cobras. La factura electrónica DIAN se genera automáticamente en segundo plano.",
        bullets: [
          "Clientes y productos precargados con autocompletado",
          "Escaneo de código de barras o búsqueda rápida",
          "Factura DIAN generada automáticamente al cobrar",
          "Envío por WhatsApp o correo al cliente en 1 clic",
          "Historial completo de facturas con búsqueda instantánea",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "15+ campos manuales por factura",
        solution: "3 clics: escanea, selecciona cliente, cobra",
      },
      {
        pain: "Errores obligan a empezar de cero",
        solution: "Datos precargados, sin errores de digitación",
      },
      {
        pain: "Sin historial organizado de facturas",
        solution: "Búsqueda instantánea por fecha, cliente o producto",
      },
    ],
    ctaText: "Deja de perder tiempo digitando",
    ctaWhatsappMessage:
      "Hola, quiero dejar de facturar manualmente en la DIAN y usar SistecPOS",
    faqs: [
      {
        question: "¿Es difícil facturar en la DIAN?",
        answer:
          "El proceso no es difícil, pero es lento y repetitivo. Cada factura requiere 15+ campos manuales, lo que es inviable para negocios con alto volumen de ventas.",
      },
      {
        question: "¿Necesito firma digital para facturar en la DIAN?",
        answer:
          "Sí, necesitas un certificado digital vigente. Con SistecPOS, el certificado está incluido en tu suscripción sin costo adicional.",
      },
      {
        question: "¿Puedo migrar del facturador DIAN a SistecPOS sin perder datos?",
        answer:
          "Sí. Nuestro equipo te ayuda a migrar tu base de clientes y productos. La transición toma menos de 1 día con capacitación presencial incluida.",
      },
    ],
    relatedLinks: [
      { label: "Facturación Electrónica con SistecPOS", href: "/facturacion-electronica" },
      { label: "Registro y habilitación en la DIAN", href: "/guias-dian/registro-facturador-gratuito-dian" },
      { label: "Comparar Facturador DIAN vs SistecPOS", href: "/comparar/facturador-gratuito-dian" },
    ],
  },
  {
    slug: "registro-facturador-gratuito-dian",
    keyword: "registro facturador gratuito dian",
    metaTitle: "Cómo Registrarse en la DIAN vs Habilitarse en SistecPOS (5 min) | SistecPOS",
    metaDescription:
      "Guía de registro en el facturador gratuito de la DIAN: pasos, requisitos y tiempos. Compara con la habilitación express de SistecPOS en 5 minutos.",
    heroIcon: LogIn,
    heroBadge: "Registro DIAN",
    h1: "Registrarse en la DIAN vs Habilitarse en SistecPOS: ¿5 Días o 5 Minutos?",
    heroSubtitle:
      "El registro como facturador electrónico ante la DIAN puede tomar días entre trámites y aprobaciones. Te mostramos el proceso completo y la alternativa express.",
    sections: [
      {
        title: "Proceso de registro en la DIAN (ruta oficial)",
        content:
          "Para usar el facturador gratuito de la DIAN necesitas completar un proceso de habilitación que involucra varios pasos administrativos y técnicos.",
        bullets: [
          "1. Actualizar el RUT con la responsabilidad 52 (facturador electrónico)",
          "2. Solicitar resolución de facturación en el portal Muisca",
          "3. Adquirir un certificado digital (Andes SCD, GSE, etc.) — costo adicional",
          "4. Realizar pruebas de habilitación (set de pruebas DIAN)",
          "5. Esperar aprobación de la DIAN (1 a 5 días hábiles)",
          "6. Configurar el facturador gratuito con los datos aprobados",
        ],
      },
      {
        title: "Tiempo total estimado del proceso DIAN",
        content:
          "Entre la actualización del RUT, compra del certificado digital ($150.000 - $300.000 COP/año), solicitud de resolución y aprobación de pruebas, el proceso completo toma entre 3 y 10 días hábiles. Si hay errores en las pruebas, puede tomar más.",
      },
      {
        title: "Habilitación express con SistecPOS",
        content:
          "Con SistecPOS, nuestro equipo de ingenieros gestiona todo el proceso de habilitación por ti. Tú solo proporcionas los datos básicos (NIT, RUT) y nosotros hacemos el resto, incluida la configuración de tu certificado digital.",
        bullets: [
          "Nuestro equipo gestiona el RUT y la resolución por ti",
          "Certificado digital incluido sin costo adicional",
          "Pruebas de habilitación DIAN realizadas por nuestros ingenieros",
          "Capacitación presencial para que empieces a facturar desde el día 1",
          "Tiempo total: 1 a 3 días hábiles (tú no haces nada técnico)",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "3 a 10 días de trámites manuales",
        solution: "1 a 3 días — SistecPOS lo hace por ti",
      },
      {
        pain: "Certificado digital: $150.000 - $300.000 COP/año",
        solution: "Certificado incluido en tu suscripción",
      },
      {
        pain: "Pruebas de habilitación técnicas y confusas",
        solution: "Nuestros ingenieros realizan todas las pruebas",
      },
    ],
    ctaText: "Habilítate sin trámites, nosotros lo hacemos por ti",
    ctaWhatsappMessage:
      "Hola, quiero habilitarme como facturador electrónico con SistecPOS",
    faqs: [
      {
        question: "¿SistecPOS me ayuda a registrarme en la DIAN?",
        answer:
          "Sí. Nuestro equipo gestiona todo el proceso de habilitación: RUT, resolución de facturación, certificado digital y pruebas DIAN. Tú solo proporcionas tus datos básicos.",
      },
      {
        question: "¿Cuánto cuesta el certificado digital con SistecPOS?",
        answer:
          "Está incluido en tu suscripción. No pagas los $150.000 - $300.000 COP/año que cobran los proveedores como Andes SCD o GSE por separado.",
      },
      {
        question: "¿Puedo facturar el mismo día que me registro en SistecPOS?",
        answer:
          "En la mayoría de los casos, sí. Si tu RUT ya tiene la responsabilidad 52 y tienes resolución vigente, te configuramos el mismo día. Si no, gestionamos los trámites DIAN y en 1 a 3 días estás listo.",
      },
    ],
    relatedLinks: [
      { label: "Cómo facturar en la DIAN paso a paso", href: "/guias-dian/como-facturar-electronicamente-gratis-dian" },
      { label: "Facturación Electrónica DIAN", href: "/facturacion-electronica" },
      { label: "Comparativa de planes SistecPOS", href: "/comparativa-licencias" },
    ],
  },
  {
    slug: "micrositio-facturacion-electronica-dian",
    keyword: "micrositio facturación electrónica dian",
    metaTitle: "Micrositio Facturación Electrónica DIAN + Alternativas Profesionales | SistecPOS",
    metaDescription:
      "Acceso directo al micrositio de facturación electrónica de la DIAN. Conoce las alternativas profesionales que van más allá del facturador gratuito.",
    heroIcon: Globe,
    heroBadge: "Portal DIAN",
    h1: "Micrositio Facturación Electrónica DIAN: Acceso Directo y Alternativas",
    heroSubtitle:
      "Accede al micrositio oficial de facturación electrónica de la DIAN y descubre por qué miles de comerciantes colombianos eligen alternativas profesionales para el día a día.",
    sections: [
      {
        title: "¿Qué es el micrositio de facturación electrónica DIAN?",
        content:
          "El micrositio de facturación electrónica es la plataforma web oficial de la DIAN donde los contribuyentes pueden habilitarse, emitir facturas, consultar documentos electrónicos y gestionar su resolución de facturación.",
        bullets: [
          "URL oficial: https://www.dian.gov.co → Servicios → Facturación Electrónica",
          "Permite emitir facturas electrónicas de venta",
          "Consulta de documentos electrónicos enviados y recibidos",
          "Gestión de resoluciones de numeración",
          "Descarga de representaciones gráficas (PDF)",
        ],
      },
      {
        title: "Limitaciones del micrositio para negocios activos",
        content:
          "El micrositio DIAN fue diseñado como solución mínima para contribuyentes con pocas facturas. Para un negocio que vende a diario, presenta limitaciones que impactan directamente la operación.",
        bullets: [
          "No tiene punto de venta (POS): no puedes vender rápido en caja",
          "Sin control de inventario ni alertas de stock",
          "Cada factura requiere digitación manual completa",
          "Se cae frecuentemente en periodos de alta demanda",
          "Sin reportes de ventas ni inteligencia de negocio",
          "Sin modo offline: si la web se cae, tu negocio se detiene",
        ],
      },
      {
        title: "Alternativa profesional: SistecPOS",
        content:
          "SistecPOS integra la facturación electrónica DIAN dentro de un sistema completo de punto de venta. No reemplazas la DIAN — la automatizas. Cada venta genera automáticamente la factura electrónica sin que tengas que visitar el micrositio.",
        bullets: [
          "Facturación electrónica DIAN automática desde el POS",
          "Punto de venta táctil con escaneo de códigos",
          "Inventario en tiempo real con importación Excel",
          "Funciona offline hasta 8 días",
          "16 módulos especializados por industria",
          "Soporte presencial con respuesta el mismo día",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "Visitar el micrositio para cada factura",
        solution: "Factura automática al cobrar en el POS",
      },
      {
        pain: "Micrositio caído = no facturas",
        solution: "Modo offline: facturas localmente y sincronizas después",
      },
      {
        pain: "Solo facturación, sin gestión de negocio",
        solution: "POS completo: inventario, reportes, mesas, multi-tienda",
      },
    ],
    ctaText: "Automatiza tu facturación DIAN",
    ctaWhatsappMessage:
      "Hola, quiero automatizar mi facturación electrónica DIAN con un POS profesional",
    faqs: [
      {
        question: "¿Dónde está el micrositio de facturación electrónica DIAN?",
        answer:
          "Puedes acceder en www.dian.gov.co → Menú Transaccional → Facturación Electrónica. Necesitas tu NIT y clave Muisca para iniciar sesión.",
      },
      {
        question: "¿Necesito seguir usando el micrositio DIAN si uso SistecPOS?",
        answer:
          "No. SistecPOS envía las facturas directamente a la DIAN por ti. Solo necesitarías el micrositio para consultas administrativas esporádicas.",
      },
      {
        question: "¿SistecPOS es proveedor tecnológico autorizado por la DIAN?",
        answer:
          "Sí. SistecPOS cumple con toda la normativa de facturación electrónica vigente, incluida la Resolución 000042 de 2020 y sus actualizaciones.",
      },
    ],
    relatedLinks: [
      { label: "Facturación Electrónica con SistecPOS", href: "/facturacion-electronica" },
      { label: "¿Qué es la facturación gratuita DIAN?", href: "/guias-dian/facturacion-gratuita-dian" },
      { label: "Comparar Facturador DIAN vs SistecPOS", href: "/comparar/facturador-gratuito-dian" },
    ],
  },

  // ─── CLUSTER 2: Habilitación y Normativa ───────────────────────────────

  {
    slug: "habilitar-facturacion-electronica-dian",
    keyword: "habilitar facturación electrónica dian",
    metaTitle: "Cómo Habilitar Facturación Electrónica DIAN en 2026 (Guía Rápida) | SistecPOS",
    metaDescription:
      "Guía paso a paso para habilitarte como facturador electrónico ante la DIAN en 2026. Requisitos, plazos y la opción express con SistecPOS.",
    heroIcon: Shield,
    heroBadge: "Guía 2026",
    h1: "Cómo Habilitar la Facturación Electrónica DIAN en 2026: Guía Rápida",
    heroSubtitle:
      "¿Te llegó la notificación de la DIAN? ¿Acabas de formalizarte? Aquí tienes el paso a paso para habilitarte como facturador electrónico sin perder tiempo ni dinero.",
    sections: [
      {
        title: "¿Quiénes están obligados a facturar electrónicamente en 2026?",
        content:
          "Desde 2024, prácticamente todos los contribuyentes responsables de IVA e impuesto al consumo están obligados. En 2026, la DIAN ha ampliado la obligación a más categorías, incluyendo Régimen Simple de Tributación y vendedores en plataformas digitales.",
        bullets: [
          "Responsables de IVA (Régimen Común)",
          "Responsables de Impuesto al Consumo",
          "Contribuyentes del Régimen Simple de Tributación (RST)",
          "Vendedores en plataformas de comercio electrónico",
          "Prestadores de servicios digitales desde Colombia",
        ],
      },
      {
        title: "Paso a paso: habilitación ante la DIAN",
        content:
          "El proceso oficial de habilitación requiere completar varios trámites en el portal Muisca de la DIAN. Puede tomar entre 3 y 10 días hábiles si lo haces solo.",
        bullets: [
          "1. Actualizar el RUT: agrega la responsabilidad 52 (facturador electrónico)",
          "2. Solicitar resolución de facturación en el portal Muisca",
          "3. Adquirir certificado digital (Andes SCD, GSE u otro proveedor)",
          "4. Seleccionar o registrar tu proveedor tecnológico",
          "5. Realizar el set de pruebas de habilitación de la DIAN",
          "6. Esperar aprobación (1 a 5 días hábiles)",
          "7. Emitir tu primera factura electrónica válida",
        ],
      },
      {
        title: "¿Y si no me habilito a tiempo?",
        content:
          "La DIAN ha endurecido las sanciones. No habilitarse a tiempo puede resultar en multas desde 5 UVT ($250.000 COP aprox.) hasta el cierre temporal del establecimiento. Además, sin facturación electrónica no puedes deducir costos ni gastos en tu declaración de renta.",
      },
      {
        title: "La ruta express: SistecPOS te habilita gratis",
        content:
          "Con SistecPOS, nuestro equipo de ingenieros gestiona todo el proceso de habilitación por ti. Solo necesitas proporcionar tu NIT y RUT. Nosotros hacemos el resto: actualización del RUT, solicitud de resolución, certificado digital y pruebas DIAN.",
        bullets: [
          "Certificado digital incluido sin costo adicional",
          "Pruebas de habilitación realizadas por nuestros ingenieros",
          "Capacitación presencial para usar el POS desde el día 1",
          "Soporte DIAN permanente incluido en tu suscripción",
          "Tiempo total: 1 a 3 días hábiles (tú no haces nada técnico)",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "3 a 10 días de trámites manuales ante la DIAN",
        solution: "1 a 3 días — SistecPOS gestiona todo por ti",
      },
      {
        pain: "Certificado digital aparte: $150.000 - $300.000/año",
        solution: "Certificado incluido en tu suscripción SistecPOS",
      },
      {
        pain: "Set de pruebas técnicas confusas",
        solution: "Nuestros ingenieros realizan todas las pruebas",
      },
      {
        pain: "Riesgo de multas por no habilitarse a tiempo",
        solution: "Te habilitamos en tiempo récord, sin riesgo",
      },
    ],
    ctaText: "Habilítate sin trámites, nosotros lo hacemos",
    ctaWhatsappMessage:
      "Hola, necesito habilitarme para facturar electrónicamente con la DIAN",
    faqs: [
      {
        question: "¿Cuánto tiempo toma habilitarse ante la DIAN?",
        answer:
          "Por cuenta propia, entre 3 y 10 días hábiles. Con SistecPOS, 1 a 3 días hábiles porque nuestro equipo gestiona todo el proceso por ti.",
      },
      {
        question: "¿Necesito un contador para habilitarme?",
        answer:
          "No necesariamente. El proceso es administrativo y técnico. Con SistecPOS no necesitas contador ni conocimientos técnicos: nuestro equipo lo hace todo.",
      },
      {
        question: "¿Qué pasa si no me habilito?",
        answer:
          "La DIAN puede imponer multas desde 5 UVT, cerrar temporalmente tu establecimiento y limitar tus deducciones fiscales. Es mejor habilitarse cuanto antes.",
      },
    ],
    relatedLinks: [
      { label: "Registro en el facturador DIAN", href: "/guias-dian/registro-facturador-gratuito-dian" },
      { label: "Sanciones por no facturar", href: "/guias-dian/sanciones-no-facturar-electronicamente" },
      { label: "Calculadora UVT", href: "/herramientas/calculadora-uvt" },
    ],
  },
  {
    slug: "resolucion-facturacion-electronica-2025",
    keyword: "resolución facturación electrónica 2025",
    metaTitle: "Nueva Resolución DIAN 2025: ¿Tu POS Cumple o Te Multarán? | SistecPOS",
    metaDescription:
      "Análisis de la resolución DIAN 2025 sobre facturación electrónica. Verifica si tu sistema POS cumple con los nuevos requisitos o enfrentarás sanciones.",
    heroIcon: Gavel,
    heroBadge: "Normativa Vigente",
    h1: "Nueva Resolución DIAN 2025: ¿Tu POS Cumple o Te Multarán?",
    heroSubtitle:
      "La DIAN actualizó sus requisitos de facturación electrónica. Miles de negocios con software desactualizado enfrentan multas. Aquí te explicamos qué cambió y cómo cumplir.",
    sections: [
      {
        title: "¿Qué cambió con la nueva resolución?",
        content:
          "La Resolución 000165 de 2023, complementada con actualizaciones en 2024 y 2025, estableció nuevos requisitos técnicos para la facturación electrónica en Colombia. Los cambios aplican tanto al formato del documento XML como a los plazos de envío.",
        bullets: [
          "Nuevo formato XML UBL 2.1 obligatorio para todos los documentos electrónicos",
          "Plazo máximo de 24 horas para enviar facturas a la DIAN (antes 48h)",
          "Obligación de emitir Documento Soporte electrónico en compras a no responsables",
          "Inclusión obligatoria del código QR en la representación gráfica",
          "Nuevas validaciones de firma digital y cadena de custodia",
        ],
      },
      {
        title: "¿Quiénes se ven afectados?",
        content:
          "Todos los obligados a facturar electrónicamente deben cumplir con la nueva resolución. Si usas un software POS o contable que no se ha actualizado, tus facturas pueden ser rechazadas por la DIAN, generando inconsistencias fiscales.",
        bullets: [
          "Negocios usando software POS desactualizado (versiones anteriores a 2024)",
          "Comerciantes que facturan manualmente en el micrositio DIAN",
          "Empresas con proveedores tecnológicos que no implementaron UBL 2.1",
          "Contribuyentes del Régimen Simple que no emiten documento soporte",
        ],
      },
      {
        title: "Sanciones por incumplimiento",
        content:
          "La DIAN puede imponer sanciones que van desde multas en UVT hasta el cierre temporal del establecimiento. El desconocimiento de la norma no exime de responsabilidad.",
        bullets: [
          "Multa por no facturar: hasta 15.000 UVT (~$750 millones COP)",
          "Multa por facturar sin requisitos: 1% del valor facturado",
          "Cierre temporal del establecimiento por 3 días",
          "Desconocimiento de costos y gastos en la declaración de renta",
        ],
      },
      {
        title: "SistecPOS cumple desde el día 1",
        content:
          "SistecPOS se actualiza automáticamente para cumplir con cada nueva resolución DIAN. No tienes que preocuparte por formatos XML, versiones de UBL ni validaciones técnicas. Nuestro equipo monitorea los cambios normativos y aplica las actualizaciones sin que tengas que hacer nada.",
        bullets: [
          "Formato UBL 2.1 implementado y validado",
          "Envío automático a la DIAN en menos de 5 segundos",
          "Código QR generado automáticamente en cada factura",
          "Documento Soporte electrónico incluido",
          "Actualizaciones normativas automáticas y sin costo",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "Software desactualizado = facturas rechazadas",
        solution: "SistecPOS se actualiza automáticamente con cada resolución",
      },
      {
        pain: "Riesgo de multas por formato XML incorrecto",
        solution: "Formato UBL 2.1 validado y certificado por la DIAN",
      },
      {
        pain: "Tú debes estar pendiente de cada cambio normativo",
        solution: "Nuestro equipo monitorea y aplica las actualizaciones por ti",
      },
    ],
    ctaText: "Cumple con la DIAN sin esfuerzo",
    ctaWhatsappMessage:
      "Hola, quiero asegurarme de que mi facturación electrónica cumple con la última resolución DIAN",
    faqs: [
      {
        question: "¿Qué es la Resolución 000165 de la DIAN?",
        answer:
          "Es la resolución que establece los requisitos técnicos y de contenido para la facturación electrónica en Colombia, incluyendo el formato XML UBL 2.1, plazos de envío y validaciones obligatorias.",
      },
      {
        question: "¿Mi software POS actual cumple con la resolución?",
        answer:
          "Debes verificarlo con tu proveedor. Si tu software no ha sido actualizado desde 2023, es probable que no cumpla con los nuevos requisitos y tus facturas puedan ser rechazadas.",
      },
      {
        question: "¿SistecPOS se actualiza automáticamente?",
        answer:
          "Sí. Cada vez que la DIAN publica una nueva resolución o actualización, nuestro equipo implementa los cambios automáticamente. No tienes que hacer nada.",
      },
    ],
    relatedLinks: [
      { label: "Habilitarse en la DIAN", href: "/guias-dian/habilitar-facturacion-electronica-dian" },
      { label: "Sanciones por no facturar", href: "/guias-dian/sanciones-no-facturar-electronicamente" },
      { label: "Facturación Electrónica SistecPOS", href: "/facturacion-electronica" },
    ],
  },
  {
    slug: "calendario-tributario-dian-2026",
    keyword: "calendario tributario dian 2026",
    metaTitle: "Calendario Tributario DIAN 2026: Fechas Clave para Facturadores Electrónicos | SistecPOS",
    metaDescription:
      "Calendario tributario 2026 de la DIAN con todas las fechas clave para facturadores electrónicos: IVA, retención, renta y Régimen Simple.",
    heroIcon: Calendar,
    heroBadge: "Calendario 2026",
    h1: "Calendario Tributario DIAN 2026: Fechas Clave para Facturadores Electrónicos",
    heroSubtitle:
      "No te pillen las fechas. Aquí tienes el calendario tributario 2026 con todos los vencimientos que afectan a los facturadores electrónicos en Colombia.",
    sections: [
      {
        title: "¿Por qué te importa el calendario tributario?",
        content:
          "Si facturas electrónicamente, debes presentar declaraciones de IVA, retención en la fuente, información exógena y renta en las fechas que establece la DIAN. Incumplir genera intereses, sanciones y problemas con tu resolución de facturación.",
      },
      {
        title: "Fechas clave IVA 2026",
        content:
          "Los responsables de IVA deben presentar la declaración bimestral o cuatrimestral, según sus ingresos. Las fechas varían según los dos últimos dígitos del NIT.",
        bullets: [
          "Bimestre ene-feb: vencimiento marzo 2026",
          "Bimestre mar-abr: vencimiento mayo 2026",
          "Bimestre may-jun: vencimiento julio 2026",
          "Bimestre jul-ago: vencimiento septiembre 2026",
          "Bimestre sep-oct: vencimiento noviembre 2026",
          "Bimestre nov-dic: vencimiento enero 2027",
          "Cuatrimestral: 3 plazos al año (mayo, septiembre, enero)",
        ],
      },
      {
        title: "Retención en la Fuente 2026",
        content:
          "Los agentes retenedores deben declarar mensualmente. La presentación en ceros (sin retenciones) también es obligatoria para evitar sanciones.",
        bullets: [
          "Declaración mensual: vencimiento en el mes siguiente al periodo gravable",
          "Presentar en ceros es obligatorio si no hubo retenciones",
          "No presentar genera sanción mínima de 10 UVT (~$500.000 COP)",
        ],
      },
      {
        title: "Información Exógena 2026",
        content:
          "La información exógena es el reporte anual que deben presentar personas naturales y jurídicas sobre sus operaciones con terceros (clientes, proveedores, retenciones). Es uno de los trámites más complejos para los comerciantes.",
        bullets: [
          "Reporte correspondiente al año gravable 2025",
          "Vencimientos entre abril y mayo de 2026",
          "Incluye: ventas, compras, retenciones, IVA, terceros",
          "SistecPOS genera el archivo de exógena automáticamente",
        ],
      },
      {
        title: "SistecPOS: tu aliado en fechas tributarias",
        content:
          "SistecPOS genera automáticamente los reportes que necesitas para cada declaración: ventas por periodo, IVA generado, retenciones aplicadas y el archivo de información exógena. No más Excel ni cuadrar a mano.",
        bullets: [
          "Reporte de IVA por bimestre o cuatrimestre",
          "Exportación de retenciones aplicadas",
          "Generación automática de información exógena",
          "Informes listos para tu contador con 2 clics",
        ],
      },
    ],
    ctaText: "Nunca más te pille una fecha tributaria",
    ctaWhatsappMessage:
      "Hola, necesito un POS que me ayude con los reportes tributarios de la DIAN",
    faqs: [
      {
        question: "¿SistecPOS genera la información exógena?",
        answer:
          "Sí. SistecPOS genera automáticamente el archivo de información exógena con los datos de ventas, compras y retenciones del año, listo para presentar ante la DIAN.",
      },
      {
        question: "¿Qué pasa si no presento mis declaraciones a tiempo?",
        answer:
          "La DIAN impone sanciones por extemporaneidad e intereses moratorios. En casos graves, puede suspender tu resolución de facturación electrónica.",
      },
      {
        question: "¿SistecPOS me recuerda las fechas de vencimiento?",
        answer:
          "SistecPOS genera los reportes tributarios automáticamente. Para las fechas exactas, te recomendamos verificar el calendario oficial de la DIAN según tu NIT.",
      },
    ],
    relatedLinks: [
      { label: "Calculadora UVT 2026", href: "/herramientas/calculadora-uvt" },
      { label: "Sanciones por no facturar", href: "/guias-dian/sanciones-no-facturar-electronicamente" },
      { label: "Facturación Electrónica", href: "/facturacion-electronica" },
    ],
  },
  {
    slug: "sanciones-no-facturar-electronicamente",
    keyword: "sanciones por no facturar electronicamente",
    metaTitle: "Multas DIAN por No Facturar Electrónicamente: Evita el Cierre de Tu Negocio | SistecPOS",
    metaDescription:
      "Conoce las sanciones de la DIAN por no facturar electrónicamente en 2026: multas en UVT, cierre temporal y pérdida de deducciones. Evítalas con SistecPOS.",
    heroIcon: AlertTriangle,
    heroBadge: "⚠️ Alerta Sanciones",
    h1: "Multas de la DIAN por No Facturar Electrónicamente: Evita el Cierre de Tu Negocio",
    heroSubtitle:
      "La DIAN no perdona. Si no facturas electrónicamente o lo haces sin cumplir los requisitos, puedes enfrentar multas millonarias y hasta el cierre temporal de tu negocio.",
    sections: [
      {
        title: "¿Qué dice la ley sobre facturación electrónica?",
        content:
          "El artículo 616-1 del Estatuto Tributario y la Resolución 000042 de 2020 (actualizada por la 000165 de 2023) establecen que todos los responsables de IVA e impuesto al consumo deben emitir factura electrónica. No hacerlo tiene consecuencias graves.",
      },
      {
        title: "Sanciones por no facturar",
        content:
          "La DIAN tiene un abanico de sanciones que puede aplicar según la gravedad de la infracción. Van desde multas monetarias hasta el cierre del establecimiento.",
        bullets: [
          "🔴 Sanción por no facturar: cierre del establecimiento por 3 días (Art. 657 E.T.)",
          "🔴 Multa de 1 UVT por cada factura no emitida (sin exceder 15.000 UVT)",
          "🔴 Sanción por facturar sin requisitos: 1% del valor de las operaciones facturadas",
          "🔴 Desconocimiento de costos y gastos: no puedes deducir lo que no facturas",
          "🔴 Sanción por no enviar información exógena: hasta 15.000 UVT",
          "🔴 Reincidencia: cierre hasta por 30 días o cancelación del RUT",
        ],
      },
      {
        title: "¿Cuánto es 1 UVT en pesos?",
        content:
          "Para 2026, el valor estimado de la UVT es de $49.799 COP. Eso significa que 15.000 UVT equivalen a más de $746 millones de pesos. Una sanción por no emitir 50 facturas te costaría $2.490.000 COP. Usa nuestra calculadora de UVT para hacer tus propias conversiones.",
      },
      {
        title: "Casos reales de sanciones DIAN",
        content:
          "En 2024 y 2025, la DIAN intensificó sus operativos de fiscalización. Miles de negocios en Bogotá, Medellín, Bucaramanga y Cali recibieron requerimientos por no facturar electrónicamente.",
        bullets: [
          "Tienda de ropa en Bucaramanga: cierre por 3 días + multa de 50 UVT",
          "Restaurante en Bogotá: multa de 200 UVT por facturar sin requisitos",
          "Ferretería en Medellín: desconocimiento de $45 millones en deducciones",
          "Minimarket en Cali: requerimiento por no emitir documento soporte",
        ],
      },
      {
        title: "Protégete con SistecPOS",
        content:
          "SistecPOS automatiza tu facturación electrónica para que siempre cumplas con la DIAN. Cada venta genera automáticamente la factura o documento POS electrónico con todos los requisitos legales. Cero riesgo de sanciones.",
        bullets: [
          "Facturación electrónica automática en cada venta",
          "Cumple con Resolución 000042 de 2020 y actualizaciones",
          "Documento Soporte electrónico incluido",
          "Información exógena generada automáticamente",
          "Soporte DIAN permanente de nuestro equipo",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "No facturar = cierre del negocio por 3 días",
        solution: "Facturación automática en cada venta con SistecPOS",
      },
      {
        pain: "Multas de hasta 15.000 UVT (~$746 millones)",
        solution: "Cumplimiento 100% DIAN desde el día 1",
      },
      {
        pain: "Pierdes deducciones de costos y gastos",
        solution: "Toda transacción documentada electrónicamente",
      },
      {
        pain: "Fiscalización sorpresa de la DIAN",
        solution: "Reportes listos, historial completo, todo en regla",
      },
    ],
    ctaText: "No arriesgues tu negocio: factura correctamente",
    ctaWhatsappMessage:
      "Hola, quiero evitar sanciones DIAN. Necesito facturar electrónicamente con SistecPOS",
    faqs: [
      {
        question: "¿La DIAN realmente cierra negocios?",
        answer:
          "Sí. El artículo 657 del Estatuto Tributario permite a la DIAN cerrar establecimientos por 3 días la primera vez y hasta 30 días en caso de reincidencia. En 2024-2025 se han aplicado miles de cierres en todo el país.",
      },
      {
        question: "¿Cuánto cuesta la sanción por no facturar electrónicamente?",
        answer:
          "1 UVT por cada factura no emitida (~$49.799 COP en 2026), sin exceder 15.000 UVT (~$746 millones). Además, pierdes la deducibilidad de costos y gastos relacionados.",
      },
      {
        question: "¿SistecPOS me protege de las sanciones DIAN?",
        answer:
          "SistecPOS automatiza toda la facturación electrónica: cada venta genera el documento fiscal correcto automáticamente, cumpliendo con toda la normativa vigente. Cero riesgo de sanción por omisión.",
      },
    ],
    relatedLinks: [
      { label: "Calculadora UVT a pesos", href: "/herramientas/calculadora-uvt" },
      { label: "Habilitarse ante la DIAN", href: "/guias-dian/habilitar-facturacion-electronica-dian" },
      { label: "Resolución DIAN 2025", href: "/guias-dian/resolucion-facturacion-electronica-2025" },
    ],
  },
  {
    slug: "limite-uvt-pos-2026",
    keyword: "limite uvt pos 2026",
    metaTitle: "Límite de 5 UVT para Tiquetes POS en 2026: Lo Que Debes Saber | SistecPOS",
    metaDescription:
      "Todo sobre el límite de 5 UVT para tiquetes POS electrónicos en 2026. Cuándo puedes emitir tiquete vs factura electrónica y cómo configurarlo en SistecPOS.",
    heroIcon: Receipt,
    heroBadge: "Límite UVT POS",
    h1: "Límite de 5 UVT para Tiquetes POS en 2026: Lo Que Debes Saber",
    heroSubtitle:
      "Si vendes al por menor, puedes emitir tiquetes POS electrónicos en lugar de facturas — pero solo hasta cierto monto. Aquí te explicamos el límite de 5 UVT y cómo configurarlo.",
    sections: [
      {
        title: "¿Qué es el tiquete POS electrónico?",
        content:
          "El tiquete POS electrónico es un documento fiscal alternativo a la factura electrónica que pueden emitir los negocios al detal (minoristas). A diferencia de la factura, el tiquete no requiere los datos completos del comprador y es más rápido de generar.",
        bullets: [
          "Documento fiscal válido ante la DIAN",
          "No requiere NIT ni datos completos del comprador",
          "Solo válido para ventas al consumidor final",
          "Debe cumplir requisitos técnicos de la DIAN",
        ],
      },
      {
        title: "¿Cuándo puedo emitir tiquete POS en vez de factura?",
        content:
          "La norma establece que puedes emitir tiquete POS electrónico cuando la venta no supere 5 UVT. Si el comprador solicita factura electrónica (por ejemplo, para deducir el IVA), debes emitirla sin importar el monto.",
        bullets: [
          "Ventas menores o iguales a 5 UVT ($248.995 COP aprox. en 2026)",
          "Ventas al consumidor final (no empresas)",
          "El comprador no solicita factura electrónica",
          "Tu negocio está habilitado para emitir documentos POS electrónicos",
        ],
      },
      {
        title: "¿Qué pasa si supero el límite?",
        content:
          "Si la venta supera 5 UVT y emites tiquete POS en lugar de factura electrónica, estás incumpliendo la normativa. La DIAN puede sancionar esta infracción como si no hubieras facturado. Por eso es clave que tu sistema POS cambie automáticamente entre tiquete y factura según el monto.",
      },
      {
        title: "SistecPOS lo gestiona automáticamente",
        content:
          "En SistecPOS, configuras el límite de UVT una sola vez. El sistema detecta automáticamente si la venta requiere tiquete POS o factura electrónica y emite el documento correcto sin que el cajero haga nada diferente.",
        bullets: [
          "Cambio automático entre tiquete POS y factura electrónica",
          "Límite de UVT actualizado con cada año fiscal",
          "Si el cliente pide factura, se emite sin importar el monto",
          "Cero errores del cajero: el sistema decide por él",
          "Cumplimiento 100% con la normativa DIAN vigente",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "El cajero no sabe cuándo emitir tiquete o factura",
        solution: "SistecPOS decide automáticamente según el monto",
      },
      {
        pain: "Riesgo de sanción por emitir tiquete POS cuando corresponde factura",
        solution: "Cambio automático al superar el límite de 5 UVT",
      },
      {
        pain: "Actualizar manualmente el valor UVT cada año",
        solution: "SistecPOS actualiza el valor automáticamente",
      },
    ],
    ctaText: "Factura y genera tiquetes POS sin errores",
    ctaWhatsappMessage:
      "Hola, necesito un POS que gestione automáticamente el límite de UVT para tiquetes POS",
    faqs: [
      {
        question: "¿Cuánto es 5 UVT en pesos colombianos en 2026?",
        answer:
          "Con el valor estimado de UVT para 2026 ($49.799 COP), el límite de 5 UVT equivale a $248.995 COP. Ventas por encima de este monto requieren factura electrónica.",
      },
      {
        question: "¿El tiquete POS electrónico sirve para deducir IVA?",
        answer:
          "No. Solo la factura electrónica permite al comprador deducir el IVA. Si tu cliente es una empresa o necesita deducir costos, debes emitir factura electrónica independientemente del monto.",
      },
      {
        question: "¿SistecPOS emite tiquetes POS electrónicos?",
        answer:
          "Sí. SistecPOS emite tanto tiquetes POS electrónicos como facturas electrónicas, cambiando automáticamente según el monto de la venta y las preferencias del comprador.",
      },
    ],
    relatedLinks: [
      { label: "Calculadora UVT 2026", href: "/herramientas/calculadora-uvt" },
      { label: "Sanciones DIAN", href: "/guias-dian/sanciones-no-facturar-electronicamente" },
      { label: "Facturación Electrónica", href: "/facturacion-electronica" },
    ],
  },
  {
    slug: "documento-soporte-electronico-dian",
    keyword: "documento soporte electrónico dian",
    metaTitle: "¿Qué es el Documento Soporte Electrónico y Cómo Emitirlo? | SistecPOS",
    metaDescription:
      "Guía completa del Documento Soporte electrónico DIAN: qué es, quién debe emitirlo, plazos y cómo generarlo automáticamente con SistecPOS.",
    heroIcon: FileText,
    heroBadge: "Documento Soporte",
    h1: "¿Qué es el Documento Soporte Electrónico y Cómo Emitirlo en SistecPOS?",
    heroSubtitle:
      "Si compras a proveedores que no facturan (no responsables de IVA), estás obligado a emitir Documento Soporte electrónico. Te explicamos qué es, quién lo necesita y cómo automatizarlo.",
    sections: [
      {
        title: "¿Qué es el Documento Soporte?",
        content:
          "El Documento Soporte en adquisiciones efectuadas a no obligados a facturar es un documento electrónico que debe emitir el comprador cuando adquiere bienes o servicios de personas no responsables de IVA (no obligados a facturar).",
        bullets: [
          "Lo emite el COMPRADOR, no el vendedor",
          "Aplica cuando tu proveedor no factura (no es responsable de IVA)",
          "Es obligatorio desde 2023 para todos los contribuyentes habilitados",
          "Debe enviarse a la DIAN como documento electrónico",
          "Permite soportar costos y gastos deducibles en tu declaración de renta",
        ],
      },
      {
        title: "¿Quiénes deben emitir Documento Soporte?",
        content:
          "Todo contribuyente responsable de IVA que compre bienes o servicios a personas naturales no responsables de IVA está obligado a emitir este documento. Es muy común en tiendas, restaurantes, ferreterías y negocios que compran a proveedores informales.",
        bullets: [
          "Restaurantes que compran a proveedores del campo (verduras, frutas, carnes)",
          "Tiendas que compran mercancía a personas naturales",
          "Ferreterías que contratan servicios de transporte informal",
          "Cualquier negocio que pague arriendo a personas naturales no responsables",
          "Empresas que contratan servicios profesionales de no responsables",
        ],
      },
      {
        title: "Requisitos del Documento Soporte electrónico",
        content:
          "El Documento Soporte debe cumplir con los requisitos establecidos en la Resolución 000167 de 2021 y sus actualizaciones. Es un documento XML que se envía a la DIAN como los demás documentos electrónicos.",
        bullets: [
          "Nombres y NIT/cédula del adquirente y del vendedor",
          "Fecha de la operación",
          "Descripción de bienes o servicios adquiridos",
          "Valor de la operación y forma de pago",
          "Firma electrónica del adquirente",
          "Envío a la DIAN dentro de las 24 horas siguientes",
        ],
      },
      {
        title: "SistecPOS genera el Documento Soporte automáticamente",
        content:
          "En SistecPOS, cuando registras una compra a un proveedor marcado como 'no responsable de IVA', el sistema genera automáticamente el Documento Soporte electrónico y lo envía a la DIAN. Cero trabajo manual.",
        bullets: [
          "Generación automática al registrar la compra",
          "Envío a la DIAN sin intervención manual",
          "Proveedor marcado como 'no responsable' una sola vez",
          "Historial completo de documentos soporte emitidos",
          "Incluido en el reporte de información exógena",
        ],
      },
    ],
    painVsSolution: [
      {
        pain: "No sabes qué es el Documento Soporte ni cuándo emitirlo",
        solution: "SistecPOS lo emite automáticamente al registrar compras",
      },
      {
        pain: "Perder deducciones por no soportar compras a informales",
        solution: "Toda compra queda documentada y es deducible",
      },
      {
        pain: "Generar el XML manualmente en el portal DIAN",
        solution: "Generación y envío automático desde el POS",
      },
    ],
    ctaText: "Automatiza tus Documentos Soporte con SistecPOS",
    ctaWhatsappMessage:
      "Hola, necesito un POS que genere Documentos Soporte electrónicos automáticamente",
    faqs: [
      {
        question: "¿Qué pasa si no emito Documento Soporte?",
        answer:
          "No podrás soportar esos costos o gastos en tu declaración de renta, lo que aumenta tu base gravable y pagas más impuestos. Además, la DIAN puede sancionar la omisión.",
      },
      {
        question: "¿El Documento Soporte reemplaza a la factura?",
        answer:
          "No. El Documento Soporte es complementario. Lo emites TÚ como comprador cuando tu proveedor no está obligado a facturar. Si tu proveedor te entrega factura electrónica, no necesitas emitir Documento Soporte.",
      },
      {
        question: "¿SistecPOS incluye el Documento Soporte en todos los planes?",
        answer:
          "Sí. El Documento Soporte electrónico está incluido en todos los planes de SistecPOS que tienen facturación electrónica habilitada.",
      },
    ],
    relatedLinks: [
      { label: "Habilitarse ante la DIAN", href: "/guias-dian/habilitar-facturacion-electronica-dian" },
      { label: "Resolución DIAN 2025", href: "/guias-dian/resolucion-facturacion-electronica-2025" },
      { label: "Validador de NIT", href: "/herramientas/validador-nit" },
    ],
  },
];
