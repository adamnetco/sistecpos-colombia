export interface LicensePlan {
  value: string;
  label: string;
  description: string;
  isAnnual: boolean;
  defaultPriceCOP: number;
  durationMonths?: number; // null = lifetime
}

export const LICENSE_PLANS: LicensePlan[] = [
  {
    value: "basico",
    label: "Básico",
    description: "1 punto de venta, funciones esenciales",
    isAnnual: true,
    defaultPriceCOP: 549000,
    durationMonths: 12,
  },
  {
    value: "intermedio",
    label: "Intermedio",
    description: "Inventario detallado y reportes avanzados",
    isAnnual: true,
    defaultPriceCOP: 999000,
    durationMonths: 12,
  },
  {
    value: "premium",
    label: "Premium",
    description: "Funcionalidades completas, 1 sede",
    isAnnual: true,
    defaultPriceCOP: 1479000,
    durationMonths: 12,
  },
  {
    value: "premium_contabilidad",
    label: "Premium + Contabilidad",
    description: "Premium con módulo contable integrado",
    isAnnual: true,
    defaultPriceCOP: 1799000,
    durationMonths: 12,
  },
  {
    value: "premium_multi_2",
    label: "Premium Multitienda 2",
    description: "Premium para 2 sucursales",
    isAnnual: true,
    defaultPriceCOP: 2199000,
    durationMonths: 12,
  },
  {
    value: "premium_multi_3",
    label: "Premium Multitienda 3",
    description: "Premium para 3 sucursales",
    isAnnual: true,
    defaultPriceCOP: 2799000,
    durationMonths: 12,
  },
  {
    value: "premium_2anios",
    label: "Premium 2 Años",
    description: "Premium con descuento por 2 años",
    isAnnual: true,
    defaultPriceCOP: 2499000,
    durationMonths: 24,
  },
  {
    value: "vitalicio",
    label: "Vitalicio",
    description: "Licencia de por vida (mantenimiento anual aparte)",
    isAnnual: false,
    defaultPriceCOP: 2999000,
  },
];

/** Display-friendly label for a plan_type value */
export function planLabel(planType: string): string {
  const plan = LICENSE_PLANS.find((p) => p.value === planType);
  if (plan) return plan.label;
  // Legacy fallbacks
  if (planType === "anual") return "Anual (legado)";
  if (planType === "mensual") return "Mensual (legado)";
  if (planType === "emprendedor") return "Emprendedor (legado)";
  if (planType === "negocio") return "Negocio (legado)";
  if (planType === "empresarial") return "Empresarial (legado)";
  return planType;
}

/** Whether a plan expires (annually or by duration) */
export function planIsAnnual(planType: string): boolean {
  const plan = LICENSE_PLANS.find((p) => p.value === planType);
  if (plan) return plan.isAnnual;
  return planType === "anual" || planType === "mensual";
}

/** Get expiration date for a plan from a given start */
export function planExpirationDate(planType: string, startDate: Date = new Date()): string | null {
  const plan = LICENSE_PLANS.find((p) => p.value === planType);
  if (!plan || !plan.isAnnual) return null;
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + (plan.durationMonths || 12));
  return d.toISOString().split("T")[0];
}
