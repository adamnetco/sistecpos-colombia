import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Utensils, ShoppingBag, Shirt, Wrench, Laptop, Scissors, Pill, Store, PawPrint, User, LogIn, LogOut, LayoutDashboard, Handshake, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 import { motion, AnimatePresence } from "framer-motion";
 import { useNavItems } from "@/hooks/useNavItems";

const solutions = [
  { name: "Restaurantes", href: "/soluciones/restaurantes", icon: Utensils, description: "Bares, cafeterías y cocinas" },
  { name: "Mini Market", href: "/soluciones/mini-market", icon: ShoppingBag, description: "Tiendas y supermercados" },
  { name: "Moda y Calzado", href: "/soluciones/moda-calzado", icon: Shirt, description: "Ropa y accesorios" },
  { name: "Ferreterías", href: "/soluciones/ferreterias", icon: Wrench, description: "Materiales y herramientas" },
  { name: "Tecnología", href: "/soluciones/tecnologia", icon: Laptop, description: "Electrónica y móviles" },
  { name: "Salón de Belleza", href: "/soluciones/salon-belleza", icon: Scissors, description: "Salones y spa" },
  { name: "Farmacias", href: "/soluciones/farmacia", icon: Pill, description: "Droguerías y medicamentos" },
  { name: "Veterinarias", href: "/soluciones/veterinarias", icon: PawPrint, description: "Clínicas de mascotas" },
];

// Fallback links used while DB loads or if no data
const fallbackLinks = [
  { label: "Inicio", href: "/" },
  { label: "Soluciones", href: "/soluciones" },
  { label: "Productos", href: "/productos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
  { label: "Software POS Colombia", href: "/software-pos-colombia" },
  { label: "Comparar POS", href: "/comparar" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isReseller, isCustomer, signOut, loading: authLoading } = useAuth();
  const { topItems: mainItems } = useNavItems("main");
  const { topItems: mobileItems } = useNavItems("mobile");

  const desktopLinks = mainItems.length > 0 ? mainItems : fallbackLinks.map((f, i) => ({ ...f, id: `fb-${i}`, position: "main", is_active: true, is_external: false, sort_order: i, parent_id: null }));
  const mobileLinks = mobileItems.length > 0 ? mobileItems : fallbackLinks.map((f, i) => ({ ...f, id: `fb-m-${i}`, position: "mobile", is_active: true, is_external: false, sort_order: i, parent_id: null }));

  const isActive = (path: string) => location.pathname === path;

  const getUserPortalPath = () => {
    if (isAdmin) return "/admin";
    if (isReseller) return "/socio";
    if (isCustomer) return "/clientes";
    return "/clientes";
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };
  return <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img alt="SistecPOS" className="h-9 w-auto" src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" fetchPriority="high" decoding="async" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {desktopLinks.map((link) => {
            // Special handling for "Soluciones" - show dropdown
            if (link.href === "/soluciones") {
              return (
                <div key={link.id} className="relative" onMouseEnter={() => setSolutionsOpen(true)} onMouseLeave={() => setSolutionsOpen(false)}>
                  <Link to="/soluciones" className={cn("flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive("/soluciones") && "text-primary", solutionsOpen && "bg-muted")}>
                    {link.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", solutionsOpen && "rotate-180")} />
                  </Link>
                  <AnimatePresence>
                    {solutionsOpen && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="absolute left-0 top-full pt-2">
                      <div className="grid w-[480px] grid-cols-2 gap-2 rounded-xl border bg-card p-4 shadow-card">
                        {solutions.map(solution => <Link key={solution.name} to={solution.href} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <solution.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{solution.name}</div>
                            <div className="text-xs text-muted-foreground">{solution.description}</div>
                          </div>
                        </Link>)}
                      </div>
                    </motion.div>}
                  </AnimatePresence>
                </div>
              );
            }

            // Regular link or anchor
            if (link.is_external || link.href.startsWith("http")) {
              return (
                <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted">
                  {link.label}
                </a>
              );
            }

            return (
              <Link key={link.id} to={link.href} className={cn("px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive(link.href.split("#")[0]) && "text-primary")}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          {/* Smart user menu */}
          <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
            <Button
              variant="ghost"
              size="icon"
              title={user ? "Mi Panel" : "Iniciar Sesión"}
              className={cn(user && "text-primary")}
              onClick={() => !user && navigate("/auth")}
            >
              {user ? <UserCircle className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </Button>
            <AnimatePresence>
              {userMenuOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full pt-1 z-50"
                >
                  <div className="w-48 rounded-xl border bg-card p-1.5 shadow-lg space-y-0.5">
                    <p className="px-3 py-1.5 text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="border-t border-border my-1" />
                    <Link
                      to={getUserPortalPath()}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {isAdmin ? <LayoutDashboard className="h-4 w-4 text-primary" /> : isReseller ? <Handshake className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                      {isAdmin ? "Panel Admin" : isReseller ? "Portal Socios" : "Mi Portal"}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button asChild size="sm" className="bg-cta hover:bg-cta/90 text-cta-foreground font-semibold">
            <Link to="/lp/demo">
              Prueba Gratis 30 Días
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2 rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t bg-background">
            <div className="container px-4 py-4 space-y-4">
              {mobileLinks.map((link) => {
                // Special handling for "Soluciones"
                if (link.href === "/soluciones") {
                  return (
                    <div key={link.id} className="space-y-2">
                      <Link to="/soluciones" className="block text-xs font-semibold text-primary uppercase tracking-wider hover:underline" onClick={() => setMobileMenuOpen(false)}>
                        Soluciones
                      </Link>
                      <div className="grid grid-cols-2 gap-2">
                        {solutions.map(solution => <Link key={solution.name} to={solution.href} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                          <solution.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm">{solution.name}</span>
                        </Link>)}
                      </div>
                    </div>
                  );
                }

                if (link.is_external || link.href.startsWith("http")) {
                  return (
                    <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link key={link.id} to={link.href} className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link to={getUserPortalPath()} onClick={() => setMobileMenuOpen(false)}>
                      {isAdmin ? <LayoutDashboard className="h-4 w-4" /> : isReseller ? <Handshake className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      {isAdmin ? "Panel Admin" : isReseller ? "Portal Socios" : "Mi Portal"}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full gap-2 text-destructive" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Link>
                </Button>
              )}
              <Button asChild className="w-full bg-cta hover:bg-cta/90 text-cta-foreground font-semibold">
                <Link to="/lp/demo" onClick={() => setMobileMenuOpen(false)}>
                  Prueba Gratis 30 Días
                </Link>
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
}