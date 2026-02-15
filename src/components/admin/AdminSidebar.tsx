import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, KeyRound, Users, FileCheck, CreditCard,
  Handshake, LogOut, ChevronLeft, Contact2, Bot, Code2,
  Package, Menu, ShoppingBag, Tag, FolderOpen, BarChart3, Settings2,
  FileText, ChevronDown, RefreshCw, Download, TicketCheck, GraduationCap, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavGroup {
  label: string;
  items: { name: string; href: string; icon: typeof LayoutDashboard; exact?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      { name: "Resumen", href: "/admin", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { name: "Productos", href: "/admin/productos", icon: ShoppingBag },
      { name: "Marcas", href: "/admin/marcas", icon: Tag },
      { name: "Categorías", href: "/admin/categorias", icon: FolderOpen },
    ],
  },
  {
    label: "Ventas",
    items: [
      { name: "Licencias", href: "/admin/licencias", icon: KeyRound },
      { name: "Precios Licencias", href: "/admin/precios-licencias", icon: Tag },
      { name: "Certificados", href: "/admin/certificados", icon: FileCheck },
      { name: "Pagos", href: "/admin/pagos", icon: CreditCard },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Contactos", href: "/admin/contactos", icon: Contact2 },
      { name: "Socios", href: "/admin/socios", icon: Handshake },
      { name: "Proveedores", href: "/admin/proveedores", icon: Package },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Analytics Tienda", href: "/admin/analytics", icon: BarChart3 },
      { name: "Central IA", href: "/admin/central-ia", icon: Bot },
      { name: "Tracking", href: "/admin/tracking", icon: Code2 },
      { name: "Artículos DIAN", href: "/admin/articulos-dian", icon: FileText },
    ],
  },
  {
    label: "Soporte",
    items: [
      { name: "Tickets", href: "/admin/tickets-clientes", icon: TicketCheck },
      { name: "Descargas", href: "/admin/descargas-clientes", icon: Download },
      { name: "Capacitación", href: "/admin/capacitacion", icon: GraduationCap },
    ],
  },
  {
    label: "Integraciones",
    items: [
      { name: "Sincronizar POS", href: "/admin/sync-pos", icon: RefreshCw },
    ],
  },
  {
    label: "Sistema",
    items: [
      { name: "Roles", href: "/admin/roles", icon: ShieldCheck },
      { name: "Configuración", href: "/admin/configuracion", icon: Settings2 },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const groupHasActive = (group: NavGroup) =>
    group.items.some((item) => isActive(item.href, item.exact));

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <img
          src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
          alt="SistecPOS"
          className="h-7"
        />
        <span className="text-sm font-bold">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto">
        {navGroups.map((group) => {
          const hasLabel = group.label.length > 0;
          const isCollapsed = hasLabel && collapsed[group.label] && !groupHasActive(group);

          return (
            <div key={group.label || "root"} className={hasLabel ? "pt-3" : ""}>
              {hasLabel && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </button>
              )}
              {!isCollapsed &&
                group.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      isActive(item.href, item.exact)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
            </div>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-2">
        <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild className="flex-1">
            <Link to="/">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sitio
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-3 left-3 z-50 md:hidden bg-card shadow-md border">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0 flex flex-col">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="sticky top-0 hidden md:flex h-screen w-60 flex-col border-r bg-card">
      <SidebarContent />
    </aside>
  );
}

export function MobileMenuTrigger() {
  return null;
}
