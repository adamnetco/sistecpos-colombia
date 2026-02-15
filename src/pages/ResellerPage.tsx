import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReseller } from "@/hooks/useReseller";
import { ResellerLayout } from "@/components/reseller/ResellerLayout";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ShieldX, Clock, MessageCircle, ArrowLeft, LogIn, Chrome, KeyRound, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

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

function RestrictedPage({ variant }: { variant: "no-access" | "pending" | "not-logged" }) {
  const isPending = variant === "pending";
  const isNotLogged = variant === "not-logged";
  const { buildUrl } = useWhatsAppConfig();

  return (
    <Layout>
      <section className="py-16 md:py-28">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
          >
            {/* Icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${
                  isPending
                    ? "bg-yellow-500/10"
                    : isNotLogged
                    ? "bg-primary/10"
                    : "bg-destructive/10"
                }`}
              >
                {isPending ? (
                  <Clock className="h-10 w-10 text-yellow-500" />
                ) : isNotLogged ? (
                  <Sparkles className="h-10 w-10 text-primary" />
                ) : (
                  <ShieldX className="h-10 w-10 text-destructive" />
                )}
              </motion.div>
            </div>

            {/* Title & description */}
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">
              {isPending
                ? "Tu solicitud está en revisión"
                : isNotLogged
                ? "Accede a tu Panel de Socios"
                : "Acceso Restringido"}
            </h1>
            <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto">
              {isPending
                ? "Hemos recibido tu postulación. Nuestro equipo la revisará en las próximas 24 horas y te notificaremos por correo."
                : isNotLogged
                ? "Inicia sesión para acceder a tu panel de socios con todas las herramientas para gestionar tu negocio."
                : "No tienes permisos de socio distribuidor. Si ya fuiste aprobado, inicia sesión con el correo registrado."}
            </p>

            {/* Access options card for not-logged and no-access */}
            {(isNotLogged || variant === "no-access") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-2xl p-6 mb-8 space-y-4"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  ¿Cómo acceder?
                </h2>

                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                      <Chrome className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Opción 1 — Google (Recomendada)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Haz clic en "Continuar con Google" usando el correo con el que te postulaste. Acceso inmediato.
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <KeyRound className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Opción 2 — Email y Contraseña</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Usa el enlace del correo de bienvenida para crear tu contraseña.
                      </p>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full gradient-bg text-primary-foreground" asChild>
                  <Link to="/auth" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Ir a Iniciar Sesión
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isPending && (
                <Button size="lg" className="gradient-bg text-primary-foreground" asChild>
                  <Link to="/" className="gap-2">
                    <Home className="h-4 w-4" />
                    Ir al Inicio
                  </Link>
                </Button>
              )}
              {variant === "no-access" && (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/representantes" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Quiero ser Socio
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a
                  href={buildUrl("Hola, necesito ayuda con mi acceso al portal de socios")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Soporte por WhatsApp
                </a>
              </Button>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() => window.history.back()}
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Volver atrás
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

  if (!user) return <RestrictedPage variant="not-logged" />;

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
