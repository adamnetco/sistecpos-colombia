import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, KeyRound, Users, FileCheck, CreditCard,
  Handshake, LogOut, ChevronLeft, Contact2, Bot, Code2,
  Package, Menu, X, ShoppingBag, Tag, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { name: "Resumen", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Productos", href: "/admin/productos", icon: ShoppingBag },
  { name: "Marcas", href: "/admin/marcas", icon: Tag },
  { name: "Categorías", href: "/admin/categorias", icon: FolderOpen },
  { name: "Licencias", href: "/admin/licencias", icon: KeyRound },
  { name: "Leads / Demos", href: "/admin/leads", icon: Users },
  { name: "Certificados", href: "/admin/certificados", icon: FileCheck },
  { name: "Pagos", href: "/admin/pagos", icon: CreditCard },
  { name: "Socios", href: "/admin/socios", icon: Handshake },
  { name: "CRM", href: "/admin/contactos", icon: Contact2 },
  { name: "Proveedores", href: "/admin/proveedores", icon: Package },
  { name: "Central IA", href: "/admin/central-ia", icon: Bot },
  { name: "Tracking", href: "/admin/tracking", icon: Code2 },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

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

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
              isActive(item.href, item.exact)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
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
          <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50 md:hidden">
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
  return null; // handled by AdminSidebar Sheet
}
