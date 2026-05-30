import { Suspense, lazy, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Monitor, TicketCheck, GraduationCap, Download, CreditCard, ShieldCheck, ScrollText, LogOut, FileText } from "lucide-react";
import { ClientPOSAccess } from "./ClientPOSAccess";

const SupportArticlesHub = lazy(() => import("@/components/shared/SupportArticlesHub"));

const ClientDashboardTab = lazy(() => import("./ClientDashboardTab"));
const ClientSubscriptionTab = lazy(() => import("./ClientSubscriptionTab"));
const ClientTicketsTab = lazy(() => import("./ClientTicketsTab"));
const ClientTrainingsTab = lazy(() => import("./ClientTrainingsTab"));
const ClientDownloadsTab = lazy(() => import("./ClientDownloadsTab"));
const ClientBillingTab = lazy(() => import("./ClientBillingTab"));
const ClientContractsTab = lazy(() => import("./ClientContractsTab"));

function Loader() {
  return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
}

export function ClientPortal() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Auto-switch tabs: trainings via hash, POS via #pos or activation query params
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get("tab");
  const shouldOpenPos = location.hash === "#pos" || searchParams.has("pos_user") || searchParams.has("pos_store") || searchParams.has("pos_password") || searchParams.get("activation") === "1";
  const initialTab = shouldOpenPos ? "pos" : location.hash.startsWith("#video-") ? "trainings" : tabFromUrl ?? "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.hash.startsWith("#video-")) {
      setActiveTab("trainings");
    } else if (location.hash === "#pos" || new URLSearchParams(location.search).get("activation") === "1") {
      setActiveTab("pos");
    }
  }, [location.hash, location.search]);

  return (
    <section className="py-10 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Portal de Clientes</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 self-start">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4" />Resumen</TabsTrigger>
              <TabsTrigger value="pos" className="gap-2"><Monitor className="h-4 w-4" />Mi POS</TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2"><ShieldCheck className="h-4 w-4" />Suscripción</TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2"><TicketCheck className="h-4 w-4" />Soporte</TabsTrigger>
              <TabsTrigger value="billing" className="gap-2"><CreditCard className="h-4 w-4" />Facturación</TabsTrigger>
              <TabsTrigger value="contracts" className="gap-2"><ScrollText className="h-4 w-4" />Contratos</TabsTrigger>
              <TabsTrigger value="trainings" className="gap-2"><GraduationCap className="h-4 w-4" />Entrenamientos</TabsTrigger>
              <TabsTrigger value="downloads" className="gap-2"><Download className="h-4 w-4" />Descargas</TabsTrigger>
              <TabsTrigger value="ayuda" className="gap-2"><FileText className="h-4 w-4" />Ayuda</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard"><Suspense fallback={<Loader />}><ClientDashboardTab onRequestSupport={() => setActiveTab("tickets")} /></Suspense></TabsContent>
            <TabsContent value="pos"><ClientPOSAccess /></TabsContent>
            <TabsContent value="subscription"><Suspense fallback={<Loader />}><ClientSubscriptionTab /></Suspense></TabsContent>
            <TabsContent value="tickets"><Suspense fallback={<Loader />}><ClientTicketsTab /></Suspense></TabsContent>
            <TabsContent value="billing"><Suspense fallback={<Loader />}><ClientBillingTab /></Suspense></TabsContent>
            <TabsContent value="contracts"><Suspense fallback={<Loader />}><ClientContractsTab /></Suspense></TabsContent>
            <TabsContent value="trainings"><Suspense fallback={<Loader />}><ClientTrainingsTab /></Suspense></TabsContent>
            <TabsContent value="downloads"><Suspense fallback={<Loader />}><ClientDownloadsTab /></Suspense></TabsContent>
            <TabsContent value="ayuda"><Suspense fallback={<Loader />}><SupportArticlesHub /></Suspense></TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
