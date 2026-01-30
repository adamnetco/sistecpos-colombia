import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Utensils, ShoppingBag, Shirt, Wrench, Laptop, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import logoSistecPOS from "@/assets/logo-sistecpos.png";

const solutions = [
  { name: "Restaurantes", href: "/pos-para-restaurantes", icon: Utensils, description: "Bares, cafeterías y cocinas" },
  { name: "Retail", href: "/pos-para-retail", icon: ShoppingBag, description: "Tiendas y supermercados" },
  { name: "Moda", href: "/pos-para-retail", icon: Shirt, description: "Ropa y calzado" },
  { name: "Ferreterías", href: "/pos-para-retail", icon: Wrench, description: "Materiales y herramientas" },
  { name: "Tecnología", href: "/pos-para-retail", icon: Laptop, description: "Almacenes y electrónica" },
  { name: "Belleza", href: "/pos-para-retail", icon: Scissors, description: "Salones y spa" },
];

const navLinks = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/productos" },
  { name: "Contacto", href: "#contacto" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logoSistecPOS} alt="SistecPOS" className="h-9 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          <Link
            to="/"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted",
              isActive("/") && "text-primary"
            )}
          >
            Inicio
          </Link>

          {/* Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button
              className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted",
                solutionsOpen && "bg-muted"
              )}
            >
              Soluciones
              <ChevronDown className={cn("h-4 w-4 transition-transform", solutionsOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {solutionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full pt-2"
                >
                  <div className="grid w-[480px] grid-cols-2 gap-2 rounded-xl border bg-card p-4 shadow-card">
                    {solutions.map((solution) => (
                      <Link
                        key={solution.name}
                        to={solution.href}
                        className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <solution.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{solution.name}</div>
                          <div className="text-xs text-muted-foreground">{solution.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/productos"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted",
              isActive("/productos") && "text-primary"
            )}
          >
            Productos
          </Link>

          <a
            href="#contacto"
            className="px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted"
          >
            Contacto
          </a>
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button asChild className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground">
            <a href="https://wa.me/573176268307?text=Hola,%20quiero%20información%20sobre%20SistecPOS" target="_blank" rel="noopener noreferrer">
              Agenda tu Instalación
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Soluciones
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {solutions.map((solution) => (
                    <Link
                      key={solution.name}
                      to={solution.href}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <solution.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{solution.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/productos"
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>

              <a
                href="#contacto"
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </a>

              <Button asChild className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground">
                <a href="https://wa.me/573176268307?text=Hola,%20quiero%20información%20sobre%20SistecPOS" target="_blank" rel="noopener noreferrer">
                  Agenda tu Instalación
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
