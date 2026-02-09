import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReseller } from "@/hooks/useReseller";
import { ResellerLayout } from "@/components/reseller/ResellerLayout";

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

  if (!isReseller || !reseller) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Acceso Restringido</h1>
        <p className="text-muted-foreground">No tienes permisos de socio. Contacta al administrador.</p>
      </div>
    );
  }

  if (reseller.status !== "approved") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Solicitud en Revisión</h1>
        <p className="text-muted-foreground">Tu solicitud de socio está pendiente de aprobación.</p>
      </div>
    );
  }

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
