export const CLUSTER_OPTIONS = [
  { value: "facturador_gratuito", label: "📦 Facturador Gratuito" },
  { value: "habilitacion_normativa", label: "📋 Habilitación y Normativa" },
  { value: "firma_digital", label: "🔐 Firma Digital y Certificados" },
  { value: "comercial", label: "🏪 Guías Comerciales" },
  { value: "otros", label: "📄 Otros / Sin cluster" },
] as const;

export const CLUSTER_LABELS: Record<string, string> = {
  facturador_gratuito: "Facturador Gratuito",
  habilitacion_normativa: "Habilitación y Normativa",
  firma_digital: "Firma Digital",
  comercial: "Comercial",
  otros: "Otros",
};

export const CLUSTER_HUB_CONFIG: Record<string, { title: string; highlight: string; subtitle: string }> = {
  facturador_gratuito: {
    title: "Guías sobre el",
    highlight: "Facturador Gratuito DIAN",
    subtitle: "¿Usas la solución gratuita de la DIAN? Descubre sus limitaciones y las alternativas.",
  },
  habilitacion_normativa: {
    title: "Habilitación y",
    highlight: "Normativa DIAN",
    subtitle: "Sanciones, calendarios, límites de UVT y todo lo que necesitas para cumplir con la DIAN.",
  },
  firma_digital: {
    title: "Firma Digital y",
    highlight: "Certificados",
    subtitle: "Todo sobre certificados digitales, firma electrónica y cómo obtenerlos sin costo adicional.",
  },
  comercial: {
    title: "Guías",
    highlight: "Comerciales",
    subtitle: "Facturación para PYMES, inventario integrado y rankings de software POS en Colombia.",
  },
};
