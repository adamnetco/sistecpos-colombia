import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

const DashboardOverview = lazy(() => import("@/components/admin/DashboardOverview"));
const LicensesView = lazy(() => import("@/components/admin/LicensesView"));
// LeadsView merged into CRM (ContactsView)
const CertificatesView = lazy(() => import("@/components/admin/CertificatesView"));
const PaymentsView = lazy(() => import("@/components/admin/PaymentsView"));
const ResellersView = lazy(() => import("@/components/admin/ResellersView"));
const ContactsView = lazy(() => import("@/components/admin/ContactsView"));
const CentralIAView = lazy(() => import("@/components/admin/CentralIAView"));
const TrackingView = lazy(() => import("@/components/admin/TrackingView"));
const DianArticlesView = lazy(() => import("@/components/admin/DianArticlesView"));
const SuppliersView = lazy(() => import("@/components/admin/SuppliersView"));
const StoreAnalyticsView = lazy(() => import("@/components/admin/StoreAnalyticsView"));
const ProductsView = lazy(() => import("@/components/admin/catalog/ProductsView"));
const BrandsView = lazy(() => import("@/components/admin/catalog/BrandsView"));
const CategoriesView = lazy(() => import("@/components/admin/catalog/CategoriesView"));
const SettingsView = lazy(() => import("@/components/admin/SettingsView"));

const ClientDownloadsView = lazy(() => import("@/components/admin/ClientDownloadsView"));
const ClientTicketsView = lazy(() => import("@/components/admin/ClientTicketsView"));
const TrainingVideosView = lazy(() => import("@/components/admin/TrainingVideosView"));
const LicensePricingView = lazy(() => import("@/components/admin/LicensePricingView"));
const RolesManagerView = lazy(() => import("@/components/admin/RolesManagerView"));
const POSUsersView = lazy(() => import("@/components/admin/POSUsersView"));
const ActiveDemosView = lazy(() => import("@/components/admin/ActiveDemosView"));
const UserActivityView = lazy(() => import("@/components/admin/UserActivityView"));
const WhatsAppNotificationsView = lazy(() => import("@/components/admin/WhatsAppNotificationsView"));
const AdminSubscriptionsView = lazy(() => import("@/components/admin/AdminSubscriptionsView"));
const AdminContractsView = lazy(() => import("@/components/admin/AdminContractsView"));

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
            <Route path="productos" element={<ProductsView />} />
            <Route path="marcas" element={<BrandsView />} />
            <Route path="categorias" element={<CategoriesView />} />
            <Route path="licencias" element={<LicensesView />} />
            <Route path="precios-licencias" element={<LicensePricingView />} />
            <Route path="leads" element={<Navigate to="/admin/contactos" replace />} />
            <Route path="certificados" element={<CertificatesView />} />
            <Route path="pagos" element={<PaymentsView />} />
            <Route path="socios" element={<ResellersView />} />
            <Route path="contactos" element={<ContactsView />} />
            <Route path="central-ia" element={<CentralIAView />} />
            <Route path="tracking" element={<TrackingView />} />
            <Route path="articulos-dian" element={<DianArticlesView />} />
            <Route path="proveedores" element={<SuppliersView />} />
            <Route path="analytics" element={<StoreAnalyticsView />} />
            
            <Route path="demos-activas" element={<ActiveDemosView />} />
            <Route path="descargas-clientes" element={<ClientDownloadsView />} />
            <Route path="tickets-clientes" element={<ClientTicketsView />} />
            <Route path="capacitacion" element={<TrainingVideosView />} />
            <Route path="usuarios-pos" element={<POSUsersView />} />
            <Route path="actividad" element={<UserActivityView />} />
            <Route path="roles" element={<RolesManagerView />} />
            <Route path="notificaciones-wa" element={<WhatsAppNotificationsView />} />
            <Route path="suscripciones" element={<AdminSubscriptionsView />} />
            <Route path="contratos" element={<AdminContractsView />} />
            <Route path="configuracion" element={<SettingsView />} />
          </Routes>
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
