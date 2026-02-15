import { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ShieldX, LogIn, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 px-4">
        {/* Decorative blurred circles */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-destructive/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive/20"
          >
            <ShieldX className="h-10 w-10 text-destructive" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h1 className="text-3xl font-bold font-display mb-2">Acceso Restringido</h1>
            <p className="text-muted-foreground mb-2">
              No tienes permisos de administrador para acceder a este panel.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-8">
              Sesión activa: <span className="font-medium text-foreground/80">{user.email}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-3"
          >
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
          </motion.div>

          <p className="text-xs text-muted-foreground/50 mt-8">
            © {new Date().getFullYear()} SistecPOS
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
