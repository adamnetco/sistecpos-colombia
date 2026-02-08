import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search, MessageCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="py-20 md:py-32">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="relative mb-8">
              <span className="text-[8rem] md:text-[12rem] font-black leading-none gradient-text select-none">
                404
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Página no encontrada
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              La página <code className="text-sm bg-muted px-2 py-1 rounded">{location.pathname}</code> no existe o fue movida.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  Ir al Inicio
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/productos" className="gap-2">
                  <Search className="h-4 w-4" />
                  Ver Productos
                </Link>
              </Button>
              <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2" asChild>
                <a
                  href="https://wa.me/573176268307?text=Hola,%20necesito%20ayuda%20con%20el%20sitio%20web"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Escríbenos
                </a>
              </Button>
            </div>

            <div className="mt-12">
              <button
                onClick={() => window.history.back()}
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Volver a la página anterior
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
