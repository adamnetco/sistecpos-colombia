import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

const DashboardOverview = lazy(() => import("@/components/admin/DashboardOverview"));
const LicensesView = lazy(() => import("@/components/admin/LicensesView"));
const LeadsView = lazy(() => import("@/components/admin/LeadsView"));
const CertificatesView = lazy(() => import("@/components/admin/CertificatesView"));
const PaymentsView = lazy(() => import("@/components/admin/PaymentsView"));
const ResellersView = lazy(() => import("@/components/admin/ResellersView"));
const ContactsView = lazy(() => import("@/components/admin/ContactsView"));
const CentralIAView = lazy(() => import("@/components/admin/CentralIAView"));
const TrackingView = lazy(() => import("@/components/admin/TrackingView"));
const SuppliersView = lazy(() => import("@/components/admin/SuppliersView"));

function Loader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="licencias" element={<LicensesView />} />
            <Route path="leads" element={<LeadsView />} />
            <Route path="certificados" element={<CertificatesView />} />
            <Route path="pagos" element={<PaymentsView />} />
            <Route path="socios" element={<ResellersView />} />
            <Route path="contactos" element={<ContactsView />} />
            <Route path="central-ia" element={<CentralIAView />} />
            <Route path="tracking" element={<TrackingView />} />
            <Route path="proveedores" element={<SuppliersView />} />
          </Routes>
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
