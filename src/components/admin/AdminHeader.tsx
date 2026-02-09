import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

const routeNames: Record<string, string> = {
  "/admin": "Resumen",
  "/admin/licencias": "Licencias",
  "/admin/leads": "Leads / Demos",
  "/admin/certificados": "Certificados",
  "/admin/pagos": "Pagos",
  "/admin/socios": "Socios",
  "/admin/contactos": "CRM — Contactos",
  "/admin/proveedores": "Proveedores",
  "/admin/central-ia": "Central IA",
  "/admin/tracking": "Tracking",
};

interface AdminHeaderProps {
  alerts?: number;
}

export function AdminHeader({ alerts = 0 }: AdminHeaderProps) {
  const location = useLocation();
  const breadcrumbs = [
    { label: "Admin", path: "/admin" },
  ];

  const currentRoute = routeNames[location.pathname];
  if (currentRoute && location.pathname !== "/admin") {
    breadcrumbs.push({ label: currentRoute, path: location.pathname });
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            <span className={i === breadcrumbs.length - 1 ? "font-medium text-foreground" : ""}>
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {alerts > 0 && (
        <div className="flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-destructive" />
          <Badge variant="destructive" className="text-xs">{alerts}</Badge>
        </div>
      )}
    </div>
  );
}
