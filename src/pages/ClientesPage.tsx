import { useEffect, Suspense, lazy, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Layout } from "@/components/layout/Layout";
import { RoleSwitcherBar } from "@/components/shared/RoleSwitcherBar";
import { ClientPOSLogin } from "@/components/clientes/ClientPOSLogin";
import { ClientPortal } from "@/components/clientes/ClientPortal";
import { ClientPOSAccess } from "@/components/clientes/ClientPOSAccess";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { ShieldX, LogIn, Home, MessageCircle, UserPlus, Monitor, GraduationCap, LogOut } from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { readPOSActivationParams } from "@/lib/posActivationParams";

const ClientTrainingsTab = lazy(() => import("@/components/clientes/ClientTrainingsTab"));

function PublicPortalLoader() {
  return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
}

/**
 * Limited portal for authenticated users without assigned roles ("Público").
 * Grants access only to Mi POS and Entrenamientos.
 */
function PublicPortal() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const activation = readPOSActivationParams();
  const initialTab = location.hash.startsWith("#video-") && !activation.isActivation ? "trainings" : "pos";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.hash === "#pos" || readPOSActivationParams().isActivation) setActiveTab("pos");
    if (location.hash.startsWith("#video-")) setActiveTab("trainings");
  }, [location.hash, location.search]);

  return (
    <section className="py-10 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Portal de Acceso</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Tu cuenta está pendiente de aprobación. Mientras tanto puedes acceder a Mi POS y Entrenamientos.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 self-start">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="h-auto gap-1">
              <TabsTrigger value="pos" className="gap-2"><Monitor className="h-4 w-4" />Mi POS</TabsTrigger>
              <TabsTrigger value="trainings" className="gap-2"><GraduationCap className="h-4 w-4" />Entrenamientos</TabsTrigger>
            </TabsList>
            <TabsContent value="pos"><ClientPOSAccess /></TabsContent>
            <TabsContent value="trainings"><Suspense fallback={<PublicPortalLoader />}><ClientTrainingsTab /></Suspense></TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}


function ClientLoadingSkeleton() {
  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center space-y-3">
              <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader><Skeleton className="h-12 w-full" /></CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><Skeleton className="h-12 w-full" /></CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function ClientRestricted() {
  const { user, signOut } = useAuth();
  const { buildUrl } = useWhatsAppConfig();

  return (
    <Layout>
      <section className="py-16 md:py-28">
        <div className="container px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
              <ShieldX className="h-10 w-10 text-destructive" />
            </div>

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
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function ClientesPage() {
  const { user, loading, isAdmin, isCustomer, isReseller, roles } = useAuth();
  const { trackActivity } = useActivityTracker();

  // "Public" users = authenticated but no roles assigned
  const isPublicUser = !!user && roles.length === 0;
  const hasAccess = isAdmin || isCustomer || isReseller || isPublicUser;

  useEffect(() => {
    if (user && hasAccess) {
      trackActivity("portal_access", "/clientes");
    }
  }, [user, hasAccess, trackActivity]);

  if (loading) return <ClientLoadingSkeleton />;

  if (!user) {
    return (
      <Layout>
        <SEO
          title="Acceso Clientes | SistecPOS"
          description="Ingresa a tu sistema POS SistecPOS. Accede a soporte, descargas y entrenamientos."
        />
        <ClientPOSLogin />
        <div className="container px-4 pb-12">
          <div className="max-w-md mx-auto text-center space-y-3">
            <p className="text-sm text-muted-foreground">¿Aún no tienes cuenta?</p>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/auth?registro=cliente">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear cuenta de cliente
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasAccess) {
    return (
      <Layout>
        <SEO
          title="Portal de Clientes | SistecPOS"
          description="Accede a soporte, descargas y entrenamientos de SistecPOS."
        />
        <div className="container px-4 pt-4">
          <RoleSwitcherBar />
        </div>
        {isPublicUser ? <PublicPortal /> : <ClientPortal />}
      </Layout>
    );
  }

  return <ClientRestricted />;
}
