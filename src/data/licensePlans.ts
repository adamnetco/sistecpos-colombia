export interface LicensePlan {
  value: string;
  label: string;
  description: string;
  isAnnual: boolean;
  defaultPriceCOP: number;
}

export const LICENSE_PLANS: LicensePlan[] = [
  {
    value: "emprendedor",
    label: "Plan Emprendedor",
    description: "Ideal para pequeños negocios (1 punto de venta)",
    isAnnual: true,
    defaultPriceCOP: 549000,
  },
  {
    value: "negocio",
    label: "Plan Negocio",
    description: "Para empresas con procesos de inventario más detallados",
    isAnnual: true,
    defaultPriceCOP: 999000,
  },
  {
    value: "empresarial",
    label: "Plan Empresarial",
    description: "Para negocios con múltiples sedes o bodegas",
    isAnnual: true,
    defaultPriceCOP: 1479000,
  },
];

/** Display-friendly label for a plan_type value */
export function planLabel(planType: string): string {
  const plan = LICENSE_PLANS.find((p) => p.value === planType);
  if (plan) return plan.label;
  // Fallback for legacy values
  if (planType === "anual") return "Anual (legado)";
  if (planType === "vitalicio") return "Vitalicio (legado)";
  return planType;
}

/** Whether a plan expires annually */
export function planIsAnnual(planType: string): boolean {
  const plan = LICENSE_PLANS.find((p) => p.value === planType);
  if (plan) return plan.isAnnual;
  return planType === "anual";
}
