import { Suspense, lazy, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Monitor, TicketCheck, GraduationCap, Download, CreditCard, ShieldCheck, LogOut } from "lucide-react";
import { ClientPOSAccess } from "./ClientPOSAccess";

const ClientDashboardTab = lazy(() => import("./ClientDashboardTab"));
const ClientSubscriptionTab = lazy(() => import("./ClientSubscriptionTab"));
const ClientTicketsTab = lazy(() => import("./ClientTicketsTab"));
const ClientTrainingsTab = lazy(() => import("./ClientTrainingsTab"));
const ClientDownloadsTab = lazy(() => import("./ClientDownloadsTab"));
const ClientBillingTab = lazy(() => import("./ClientBillingTab"));

function Loader() {
  return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
}

export function ClientPortal() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Auto-switch to trainings tab when URL has #video-* hash (deep-link from chatbot)
  const initialTab = location.hash.startsWith("#video-") ? "trainings" : "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.hash.startsWith("#video-")) {
      setActiveTab("trainings");
    }
  }, [location.hash]);

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
              <TabsTrigger value="trainings" className="gap-2"><GraduationCap className="h-4 w-4" />Entrenamientos</TabsTrigger>
              <TabsTrigger value="downloads" className="gap-2"><Download className="h-4 w-4" />Descargas</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard"><Suspense fallback={<Loader />}><ClientDashboardTab /></Suspense></TabsContent>
            <TabsContent value="pos"><ClientPOSAccess /></TabsContent>
            <TabsContent value="subscription"><Suspense fallback={<Loader />}><ClientSubscriptionTab /></Suspense></TabsContent>
            <TabsContent value="tickets"><Suspense fallback={<Loader />}><ClientTicketsTab /></Suspense></TabsContent>
            <TabsContent value="billing"><Suspense fallback={<Loader />}><ClientBillingTab /></Suspense></TabsContent>
            <TabsContent value="trainings"><Suspense fallback={<Loader />}><ClientTrainingsTab /></Suspense></TabsContent>
            <TabsContent value="downloads"><Suspense fallback={<Loader />}><ClientDownloadsTab /></Suspense></TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
