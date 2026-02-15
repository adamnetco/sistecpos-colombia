import { WHATSAPP_DEFAULT_NUMBER } from "@/hooks/useWhatsAppConfig";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Schema generators – accept optional whatsappNumber for dynamic use
export function organizationSchema(whatsappNumber?: string) {
  const num = whatsappNumber || WHATSAPP_DEFAULT_NUMBER;
  const phone = `+${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5, 8)}-${num.slice(8)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SistecPOS",
    url: "https://sistecpos.com",
    logo: "https://sistecpos.com/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png",
    description: "Software POS con facturación electrónica DIAN, inventario y soporte presencial en Colombia.",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "customer service",
        contactOption: "TollFree",
        availableLanguage: "Spanish",
        areaServed: "CO",
      },
      {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "sales",
        availableLanguage: "Spanish",
        areaServed: "CO",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Transversal 112 # 19 - 22, Oficina 309, Viveros de Pronveza",
      addressLocality: "Floridablanca",
      addressRegion: "Santander",
      postalCode: "681003",
      addressCountry: "CO",
    },
    sameAs: [
      `https://wa.me/${num}`,
      "https://www.instagram.com/sistecpos",
      "https://www.facebook.com/sistecpos",
      "https://www.tiktok.com/@sistecpos",
    ],
    potentialAction: {
      "@type": "CommunicateAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://wa.me/${num}?text=Hola%20SistecPOS%2C%20quiero%20informaci%C3%B3n%20sobre%20el%20software`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
          "http://schema.org/AndroidPlatform",
          "http://schema.org/IOSPlatform",
        ],
      },
      name: "Cotización por WhatsApp",
      description: "Solicitar cotización",
    },
  };
}

export function localBusinessSchema(city: string, isPresencial: boolean, whatsappNumber?: string) {
  const num = whatsappNumber || WHATSAPP_DEFAULT_NUMBER;
  const phone = `+${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5, 8)}-${num.slice(8)}`;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `SistecPOS ${city}`,
    description: `Software POS con ${isPresencial ? "instalación presencial" : "instalación remota"} en ${city}`,
    url: `https://sistecpos.com/software-pos/${city.toLowerCase().replace(/\s+/g, "-")}`,
    telephone: phone,
    image: "https://sistecpos.com/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "CO",
    },
    priceRange: "$$",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone,
      contactType: "customer service",
      availableLanguage: "Spanish",
      areaServed: "CO",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
    potentialAction: {
      "@type": "CommunicateAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://wa.me/${num}?text=Hola%20SistecPOS%2C%20quiero%20informaci%C3%B3n%20sobre%20el%20software%20POS%20en%20` + encodeURIComponent(city),
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      name: "Cotización por WhatsApp",
      description: "Solicitar cotización",
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function softwareApplicationSchema(opts: {
  name: string;
  description: string;
  url: string;
  compareName?: string;
}) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "SistecPOS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Windows, Android",
      description: opts.description,
      url: opts.url,
      offers: {
        "@type": "Offer",
        price: "12",
        priceCurrency: "USD",
        priceValidUntil: "2026-12-31",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
      },
      featureList: [
        "Facturación electrónica DIAN",
        "Modo offline hasta 8 días",
        "16 módulos especializados",
        "Instalación presencial en Santander",
        "Soporte WhatsApp mismo día",
      ],
    },
    ...(opts.compareName
      ? [
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: opts.compareName,
            applicationCategory: "BusinessApplication",
          },
        ]
      : []),
  ];
}

export function productSchema(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  priceCOP: number;
  priceUSD?: number;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.image && { image: `https://sistecpos.com${opts.image}` }),
    brand: {
      "@type": "Brand",
      name: "SistecPOS",
    },
    category: opts.category,
    offers: {
      "@type": "Offer",
      price: opts.priceUSD || Math.round(opts.priceCOP / 4200),
      priceCurrency: "USD",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "SistecPOS",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "120",
      bestRating: "5",
    },
  };
}

export function jobPostingSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Representante Comercial SistecPOS",
    description: "Únete como representante comercial de SistecPOS en tu ciudad. Vende software POS con soporte presencial y gana comisiones atractivas sin inversión inicial.",
    datePosted: "2025-01-01",
    validThrough: "2026-12-31",
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: "SistecPOS",
      sameAs: "https://sistecpos.com",
      logo: "https://sistecpos.com/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CO",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Colombia",
    },
    jobLocationType: "TELECOMMUTE",
  };
}

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: {
      "@type": "Organization",
      name: "SistecPOS",
      url: "https://sistecpos.com",
    },
  };
}
