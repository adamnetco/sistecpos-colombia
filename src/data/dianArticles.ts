import {
  AlertTriangle,
  Clock,
  FileCheck,
  HelpCircle,
  LogIn,
  Globe,
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
];
