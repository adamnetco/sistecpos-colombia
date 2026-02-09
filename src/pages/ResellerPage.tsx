import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReseller } from "@/hooks/useReseller";
import { ResellerLayout } from "@/components/reseller/ResellerLayout";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ShieldX, Clock, MessageCircle, ArrowLeft, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const ResellerDashboard = lazy(() => import("@/components/reseller/ResellerDashboard"));
const ResellerLicensesView = lazy(() => import("@/components/reseller/ResellerLicensesView"));
const ResellerTrainingsView = lazy(() => import("@/components/reseller/ResellerTrainingsView"));
const ResellerTicketsView = lazy(() => import("@/components/reseller/ResellerTicketsView"));
const ResellerCommissionsView = lazy(() => import("@/components/reseller/ResellerCommissionsView"));

function Loader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function RestrictedPage({ variant }: { variant: "no-access" | "pending" }) {
  const isNoAccess = variant === "no-access";

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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
              >
                {isNoAccess ? (
                  <ShieldX className="h-12 w-12 text-primary" />
                ) : (
                  <Clock className="h-12 w-12 text-yellow-500" />
                )}
              </motion.div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {isNoAccess ? "Acceso Restringido" : "Solicitud en Revisión"}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              {isNoAccess
                ? "No tienes permisos de socio distribuidor. Si crees que es un error, contacta al equipo de soporte."
                : "Tu solicitud de socio está pendiente de aprobación. Te notificaremos cuando sea procesada."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  Ir al Inicio
                </Link>
              </Button>
              {isNoAccess && (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/representantes" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Ser Socio
                  </Link>
                </Button>
              )}
              <Button size="lg" className="btn-whatsapp gap-2" asChild>
                <a
                  href="https://wa.me/573176268307?text=Hola,%20necesito%20ayuda%20con%20mi%20acceso%20al%20portal%20de%20socios"
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
}

function ResellerGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isReseller, loading: resellerLoading, reseller } = useReseller();

  if (authLoading || resellerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!isReseller || !reseller) return <RestrictedPage variant="no-access" />;

  if (reseller.status !== "approved") return <RestrictedPage variant="pending" />;

  return <>{children}</>;
}

export default function ResellerPage() {
  return (
    <ResellerGuard>
      <ResellerLayout>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route index element={<ResellerDashboard />} />
            <Route path="licencias" element={<ResellerLicensesView />} />
            <Route path="entrenamientos" element={<ResellerTrainingsView />} />
            <Route path="tickets" element={<ResellerTicketsView />} />
            <Route path="comisiones" element={<ResellerCommissionsView />} />
          </Routes>
        </Suspense>
      </ResellerLayout>
    </ResellerGuard>
  );
}
