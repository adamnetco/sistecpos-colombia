import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Utensils, ShoppingCart, Shirt, Wrench, Laptop, Scissors, 
  Store, Building2, Stethoscope, PawPrint, Globe, Banknote,
  Settings, BookOpen, Briefcase, Warehouse, Package, Pill,
  CakeSlice, Apple, Beef, Coffee
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    icon: Utensils,
    title: "Restaurantes",
    description: "Restaurantes, bares, cantinas y comidas rápidas.",
    href: "/pos-para-restaurantes",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: ShoppingCart,
    title: "Mini Market",
    description: "Tiendas, supermercados y autoservicios.",
    href: "/pos-para-retail",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Store,
    title: "Almacén",
    description: "Compra y venta de mercancías en general.",
    href: "/pos-para-retail",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    icon: Shirt,
    title: "Moda y Calzado",
    description: "Tiendas de moda, ropa, calzado y accesorios.",
    href: "/pos-para-retail",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: Wrench,
    title: "Ferreterías",
    description: "Ferreterías, eléctricos y materiales de construcción.",
    href: "/pos-para-retail",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: BookOpen,
    title: "Papelerías",
    description: "Papelerías, librerías y misceláneas.",
    href: "/pos-para-retail",
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    icon: Laptop,
    title: "Tecnología",
    description: "Computadoras, móviles y electrodomésticos.",
    href: "/pos-para-retail",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: Scissors,
    title: "Salón de Belleza",
    description: "Salones de belleza, spas y centros de estética.",
    href: "/pos-para-retail",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Globe,
    title: "Tienda Online",
    description: "Tiendas en línea con inventario centralizado.",
    href: "/pos-para-retail",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Banknote,
    title: "Casas de Cambio",
    description: "Compra y venta de divisas y giros internacionales.",
    href: "/pos-para-retail",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Settings,
    title: "Servicio Técnico",
    description: "Reparación de tecnología, automotriz y herramientas.",
    href: "/pos-para-retail",
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    icon: Building2,
    title: "Multi-tienda",
    description: "Varias tiendas bajo una sola administración.",
    href: "/pos-para-retail",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    icon: Stethoscope,
    title: "Consultorios",
    description: "Atención médica, odontológica y especializada.",
    href: "/pos-para-retail",
    color: "bg-red-500/10 text-red-600",
  },
  {
    icon: PawPrint,
    title: "Veterinarias",
    description: "Veterinarias y clínicas de animales.",
    href: "/pos-para-retail",
    color: "bg-lime-500/10 text-lime-600",
  },
  {
    icon: Warehouse,
    title: "Almacenes Multi-moneda",
    description: "Negocios que operan con diferentes monedas.",
    href: "/pos-para-retail",
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    icon: Pill,
    title: "Droguerías",
    description: "Farmacias, droguerías y productos de salud.",
    href: "/pos-para-retail",
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    icon: CakeSlice,
    title: "Panaderías",
    description: "Panaderías, pastelerías y repostería.",
    href: "/pos-para-retail",
    color: "bg-orange-400/10 text-orange-500",
  },
  {
    icon: Apple,
    title: "Fruver",
    description: "Fruterías, verdulerías y productos frescos.",
    href: "/pos-para-retail",
    color: "bg-green-400/10 text-green-500",
  },
  {
    icon: Beef,
    title: "Carnicerías",
    description: "Carnicerías con integración de básculas.",
    href: "/pos-para-retail",
    color: "bg-red-400/10 text-red-500",
  },
  {
    icon: Coffee,
    title: "Cafeterías",
    description: "Cafeterías, juguerías y bebidas.",
    href: "/pos-para-restaurantes",
    color: "bg-amber-400/10 text-amber-500",
  },
  {
    icon: Package,
    title: "Distribuidoras",
    description: "Distribuidoras mayoristas y logística.",
    href: "/pos-para-retail",
    color: "bg-blue-400/10 text-blue-500",
  },
  {
    icon: Briefcase,
    title: "Gastrobar",
    description: "Gastrobares y coctelería especializada.",
    href: "/pos-para-restaurantes",
    color: "bg-purple-400/10 text-purple-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function SolutionsSection() {
  const [showAll, setShowAll] = useState(false);
  const displayedSolutions = showAll ? solutions : solutions.slice(0, 12);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Soluciones para <span className="gradient-text">+20 Tipos de Negocio</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Software adaptado a las necesidades específicas de tu industria con módulos especializados.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto"
        >
          {displayedSolutions.map((solution) => (
            <motion.div key={solution.title} variants={itemVariants}>
              <Link to={solution.href}>
                <Card className="h-full border shadow-soft hover:shadow-card transition-all hover:-translate-y-1 bg-card group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${solution.color} group-hover:scale-110 transition-transform`}>
                        <solution.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                          {solution.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {solution.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {solutions.length > 12 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? "Ver menos" : `Ver los ${solutions.length} tipos de negocio`}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
