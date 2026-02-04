// Datos para landing pages SEO por ciudad/localidad

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
}

export const localLandings: LocalLanding[] = [
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
    nearbyAreas: ["Cabecera", "Cañaveral", "Lagos del Cacique", "Real de Minas", "Provenza", "Ciudadela", "Centro", "San Francisco"]
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
    nearbyAreas: ["Cañaveral", "Lagos", "Autopista", "Centro", "Bucarica", "Caldas", "El Bosque", "La Cumbre"]
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
    nearbyAreas: ["Centro Histórico", "Rincón de Girón", "Zona Industrial", "Acapulco", "Hacaritama", "Portal de Girón"]
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
    nearbyAreas: ["Centro", "La Feria", "Paseo del Puente", "Guatiguará", "Vijagual", "Mensulí"]
  }
];

export const getLocalLandingBySlug = (slug: string): LocalLanding | undefined => {
  return localLandings.find(l => l.slug === slug);
};

export const getAllLocalSlugs = (): string[] => {
  return localLandings.map(l => l.slug);
};
