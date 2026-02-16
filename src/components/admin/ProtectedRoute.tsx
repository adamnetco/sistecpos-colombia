import { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ShieldX, LogIn, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function AdminLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar skeleton */}
      <aside className="sticky top-0 hidden md:flex h-screen w-60 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </aside>
      {/* Content skeleton */}
      <main className="flex-1 bg-muted/30 p-6">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) return <AdminLoadingSkeleton />;

  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive/20">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>

          <h1 className="text-3xl font-bold font-display mb-2">Acceso Restringido</h1>
          <p className="text-muted-foreground mb-2">
            No tienes permisos de administrador para acceder a este panel.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-8">
            Sesión activa: <span className="font-medium text-foreground/80">{user.email}</span>
          </p>

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
                  href="https://wa.me/573001234567?text=Hola%2C%20necesito%20ayuda%20con%20el%20acceso%20al%20panel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Soporte
                </a>
              </Button>
            </div>

            <button
              onClick={signOut}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors mt-2"
            >
              Cerrar sesión actual
            </button>
          </div>

          <p className="text-xs text-muted-foreground/50 mt-8">
            © {new Date().getFullYear()} SistecPOS
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
