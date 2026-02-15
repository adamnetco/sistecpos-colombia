import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RoleSwitcherBar } from "@/components/shared/RoleSwitcherBar";
import { useAuth } from "@/hooks/useAuth";
import { useReseller } from "@/hooks/useReseller";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, KeyRound, GraduationCap, TicketCheck,
  DollarSign, LogOut, ChevronLeft, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

const allNavItems = [
  { name: "Inicio", href: "/socio", icon: LayoutDashboard, exact: true, moduleKey: null },
  { name: "Licencias", href: "/socio/licencias", icon: KeyRound, moduleKey: "licencias" },
  { name: "Entrenamientos", href: "/socio/entrenamientos", icon: GraduationCap, moduleKey: "entrenamientos" },
  { name: "Tickets", href: "/socio/tickets", icon: TicketCheck, moduleKey: "tickets" },
  { name: "Comisiones", href: "/socio/comisiones", icon: DollarSign, moduleKey: "comisiones" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, user } = useAuth();
  const { hasModule, reseller } = useReseller();
  const location = useLocation();

  const navItems = allNavItems.filter(
    (item) => item.moduleKey === null || hasModule(item.moduleKey)
  );

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <img src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" alt="SistecPOS" className="h-7" />
        <span className="text-sm font-bold">Socio</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
              isActive(item.href, item.exact) ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t p-4 space-y-2">
        <div className="truncate text-xs font-medium">{reseller?.full_name}</div>
        <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild className="flex-1">
            <Link to="/"><ChevronLeft className="mr-1 h-4 w-4" />Sitio</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

export function ResellerLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile sidebar - simple overlay instead of Sheet for faster rendering */}
      {isMobile && (
        <>
          {/* Trigger button - always visible */}
          <Button
            variant="outline"
            size="icon"
            className="fixed top-3 left-3 z-50 md:hidden bg-card shadow-md"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Backdrop + Drawer */}
          {open && (
            <>
              <div
                className="fixed inset-0 z-50 bg-black/40 animate-in fade-in-0 duration-200"
                onClick={() => setOpen(false)}
              />
              <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-xl animate-in slide-in-from-left duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <SidebarContent onNavigate={() => setOpen(false)} />
              </aside>
            </>
          )}
        </>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="sticky top-0 hidden md:flex h-screen w-60 flex-col border-r bg-card">
          <SidebarContent />
        </aside>
      )}

      <main className="flex-1 bg-muted/30 p-4 pt-14 md:p-6 md:pt-8">
        <RoleSwitcherBar />
        {children}
      </main>

      {/* Floating buttons for reseller panel */}
      <WhatsAppButton />
    </div>
  );
}
