import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Handshake, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const roleConfig = [
  { role: "admin" as const, label: "Panel Admin", href: "/admin", icon: LayoutDashboard },
  { role: "reseller" as const, label: "Portal Socios", href: "/socio", icon: Handshake },
  { role: "customer" as const, label: "Portal Clientes", href: "/clientes", icon: User },
];

export function RoleSwitcherBar() {
  const { roles } = useAuth();
  const location = useLocation();

  // Only show when user has 2+ roles
  if (roles.length < 2) return null;

  const currentPath = location.pathname;
  const availableRoles = roleConfig.filter((r) => roles.includes(r.role));
  const currentRole = availableRoles.find((r) => currentPath.startsWith(r.href));
  const otherRoles = availableRoles.filter((r) => r !== currentRole);

  if (otherRoles.length === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm px-3 py-2 text-sm">
      {currentRole && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <currentRole.icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentRole.label}</span>
        </span>
      )}
      <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
      <span className="text-muted-foreground text-xs hidden sm:inline">Cambiar a:</span>
      {otherRoles.map((r) => (
        <Link
          key={r.role}
          to={r.href}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          <r.icon className="h-3.5 w-3.5" />
          {r.label}
        </Link>
      ))}
    </div>
  );
}
