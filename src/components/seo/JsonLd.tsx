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

// Schema generators
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SistecPOS",
    url: "https://sistecpos.lovable.app",
    logo: "https://sistecpos.lovable.app/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+57-317-626-8307",
      contactType: "sales",
      availableLanguage: "Spanish",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Transversal 112 # 19 - 22, Oficina 309, Viveros de Pronveza",
      addressLocality: "Bucaramanga",
      addressRegion: "Santander",
      addressCountry: "CO",
    },
    sameAs: ["https://wa.me/573176268307"],
  };
}

export function localBusinessSchema(city: string, isPresencial: boolean) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `SistecPOS ${city}`,
    description: `Software POS con ${isPresencial ? "instalación presencial" : "instalación remota"} en ${city}`,
    url: `https://sistecpos.lovable.app/software-pos/${city.toLowerCase().replace(/\s+/g, "-")}`,
    telephone: "+57-317-626-8307",
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "CO",
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
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
