import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  KeyRound,
  Users,
  FileCheck,
  CreditCard,
  Handshake,
  LogOut,
  ChevronLeft,
  Contact2,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Resumen", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Licencias", href: "/admin/licencias", icon: KeyRound },
  { name: "Leads / Demos", href: "/admin/leads", icon: Users },
  { name: "Certificados", href: "/admin/certificados", icon: FileCheck },
  { name: "Pagos", href: "/admin/pagos", icon: CreditCard },
  { name: "Socios", href: "/admin/socios", icon: Handshake },
  { name: "CRM", href: "/admin/contactos", icon: Contact2 },
  { name: "Central IA", href: "/admin/central-ia", icon: Bot },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <img
            src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
            alt="SistecPOS"
            className="h-7"
          />
          <span className="text-sm font-bold">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-muted/30 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
