import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Utensils, ShoppingCart, Shirt, Wrench, Laptop, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const solutions = [
  {
    icon: Utensils,
    title: "Restaurantes, Bares y Cafeterías",
    description: "Gestión de comandas, control de mesas, recetas y costos, división de cuentas, cocina conectada.",
    href: "/pos-para-restaurantes",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: ShoppingCart,
    title: "Mini Market y Supermercados",
    description: "Compra y venta de mercancía, inventario en tiempo real, códigos de barras, auto servicios.",
    href: "/pos-para-retail",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Shirt,
    title: "Tiendas de Moda y Calzado",
    description: "Control de tallas, colores, temporadas. Gestión de stock y transferencias entre tiendas.",
    href: "/pos-para-retail",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: Wrench,
    title: "Ferreterías y Materiales",
    description: "Miles de referencias, unidades de medida, cotizaciones, eléctricos y materiales de construcción.",
    href: "/pos-para-retail",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Laptop,
    title: "Almacenes de Tecnología",
    description: "Control de seriales, garantías, equipos. Computadores, electrodomésticos, celulares.",
    href: "/pos-para-retail",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: Scissors,
    title: "Salones de Belleza y Spa",
    description: "Servicios, agendamiento de citas, productos, comisiones. Centros de estética.",
    href: "/pos-para-retail",
    color: "bg-purple-500/10 text-purple-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function SolutionsSection() {
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
            Soluciones por <span className="gradient-text">Tipo de Negocio</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Software adaptado a las necesidades específicas de tu industria.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
        >
          {solutions.map((solution) => (
            <motion.div key={solution.title} variants={itemVariants}>
              <Link to={solution.href}>
                <Card className="h-full border shadow-soft hover:shadow-card transition-all hover:-translate-y-1 bg-card group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${solution.color} group-hover:scale-110 transition-transform`}>
                      <solution.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {solution.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
