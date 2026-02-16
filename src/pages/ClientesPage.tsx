import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Layout } from "@/components/layout/Layout";
import { RoleSwitcherBar } from "@/components/shared/RoleSwitcherBar";
import { ClientPOSLogin } from "@/components/clientes/ClientPOSLogin";
import { ClientPortal } from "@/components/clientes/ClientPortal";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldX, LogIn, Home, MessageCircle } from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  const { user, loading, isAdmin, isCustomer, isReseller } = useAuth();
  const { trackActivity } = useActivityTracker();

  useEffect(() => {
    if (user && (isAdmin || isCustomer || isReseller)) {
      trackActivity("portal_access", "/clientes");
    }
  }, [user, isAdmin, isCustomer, isReseller, trackActivity]);

  if (loading) return <ClientLoadingSkeleton />;

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

  return <ClientRestricted />;
}
