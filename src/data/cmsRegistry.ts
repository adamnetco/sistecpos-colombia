/**
 * CMS Section Registry
 * Maps every section_key to a human-readable label, description, content type,
 * and the section group it belongs to — so admins never need to guess keys.
 */

export interface CMSSectionDef {
  key: string;
  label: string;
  description: string;
  type: "text" | "html" | "markdown" | "image" | "json";
  group: string; // visual group inside the page
}

export interface CMSPageDef {
  path: string;
  label: string;
  category: string; // Comercial, Institucional, Marketing
  icon: string; // lucide icon name
  sections: CMSSectionDef[];
}

/* ────────── HOME ────────── */
const homeSections: CMSSectionDef[] = [
  // Hero
  { key: "hero_badge", label: "Badge superior", description: "Texto del badge de urgencia en el hero", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 del hero. Soporta HTML (<span class='gradient-text'>...)", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo debajo del título", type: "text", group: "Hero" },
  { key: "hero_cta_primary", label: "Botón principal", description: "Texto del CTA verde principal", type: "text", group: "Hero" },
  { key: "hero_cta_secondary", label: "Botón secundario", description: "Texto del CTA outline", type: "text", group: "Hero" },

  // Social Proof Bar
  { key: "social_proof_stats", label: "Estadísticas de confianza", description: "JSON: [{value, suffix, label, icon}]", type: "json", group: "Barra de Confianza" },

  // Software Preview
  { key: "preview_badge", label: "Badge", description: "Etiqueta sobre el título", type: "text", group: "Vista Previa Software" },
  { key: "preview_title", label: "Título", description: "Título de la sección de preview", type: "html", group: "Vista Previa Software" },
  { key: "preview_subtitle", label: "Subtítulo", description: "Descripción debajo del título", type: "text", group: "Vista Previa Software" },
  { key: "preview_image", label: "Imagen del dashboard", description: "Captura/imagen del software", type: "image", group: "Vista Previa Software" },

  // Comparison
  { key: "comparison_badge", label: "Badge", description: "Etiqueta sobre la tabla", type: "text", group: "Tabla Comparativa" },
  { key: "comparison_title", label: "Título", description: "Título de la sección", type: "html", group: "Tabla Comparativa" },
  { key: "comparison_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Tabla Comparativa" },
  { key: "comparison_data", label: "Datos de la tabla", description: "JSON con filas de comparación", type: "json", group: "Tabla Comparativa" },

  // Why Us
  { key: "whyus_badge", label: "Badge", description: "Etiqueta de la sección", type: "text", group: "¿Por Qué Nosotros?" },
  { key: "whyus_title", label: "Título", description: "Título principal", type: "html", group: "¿Por Qué Nosotros?" },
  { key: "whyus_benefits", label: "Beneficios", description: "JSON: [{icon, title, description}]", type: "json", group: "¿Por Qué Nosotros?" },

  // Features
  { key: "features_badge", label: "Badge", description: "Etiqueta de la sección", type: "text", group: "Características" },
  { key: "features_title", label: "Título", description: "Título principal", type: "html", group: "Características" },

  // Local Trust
  { key: "localtrust_badge", label: "Badge", description: "Etiqueta de la sección", type: "text", group: "Confianza Local" },
  { key: "localtrust_title", label: "Título", description: "Título principal", type: "html", group: "Confianza Local" },
  { key: "localtrust_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Confianza Local" },

  // Solutions
  { key: "solutions_badge", label: "Badge", description: "Etiqueta de la sección", type: "text", group: "Soluciones" },
  { key: "solutions_title", label: "Título", description: "Título principal", type: "html", group: "Soluciones" },

  // Coverage
  { key: "coverage_label", label: "Badge", description: "Etiqueta de la sección", type: "text", group: "Cobertura" },
  { key: "coverage_title", label: "Título", description: "Título principal", type: "html", group: "Cobertura" },
  { key: "coverage_footer", label: "Texto al pie", description: "Texto debajo de las ciudades", type: "text", group: "Cobertura" },

  // Connect POS
  { key: "connectpos_badge", label: "Badge", description: "Etiqueta de la sección", type: "text", group: "Conecta al POS" },
  { key: "connectpos_title", label: "Título", description: "Título principal", type: "html", group: "Conecta al POS" },
  { key: "connectpos_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Conecta al POS" },

  // CTA
  { key: "cta_urgency_badge", label: "Badge de urgencia", description: "Badge superior de la sección CTA", type: "text", group: "Llamada a la Acción (CTA)" },
  { key: "cta_title", label: "Título", description: "Título principal del CTA", type: "text", group: "Llamada a la Acción (CTA)" },
  { key: "cta_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Llamada a la Acción (CTA)" },
  { key: "cta_testimonial_text", label: "Testimonio", description: "Frase del testimonio", type: "text", group: "Llamada a la Acción (CTA)" },
  { key: "cta_testimonial_author", label: "Autor testimonio", description: "Nombre y negocio del autor", type: "text", group: "Llamada a la Acción (CTA)" },
  { key: "cta_button_primary", label: "Botón principal", description: "Texto del botón verde", type: "text", group: "Llamada a la Acción (CTA)" },
  { key: "cta_button_secondary", label: "Botón secundario", description: "Texto del botón secundario", type: "text", group: "Llamada a la Acción (CTA)" },
];

/* ────────── LICENCIAS ────────── */
const licenciasSections: CMSSectionDef[] = [
  { key: "hero_badge", label: "Badge del hero", description: "Etiqueta del encabezado", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
  { key: "benefits", label: "Beneficios", description: "Lista JSON de beneficios ['item1','item2']", type: "json", group: "Beneficios" },
  { key: "crosssell_subtitle", label: "Venta cruzada", description: "Texto debajo de la lista de licencias", type: "text", group: "Venta Cruzada" },
];

/* ────────── PACKS ────────── */
const packsSections: CMSSectionDef[] = [
  { key: "hero_badge", label: "Badge del hero", description: "Etiqueta del encabezado", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── PLANES ────────── */
const planesSections: CMSSectionDef[] = [
  { key: "hero_badge", label: "Badge del hero", description: "Etiqueta del encabezado", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── MÓDULOS ────────── */
const modulosSections: CMSSectionDef[] = [
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── SERVICIOS ────────── */
const serviciosSections: CMSSectionDef[] = [
  { key: "hero_badge", label: "Badge del hero", description: "Etiqueta del encabezado", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── SOLUCIONES ────────── */
const solucionesSections: CMSSectionDef[] = [
  { key: "hero_badge", label: "Badge del hero", description: "Etiqueta del encabezado", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── SOFTWARE POS COLOMBIA ────────── */
const softwarePosSections: CMSSectionDef[] = [
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── FACTURACIÓN ELECTRÓNICA ────────── */
const facturacionSections: CMSSectionDef[] = [
  { key: "hero_badge", label: "Badge del hero", description: "Etiqueta del encabezado", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── NOSOTROS ────────── */
const nosotrosSections: CMSSectionDef[] = [
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── CONTACTO ────────── */
const contactoSections: CMSSectionDef[] = [
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ────────── COMPARAR ────────── */
const compararSections: CMSSectionDef[] = [
  { key: "hero_badge", label: "Badge del hero", description: "Etiqueta del encabezado", type: "text", group: "Hero" },
  { key: "hero_title", label: "Título principal", description: "H1 de la página", type: "html", group: "Hero" },
  { key: "hero_subtitle", label: "Subtítulo", description: "Párrafo descriptivo", type: "text", group: "Hero" },
];

/* ════════════════════════════════════════════════ */
/* FULL REGISTRY                                    */
/* ════════════════════════════════════════════════ */

export const CMS_PAGES: CMSPageDef[] = [
  { path: "/", label: "Inicio (Home)", category: "Comercial", icon: "Home", sections: homeSections },
  { path: "/licencias", label: "Licencias", category: "Comercial", icon: "KeyRound", sections: licenciasSections },
  { path: "/packs", label: "Packs", category: "Comercial", icon: "Package", sections: packsSections },
  { path: "/planes", label: "Planes y Suscripciones", category: "Comercial", icon: "CreditCard", sections: planesSections },
  { path: "/modulos", label: "Módulos", category: "Comercial", icon: "LayoutGrid", sections: modulosSections },
  { path: "/servicios", label: "Servicios", category: "Comercial", icon: "Wrench", sections: serviciosSections },
  { path: "/soluciones", label: "Soluciones", category: "Comercial", icon: "Lightbulb", sections: solucionesSections },
  { path: "/facturacion-electronica", label: "Facturación Electrónica", category: "Institucional", icon: "FileCheck", sections: facturacionSections },
  { path: "/nosotros", label: "Nosotros", category: "Institucional", icon: "Users", sections: nosotrosSections },
  { path: "/contacto", label: "Contacto", category: "Institucional", icon: "Phone", sections: contactoSections },
  { path: "/comparar", label: "Comparar Software", category: "Marketing", icon: "GitCompare", sections: compararSections },
  { path: "/software-pos-colombia", label: "Software POS Colombia", category: "Marketing", icon: "MapPin", sections: softwarePosSections },
];

/** Get section definition for a given page + key */
export function getSectionDef(pagePath: string, sectionKey: string): CMSSectionDef | undefined {
  const page = CMS_PAGES.find((p) => p.path === pagePath);
  return page?.sections.find((s) => s.key === sectionKey);
}

/** Get all unique groups for a page */
export function getPageGroups(pagePath: string): string[] {
  const page = CMS_PAGES.find((p) => p.path === pagePath);
  if (!page) return [];
  const groups: string[] = [];
  page.sections.forEach((s) => {
    if (!groups.includes(s.group)) groups.push(s.group);
  });
  return groups;
}
