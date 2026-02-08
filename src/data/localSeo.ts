 // Datos para landing pages SEO por ciudad/localidad
 // Estrategia: Dominar SEO local en Colombia con ciudades de alta densidad empresarial y adopción de facturación electrónica
 
 export interface LocalLanding {
   slug: string;
   city: string;
   cityFull: string;
   region: string;
   title: string;
   heroTitle: string;
   heroSubtitle: string;
   metaTitle: string;
   metaDescription: string;
   highlights: string[];
   nearbyAreas: string[];
   isPresencial: boolean; // true = servicio presencial, false = solo remoto
 }
 
 export const localLandings: LocalLanding[] = [
   // ==================== SANTANDER (Área Metropolitana - PRESENCIAL) ====================
   {
     slug: "bucaramanga",
     city: "Bucaramanga",
     cityFull: "Bucaramanga",
     region: "Santander",
     title: "Software POS en Bucaramanga",
     heroTitle: "Software POS con Instalación Presencial en Bucaramanga",
     heroSubtitle: "Vamos a tu negocio en Bucaramanga. Te instalamos el sistema, configuramos tus productos y capacitamos a tu equipo el mismo día.",
     metaTitle: "Software POS en Bucaramanga | Instalación Presencial | SistecPOS",
     metaDescription: "Software punto de venta para negocios en Bucaramanga con instalación presencial, capacitación incluida y soporte técnico local. Cotiza ahora.",
     highlights: [
       "Instalación el mismo día en Bucaramanga",
       "Soporte técnico presencial",
       "Más de 100 negocios bumangueses confían en nosotros",
       "Cobertura en todos los barrios de Bucaramanga"
     ],
     nearbyAreas: ["Cabecera", "Cañaveral", "Lagos del Cacique", "Real de Minas", "Provenza", "Ciudadela", "Centro", "San Francisco"],
     isPresencial: true
   },
   {
     slug: "floridablanca",
     city: "Floridablanca",
     cityFull: "Floridablanca",
     region: "Santander",
     title: "Software POS en Floridablanca",
     heroTitle: "Software POS con Instalación Presencial en Floridablanca",
     heroSubtitle: "Atendemos negocios en todo Floridablanca. Instalación, configuración y capacitación directamente en tu local.",
     metaTitle: "Software POS en Floridablanca | Instalación Presencial | SistecPOS",
     metaDescription: "Sistema punto de venta para comercios en Floridablanca con instalación en sitio, capacitación a tu equipo y soporte técnico local.",
     highlights: [
       "Atención inmediata en Floridablanca",
       "Instalación y capacitación en tu negocio",
       "Soporte técnico el mismo día",
       "Cobertura en Cañaveral, Lagos, Autopista y más"
     ],
     nearbyAreas: ["Cañaveral", "Lagos", "Autopista", "Centro", "Bucarica", "Caldas", "El Bosque", "La Cumbre"],
     isPresencial: true
   },
   {
     slug: "giron",
     city: "Girón",
     cityFull: "San Juan de Girón",
     region: "Santander",
     title: "Software POS en Girón",
     heroTitle: "Software POS con Instalación Presencial en Girón",
     heroSubtitle: "Llevamos el software POS a tu negocio en Girón. Instalación completa, capacitación y soporte técnico cercano.",
     metaTitle: "Software POS en Girón | Instalación Presencial | SistecPOS",
     metaDescription: "Software punto de venta para negocios en Girón, Santander. Instalación presencial, capacitación incluida y soporte técnico local.",
     highlights: [
       "Servicio presencial en todo Girón",
       "Instalación y configuración en tu local",
       "Soporte técnico rápido",
       "Atención en zona industrial y centro"
     ],
     nearbyAreas: ["Centro Histórico", "Rincón de Girón", "Zona Industrial", "Acapulco", "Hacaritama", "Portal de Girón"],
     isPresencial: true
   },
   {
     slug: "piedecuesta",
     city: "Piedecuesta",
     cityFull: "Piedecuesta",
     region: "Santander",
     title: "Software POS en Piedecuesta",
     heroTitle: "Software POS con Instalación Presencial en Piedecuesta",
     heroSubtitle: "Atendemos comercios en Piedecuesta con servicio personalizado. Instalación, capacitación y soporte en tu negocio.",
     metaTitle: "Software POS en Piedecuesta | Instalación Presencial | SistecPOS",
     metaDescription: "Sistema POS para comercios en Piedecuesta con instalación en sitio, capacitación presencial y soporte técnico en el área metropolitana.",
     highlights: [
       "Atención directa en Piedecuesta",
       "Instalación y capacitación presencial",
       "Soporte técnico en el área metropolitana",
       "Servicio para comercios de todos los tamaños"
     ],
     nearbyAreas: ["Centro", "La Feria", "Paseo del Puente", "Guatiguará", "Vijagual", "Mensulí"],
      isPresencial: true
    },
    {
      slug: "lebrija",
      city: "Lebrija",
      cityFull: "Lebrija",
      region: "Santander",
      title: "Software POS en Lebrija",
      heroTitle: "Software POS con Instalación Presencial en Lebrija",
      heroSubtitle: "Llevamos el software POS a tu negocio en Lebrija. Instalación completa, capacitación y soporte técnico desde el área metropolitana.",
      metaTitle: "Software POS en Lebrija | Instalación Presencial | SistecPOS",
      metaDescription: "Software punto de venta para comercios en Lebrija, Santander. Instalación presencial, capacitación incluida y soporte técnico local.",
      highlights: [
        "Servicio presencial desde el área metropolitana",
        "Instalación y configuración en tu local",
        "Soporte técnico rápido",
        "Ideal para comercios agrícolas y tiendas"
      ],
      nearbyAreas: ["Centro", "Zona Rural", "Vía al Aeropuerto", "La Renta", "San Bernardo"],
      isPresencial: true
    },
  
    // ==================== BOGOTÁ Y CUNDINAMARCA ====================
   {
     slug: "bogota",
     city: "Bogotá",
     cityFull: "Bogotá D.C.",
     region: "Cundinamarca",
     title: "Software POS en Bogotá",
     heroTitle: "Software POS para Negocios en Bogotá",
     heroSubtitle: "El software punto de venta #1 para comercios en Bogotá. Instalación remota asistida, capacitación virtual y soporte 24/7.",
     metaTitle: "Software POS en Bogotá | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Bogotá con facturación electrónica DIAN, modo offline 8 días y soporte remoto. Cotiza gratis.",
     highlights: [
       "Facturación electrónica DIAN integrada",
       "Funciona offline hasta 8 días",
       "Instalación remota el mismo día",
       "Soporte técnico 24/7"
     ],
     nearbyAreas: ["Chapinero", "Usaquén", "Kennedy", "Suba", "Fontibón", "Teusaquillo", "Centro", "Zona Norte"],
     isPresencial: false
   },
   {
     slug: "soacha",
     city: "Soacha",
     cityFull: "Soacha",
     region: "Cundinamarca",
     title: "Software POS en Soacha",
     heroTitle: "Software POS para Negocios en Soacha",
     heroSubtitle: "Sistema punto de venta ideal para comercios en Soacha. Fácil de usar, económico y con soporte remoto incluido.",
     metaTitle: "Software POS en Soacha | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para tiendas y negocios en Soacha con inventario, facturación y modo offline. Instalación remota rápida.",
     highlights: [
       "Ideal para tiendas de barrio",
       "Control de inventario completo",
       "Funciona sin internet",
       "Soporte remoto incluido"
     ],
     nearbyAreas: ["Centro", "San Mateo", "Compartir", "Ciudad Verde", "Cazucá", "Bosa"],
     isPresencial: false
   },
 
   // ==================== ANTIOQUIA ====================
   {
     slug: "medellin",
     city: "Medellín",
     cityFull: "Medellín",
     region: "Antioquia",
     title: "Software POS en Medellín",
     heroTitle: "Software POS para Negocios en Medellín",
     heroSubtitle: "El software punto de venta preferido por comerciantes paisas. Instalación remota, capacitación virtual y soporte continuo.",
     metaTitle: "Software POS en Medellín | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Medellín con facturación DIAN, inventario y modo offline. Instalación remota y soporte incluido.",
     highlights: [
       "Preferido por comerciantes paisas",
       "Facturación electrónica DIAN",
       "Modo offline hasta 8 días",
       "Instalación remota el mismo día"
     ],
     nearbyAreas: ["El Poblado", "Laureles", "Envigado", "Itagüí", "Bello", "Sabaneta", "La América", "Centro"],
     isPresencial: false
   },
   {
     slug: "envigado",
     city: "Envigado",
     cityFull: "Envigado",
     region: "Antioquia",
     title: "Software POS en Envigado",
     heroTitle: "Software POS para Negocios en Envigado",
     heroSubtitle: "Sistema punto de venta para comercios en Envigado. Fácil de usar, con inventario y facturación electrónica.",
     metaTitle: "Software POS en Envigado | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para tiendas en Envigado con control de inventario, facturación DIAN y soporte remoto. Cotiza gratis.",
     highlights: [
       "Ideal para comercio local",
       "Control de inventario incluido",
       "Facturación electrónica",
       "Capacitación virtual incluida"
     ],
     nearbyAreas: ["Centro", "La Magnolia", "Zúñiga", "La Paz", "El Portal", "Las Vegas"],
     isPresencial: false
   },
   {
     slug: "itagui",
     city: "Itagüí",
     cityFull: "Itagüí",
     region: "Antioquia",
     title: "Software POS en Itagüí",
     heroTitle: "Software POS para Negocios en Itagüí",
     heroSubtitle: "Software punto de venta para la zona industrial de Itagüí. Control de inventario robusto y facturación electrónica.",
     metaTitle: "Software POS en Itagüí | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Itagüí con inventario, múltiples sucursales y facturación DIAN. Instalación remota.",
     highlights: [
       "Ideal para zona industrial",
       "Gestión multi-sucursal",
       "Inventario robusto",
       "Facturación electrónica DIAN"
     ],
     nearbyAreas: ["Centro", "Ditaires", "Santa María", "Pilsen", "Zona Industrial"],
     isPresencial: false
   },
 
   // ==================== VALLE DEL CAUCA ====================
   {
     slug: "cali",
     city: "Cali",
     cityFull: "Santiago de Cali",
     region: "Valle del Cauca",
     title: "Software POS en Cali",
     heroTitle: "Software POS para Negocios en Cali",
     heroSubtitle: "El software punto de venta que revoluciona los negocios caleños. Instalación remota rápida, fácil de usar y con soporte incluido.",
     metaTitle: "Software POS en Cali | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Cali con facturación DIAN, inventario y modo offline. Instalación remota y capacitación virtual.",
     highlights: [
       "Fácil de usar para cualquier negocio",
       "Facturación electrónica DIAN",
       "Funciona offline hasta 8 días",
       "Soporte remoto continuo"
     ],
     nearbyAreas: ["El Peñón", "Granada", "Ciudad Jardín", "San Fernando", "Centro", "Yumbo", "Jamundí", "Palmira"],
     isPresencial: false
   },
   {
     slug: "palmira",
     city: "Palmira",
     cityFull: "Palmira",
     region: "Valle del Cauca",
     title: "Software POS en Palmira",
     heroTitle: "Software POS para Negocios en Palmira",
     heroSubtitle: "Sistema punto de venta para comercios en Palmira. Control de inventario, facturación y soporte remoto.",
     metaTitle: "Software POS en Palmira | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para tiendas en Palmira con inventario, facturación DIAN y modo offline. Cotiza gratis.",
     highlights: [
       "Ideal para comercio agrícola",
       "Control de inventario completo",
       "Facturación electrónica",
       "Instalación remota rápida"
     ],
     nearbyAreas: ["Centro", "La Emilia", "Zamorano", "Las Mercedes", "Coronado"],
     isPresencial: false
   },
 
   // ==================== ATLÁNTICO ====================
   {
     slug: "barranquilla",
     city: "Barranquilla",
     cityFull: "Barranquilla",
     region: "Atlántico",
     title: "Software POS en Barranquilla",
     heroTitle: "Software POS para Negocios en Barranquilla",
     heroSubtitle: "El software punto de venta para el comercio costeño. Instalación remota, facturación DIAN y soporte continuo.",
     metaTitle: "Software POS en Barranquilla | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Barranquilla con facturación electrónica, inventario y modo offline. Instalación remota.",
     highlights: [
       "Diseñado para comercio costeño",
       "Facturación electrónica DIAN",
       "Modo offline hasta 8 días",
       "Capacitación virtual incluida"
     ],
     nearbyAreas: ["El Prado", "Alto Prado", "Riomar", "Puerto Colombia", "Soledad", "Centro", "Buenavista", "Villa Country"],
     isPresencial: false
   },
   {
     slug: "soledad",
     city: "Soledad",
     cityFull: "Soledad",
     region: "Atlántico",
     title: "Software POS en Soledad",
     heroTitle: "Software POS para Negocios en Soledad",
     heroSubtitle: "Sistema punto de venta accesible para comercios en Soledad. Fácil de usar, económico y con soporte incluido.",
     metaTitle: "Software POS en Soledad | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para tiendas en Soledad, Atlántico. Control de inventario, facturación y soporte remoto.",
     highlights: [
       "Económico y accesible",
       "Ideal para tiendas de barrio",
       "Control de inventario",
       "Funciona sin internet"
     ],
     nearbyAreas: ["Centro", "Villa Estadio", "Villa Katanga", "Los Almendros", "Salamanca"],
     isPresencial: false
   },
 
   // ==================== BOLÍVAR ====================
   {
     slug: "cartagena",
     city: "Cartagena",
     cityFull: "Cartagena de Indias",
     region: "Bolívar",
     title: "Software POS en Cartagena",
     heroTitle: "Software POS para Negocios en Cartagena",
     heroSubtitle: "El software punto de venta para el comercio y turismo cartagenero. Ideal para restaurantes, tiendas y hoteles.",
     metaTitle: "Software POS en Cartagena | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Cartagena con facturación DIAN, ideal para turismo, restaurantes y comercio. Instalación remota.",
     highlights: [
       "Ideal para sector turístico",
       "Multi-divisa para turistas",
       "Facturación electrónica DIAN",
       "Modo offline para zonas con mala señal"
     ],
     nearbyAreas: ["Bocagrande", "Centro Histórico", "Getsemaní", "Manga", "El Laguito", "Crespo", "Mamonal", "Turbaco"],
     isPresencial: false
   },
 
   // ==================== NORTE DE SANTANDER ====================
   {
     slug: "cucuta",
     city: "Cúcuta",
     cityFull: "San José de Cúcuta",
     region: "Norte de Santander",
     title: "Software POS en Cúcuta",
     heroTitle: "Software POS para Negocios en Cúcuta",
     heroSubtitle: "Sistema punto de venta para el comercio fronterizo. Multi-divisa, facturación DIAN y modo offline robusto.",
     metaTitle: "Software POS en Cúcuta | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Cúcuta con soporte multi-divisa, facturación DIAN y modo offline hasta 8 días.",
     highlights: [
       "Ideal para comercio fronterizo",
       "Soporte multi-divisa (COP, VES, USD)",
       "Modo offline 8 días",
       "Facturación electrónica DIAN"
     ],
     nearbyAreas: ["Centro", "Caobos", "La Riviera", "Prados del Este", "Atalaya", "Villa del Rosario", "Los Patios"],
     isPresencial: false
   },
 
   // ==================== TOLIMA ====================
   {
     slug: "ibague",
     city: "Ibagué",
     cityFull: "Ibagué",
     region: "Tolima",
     title: "Software POS en Ibagué",
     heroTitle: "Software POS para Negocios en Ibagué",
     heroSubtitle: "El software punto de venta para comercios en la capital musical. Fácil de usar, con inventario y facturación.",
     metaTitle: "Software POS en Ibagué | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Ibagué con control de inventario, facturación DIAN y modo offline. Instalación remota.",
     highlights: [
       "Fácil de usar",
       "Control de inventario completo",
       "Facturación electrónica DIAN",
       "Soporte remoto incluido"
     ],
     nearbyAreas: ["Centro", "El Vergel", "Piedra Pintada", "Cádiz", "La Pola", "Santa Helena"],
     isPresencial: false
   },
 
   // ==================== RISARALDA ====================
   {
     slug: "pereira",
     city: "Pereira",
     cityFull: "Pereira",
     region: "Risaralda",
     title: "Software POS en Pereira",
     heroTitle: "Software POS para Negocios en Pereira",
     heroSubtitle: "Sistema punto de venta para el Eje Cafetero. Control de inventario, facturación y soporte remoto.",
     metaTitle: "Software POS en Pereira | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Pereira con inventario, facturación DIAN y modo offline. Ideal para el Eje Cafetero.",
     highlights: [
       "Ideal para el Eje Cafetero",
       "Control de inventario",
       "Facturación electrónica DIAN",
       "Instalación remota rápida"
     ],
     nearbyAreas: ["Centro", "Pinares", "Álamos", "Cuba", "Dosquebradas", "Cerritos"],
     isPresencial: false
   },
 
   // ==================== CALDAS ====================
   {
     slug: "manizales",
     city: "Manizales",
     cityFull: "Manizales",
     region: "Caldas",
     title: "Software POS en Manizales",
     heroTitle: "Software POS para Negocios en Manizales",
     heroSubtitle: "El software punto de venta para comercios manizaleños. Fácil, completo y con soporte continuo.",
     metaTitle: "Software POS en Manizales | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Manizales con inventario, facturación DIAN y modo offline. Instalación remota.",
     highlights: [
       "Diseñado para comercio local",
       "Control de inventario completo",
       "Facturación electrónica DIAN",
       "Capacitación virtual incluida"
     ],
     nearbyAreas: ["Centro", "Palermo", "Chipre", "El Cable", "Palogrande", "Villamaría"],
     isPresencial: false
   },
 
   // ==================== HUILA ====================
   {
     slug: "neiva",
     city: "Neiva",
     cityFull: "Neiva",
     region: "Huila",
     title: "Software POS en Neiva",
     heroTitle: "Software POS para Negocios en Neiva",
     heroSubtitle: "Sistema punto de venta para el comercio opita. Control de inventario, facturación y soporte remoto.",
     metaTitle: "Software POS en Neiva | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Neiva con inventario, facturación DIAN y modo offline hasta 8 días.",
     highlights: [
       "Ideal para comercio regional",
       "Control de inventario",
       "Modo offline 8 días",
       "Soporte remoto 24/7"
     ],
     nearbyAreas: ["Centro", "Quirinal", "Altico", "Cándido", "Las Brisas", "San Pedro"],
     isPresencial: false
   },
 
   // ==================== META ====================
   {
     slug: "villavicencio",
     city: "Villavicencio",
     cityFull: "Villavicencio",
     region: "Meta",
     title: "Software POS en Villavicencio",
     heroTitle: "Software POS para Negocios en Villavicencio",
     heroSubtitle: "El software punto de venta para el comercio llanero. Robusto, offline y con soporte continuo.",
     metaTitle: "Software POS en Villavicencio | Sistema Punto de Venta | SistecPOS",
     metaDescription: "Software POS para negocios en Villavicencio con modo offline, inventario y facturación DIAN. Instalación remota.",
     highlights: [
       "Ideal para los Llanos Orientales",
       "Modo offline hasta 8 días",
       "Control de inventario robusto",
       "Facturación electrónica DIAN"
     ],
     nearbyAreas: ["Centro", "Porfía", "Barzal", "7 de Agosto", "La Grama", "Kirpas"],
     isPresencial: false
    },
  
    // ==================== QUINDÍO ====================
    {
      slug: "armenia",
      city: "Armenia",
      cityFull: "Armenia",
      region: "Quindío",
      title: "Software POS en Armenia",
      heroTitle: "Software POS para Negocios en Armenia",
      heroSubtitle: "El software punto de venta para el corazón del Eje Cafetero. Ideal para comercios, restaurantes y tiendas en Armenia.",
      metaTitle: "Software POS en Armenia | Sistema Punto de Venta | SistecPOS",
      metaDescription: "Software POS para negocios en Armenia, Quindío con facturación DIAN, inventario y modo offline. Instalación remota.",
      highlights: [
        "Ideal para el Eje Cafetero",
        "Facturación electrónica DIAN",
        "Modo offline hasta 8 días",
        "Soporte remoto 24/7"
      ],
      nearbyAreas: ["Centro", "La Castellana", "Cañas Gordas", "Fundadores", "Calarcá", "Circasia", "Montenegro"],
      isPresencial: false
    },

    // ==================== NARIÑO ====================
    {
      slug: "pasto",
      city: "Pasto",
      cityFull: "San Juan de Pasto",
      region: "Nariño",
      title: "Software POS en Pasto",
      heroTitle: "Software POS para Negocios en Pasto",
      heroSubtitle: "Sistema punto de venta para comercios nariñenses. Robusto, con modo offline y facturación electrónica DIAN.",
      metaTitle: "Software POS en Pasto | Sistema Punto de Venta | SistecPOS",
      metaDescription: "Software POS para negocios en Pasto con inventario, facturación DIAN y modo offline 8 días. Instalación remota.",
      highlights: [
        "Diseñado para comercio regional",
        "Funciona offline hasta 8 días",
        "Facturación electrónica DIAN",
        "Capacitación virtual incluida"
      ],
      nearbyAreas: ["Centro", "La Aurora", "Torobajo", "Pandiaco", "Lorenzo", "El Tejar", "Obonuco"],
      isPresencial: false
    },

    // ==================== CÓRDOBA ====================
    {
      slug: "monteria",
      city: "Montería",
      cityFull: "Montería",
      region: "Córdoba",
      title: "Software POS en Montería",
      heroTitle: "Software POS para Negocios en Montería",
      heroSubtitle: "El software punto de venta para el comercio cordobés. Fácil de usar, con inventario y soporte remoto incluido.",
      metaTitle: "Software POS en Montería | Sistema Punto de Venta | SistecPOS",
      metaDescription: "Software POS para negocios en Montería con facturación DIAN, inventario y modo offline. Instalación remota.",
      highlights: [
        "Ideal para comercio ganadero y agrícola",
        "Facturación electrónica DIAN",
        "Modo offline hasta 8 días",
        "Instalación remota el mismo día"
      ],
      nearbyAreas: ["Centro", "El Recreo", "La Castellana", "Mogambo", "Urbina", "Cantaclaro", "Cereté"],
      isPresencial: false
    },

    // ==================== CESAR ====================
    {
      slug: "valledupar",
      city: "Valledupar",
      cityFull: "Valledupar",
      region: "Cesar",
      title: "Software POS en Valledupar",
      heroTitle: "Software POS para Negocios en Valledupar",
      heroSubtitle: "Sistema punto de venta para la capital del vallenato. Control de inventario, facturación y soporte remoto.",
      metaTitle: "Software POS en Valledupar | Sistema Punto de Venta | SistecPOS",
      metaDescription: "Software POS para negocios en Valledupar con inventario, facturación DIAN y modo offline. Instalación remota.",
      highlights: [
        "Diseñado para comercio cesarense",
        "Facturación electrónica DIAN",
        "Control de inventario completo",
        "Soporte remoto 24/7"
      ],
      nearbyAreas: ["Centro", "Novalito", "Garupal", "Villa del Rosario", "Los Mayales", "Sabana Crespo", "La Nevada"],
      isPresencial: false
    },

    // ==================== MAGDALENA ====================
    {
      slug: "santa-marta",
      city: "Santa Marta",
      cityFull: "Santa Marta",
      region: "Magdalena",
      title: "Software POS en Santa Marta",
      heroTitle: "Software POS para Negocios en Santa Marta",
      heroSubtitle: "El software punto de venta para el comercio y turismo samario. Ideal para restaurantes, hoteles y tiendas.",
      metaTitle: "Software POS en Santa Marta | Sistema Punto de Venta | SistecPOS",
      metaDescription: "Software POS para negocios en Santa Marta con facturación DIAN, modo offline y soporte remoto. Ideal para turismo.",
      highlights: [
        "Ideal para sector turístico",
        "Facturación electrónica DIAN",
        "Modo offline para zonas rurales",
        "Instalación remota rápida"
      ],
      nearbyAreas: ["Centro Histórico", "El Rodadero", "Bello Horizonte", "Taganga", "Mamatoco", "Gaira", "Pozos Colorados"],
      isPresencial: false
    }
  ];
 
 // Ciudades con servicio presencial (Área Metropolitana de Bucaramanga)
 export const presencialCities = localLandings.filter(l => l.isPresencial);
 
 // Ciudades con servicio remoto
 export const remoteCities = localLandings.filter(l => !l.isPresencial);
 
 // Ciudades principales para mostrar en navegación
 export const featuredCities = localLandings.filter(l => 
   ["bogota", "medellin", "cali", "barranquilla", "bucaramanga", "cartagena"].includes(l.slug)
 );
 
 export const getLocalLandingBySlug = (slug: string): LocalLanding | undefined => {
   return localLandings.find(l => l.slug === slug);
 };
 
 export const getAllLocalSlugs = (): string[] => {
   return localLandings.map(l => l.slug);
 };
 
 export const getCitiesByRegion = (region: string): LocalLanding[] => {
   return localLandings.filter(l => l.region === region);
 };
