import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { RoleSwitcherBar } from "@/components/shared/RoleSwitcherBar";
import { ClientPOSLogin } from "@/components/clientes/ClientPOSLogin";
import { ClientPortal } from "@/components/clientes/ClientPortal";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldX, LogIn, Home, MessageCircle, ArrowLeft } from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

function ClientRestricted() {
  const { user, signOut } = useAuth();
  const { buildUrl } = useWhatsAppConfig();

  return (
    <Layout>
      <section className="py-16 md:py-28">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10"
            >
              <ShieldX className="h-10 w-10 text-destructive" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
            <p className="text-muted-foreground mb-2">
              No tienes permisos de cliente para acceder a este portal.
            </p>
            {user && (
              <p className="text-sm text-muted-foreground/70 mb-8">
                Sesión activa: <span className="font-medium text-foreground/80">{user.email}</span>
              </p>
            )}

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full gradient-bg text-primary-foreground">
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar con otra cuenta
                </Link>
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ir al Inicio
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href={buildUrl("Hola, necesito ayuda con mi acceso al portal de clientes")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Soporte
                  </a>
                </Button>
              </div>

              {user && (
                <button
                  onClick={signOut}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors mt-2"
                >
                  Cerrar sesión actual
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

export default function ClientesPage() {
  const { user, loading, isAdmin, isCustomer, isReseller } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  // Not logged in — show POS login + support options
  if (!user) {
    return (
      <Layout>
        <SEO
          title="Acceso Clientes | SistecPOS"
          description="Ingresa a tu sistema POS SistecPOS. Accede a soporte, descargas y entrenamientos."
        />
        <ClientPOSLogin />
      </Layout>
    );
  }

  // Admins, customers and resellers can access the portal
  if (isAdmin || isCustomer || isReseller) {
    return (
      <Layout>
        <SEO
          title="Portal de Clientes | SistecPOS"
          description="Accede a soporte, descargas y entrenamientos de SistecPOS."
        />
        <div className="container px-4 pt-4">
          <RoleSwitcherBar />
        </div>
        <ClientPortal />
      </Layout>
    );
  }

  // Authenticated but no customer/admin role
  return <ClientRestricted />;
}
