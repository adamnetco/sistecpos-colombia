 import { useState } from "react";
 import { Link, useLocation } from "react-router-dom";
 import { Menu, X, ChevronDown, Utensils, ShoppingBag, Shirt, Wrench, Laptop, Scissors, Pill, Store, PawPrint } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 import { motion, AnimatePresence } from "framer-motion";
 import logoSistecPOS from "@/assets/logo-sistecpos.png";
 
 const solutions = [
   {
     name: "Restaurantes",
     href: "/soluciones/restaurantes",
     icon: Utensils,
     description: "Bares, cafeterías y cocinas"
   },
   {
     name: "Mini Market",
     href: "/soluciones/mini-market",
     icon: ShoppingBag,
     description: "Tiendas y supermercados"
   },
   {
     name: "Moda y Calzado",
     href: "/soluciones/moda-calzado",
     icon: Shirt,
     description: "Ropa y accesorios"
   },
   {
     name: "Ferreterías",
     href: "/soluciones/ferreterias",
     icon: Wrench,
     description: "Materiales y herramientas"
   },
   {
     name: "Tecnología",
     href: "/soluciones/tecnologia",
     icon: Laptop,
     description: "Electrónica y móviles"
   },
   {
     name: "Salón de Belleza",
     href: "/soluciones/salon-belleza",
     icon: Scissors,
     description: "Salones y spa"
   },
    {
      name: "Farmacias",
      href: "/soluciones/farmacias",
      icon: Pill,
      description: "Droguerías y medicamentos"
   },
   {
     name: "Veterinarias",
     href: "/soluciones/veterinarias",
     icon: PawPrint,
     description: "Clínicas de mascotas"
   }
 ];
const navLinks = [{
  name: "Inicio",
  href: "/"
}, {
  name: "Software POS Colombia",
  href: "/software-pos-colombia"
}, {
  name: "Productos",
  href: "/productos"
}, {
  name: "Nosotros",
  href: "/nosotros"
}, {
  name: "Contacto",
  href: "#contacto"
}];
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img alt="SistecPOS" className="h-9 w-auto" src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          <Link to="/" className={cn("px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive("/") && "text-primary")}>
            Inicio
          </Link>

          {/* Solutions Dropdown */}
          <div className="relative" onMouseEnter={() => setSolutionsOpen(true)} onMouseLeave={() => setSolutionsOpen(false)}>
            <Link to="/soluciones" className={cn("flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive("/soluciones") && "text-primary", solutionsOpen && "bg-muted")}>
              Soluciones
              <ChevronDown className={cn("h-4 w-4 transition-transform", solutionsOpen && "rotate-180")} />
            </Link>

            <AnimatePresence>
              {solutionsOpen && <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: 10
            }} transition={{
              duration: 0.2
            }} className="absolute left-0 top-full pt-2">
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

          <Link to="/productos" className={cn("px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive("/productos") && "text-primary")}>
            Productos
          </Link>

          <Link to="/nosotros" className={cn("px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive("/nosotros") && "text-primary")}>
            Nosotros
          </Link>

          <Link to="/contacto" className={cn("px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive("/contacto") && "text-primary")}>
            Contacto
          </Link>

          <Link to="/software-pos-colombia" className={cn("px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", isActive("/software-pos-colombia") && "text-primary")}>
            Software POS Colombia
          </Link>

          <Link to="/comparar" className={cn("px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted", (isActive("/comparar") || location.pathname.startsWith("/comparar/")) && "text-primary")}>
            Comparar POS
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <Button asChild size="sm" className="bg-cta hover:bg-cta/90 text-cta-foreground font-semibold">
            <Link to="/contacto#demo">
              Prueba Gratis 7 Días
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
        {mobileMenuOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: "auto"
      }} exit={{
        opacity: 0,
        height: 0
      }} className="lg:hidden border-t bg-background">
            <div className="container px-4 py-4 space-y-4">
              <Link to="/" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>

              <div className="space-y-2">
                <Link 
                  to="/soluciones" 
                  className="block text-xs font-semibold text-primary uppercase tracking-wider hover:underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Soluciones
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  {solutions.map(solution => <Link key={solution.name} to={solution.href} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                      <solution.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{solution.name}</span>
                    </Link>)}
                </div>
              </div>

              <Link to="/productos" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Productos
              </Link>

              <Link to="/nosotros" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Nosotros
              </Link>

              <Link to="/contacto" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Contacto
              </Link>

              <Link to="/software-pos-colombia" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Software POS Colombia
              </Link>

              <Link to="/comparar" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Comparar POS
              </Link>

              <Button asChild className="w-full bg-cta hover:bg-cta/90 text-cta-foreground font-semibold">
                <Link to="/contacto#demo" onClick={() => setMobileMenuOpen(false)}>
                  Prueba Gratis 7 Días
                </Link>
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
}