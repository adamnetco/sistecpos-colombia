import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Settings, ChevronDown, Shield, Package, Headphones, Wrench, X } from "lucide-react";

/**
 * Admin-only floating helper rendered on /planes.
 * Lets the franchise owner jump straight to the right editor
 * for each "post type" (License, Pack, Support Plan, Service).
 */
export function PlanesAdminEditBar() {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isAdmin || dismissed) return null;

  const items = [
    {
      label: "Licencias (Emprendedor / Negocio / Empresarial)",
      desc: "Precios, etiquetas, descripciones, cajas, usuarios.",
      to: "/admin/precios-licencias",
      icon: Shield,
      color: "text-blue-600",
    },
    {
      label: "Packs Todo Incluido",
      desc: "Combos anuales: licencia + implementación + soporte.",
      to: "/admin/packs",
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Planes de Soporte mensual",
      desc: "Suscripciones mensuales de acompañamiento.",
      to: "/admin/suscripciones",
      icon: Headphones,
      color: "text-emerald-600",
    },
    {
      label: "Servicios sueltos",
      desc: "Implementaciones, capacitaciones, redes (catálogo).",
      to: "/admin/catalogo",
      icon: Wrench,
      color: "text-orange-600",
    },
    {
      label: "Textos del Hero / bloques CMS de /planes",
      desc: "Títulos, subtítulos y copies editables sin código.",
      to: "/admin/paginas?path=/planes",
      icon: Settings,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm no-print">
      <div className="rounded-2xl border border-primary/30 bg-card shadow-2xl overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/15 transition"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Settings className="h-4 w-4" /> Editar esta página (Admin)
          </span>
          <div className="flex items-center gap-1">
            <ChevronDown className={`h-4 w-4 text-primary transition ${open ? "rotate-180" : ""}`} />
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
              className="hover:bg-primary/20 rounded p-0.5"
              title="Ocultar en esta sesión"
            >
              <X className="h-3.5 w-3.5 text-primary" />
            </span>
          </div>
        </button>
        {open && (
          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
            <p className="text-[11px] text-muted-foreground px-2 py-1">
              Cada tarjeta de la página /planes se edita en un panel distinto:
            </p>
            {items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-muted transition group"
              >
                <it.icon className={`h-4 w-4 mt-0.5 shrink-0 ${it.color}`} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-tight group-hover:text-primary">{it.label}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{it.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
