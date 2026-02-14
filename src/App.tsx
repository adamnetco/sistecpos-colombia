import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";

function NicheRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/soluciones/${slug}`} replace />;
}

import { ScrollToTop } from "./components/ScrollToTop";

// Eager load: critical above-the-fold page
import Index from "./pages/Index";

// Lazy load all other pages for code splitting
const SolucionesPage = lazy(() => import("./pages/SolucionesPage"));
const ProductosPage = lazy(() => import("./pages/ProductosPage"));
const ProductoDetallePage = lazy(() => import("./pages/ProductoDetallePage"));
const NosotrosPage = lazy(() => import("./pages/NosotrosPage"));
const ComparativaLicenciasPage = lazy(() => import("./pages/ComparativaLicenciasPage"));
const ContactoPage = lazy(() => import("./pages/ContactoPage"));
const SolucionNegocioPage = lazy(() => import("./pages/SolucionNegocioPage"));
const SoftwarePosLocalPage = lazy(() => import("./pages/SoftwarePosLocalPage"));
const SoftwarePosColombiaPage = lazy(() => import("./pages/SoftwarePosColombiaPage"));
const FacturacionElectronicaPage = lazy(() => import("./pages/FacturacionElectronicaPage"));
const GraciasPage = lazy(() => import("./pages/GraciasPage"));
const PoliticaPrivacidadPage = lazy(() => import("./pages/PoliticaPrivacidadPage"));
const TerminosCondicionesPage = lazy(() => import("./pages/TerminosCondicionesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CompararPage = lazy(() => import("./pages/CompararPage"));
const ComparacionCompetidorPage = lazy(() => import("./pages/ComparacionCompetidorPage"));
const RepresentantesPage = lazy(() => import("./pages/RepresentantesPage"));
const GuiasDianHubPage = lazy(() => import("./pages/GuiasDianHubPage"));
const GuiaDianPage = lazy(() => import("./pages/GuiaDianPage"));
const CalculadoraUVTPage = lazy(() => import("./pages/CalculadoraUVTPage"));
const ValidadorNITPage = lazy(() => import("./pages/ValidadorNITPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ResellerPage = lazy(() => import("./pages/ResellerPage"));
const LandingDemoPage = lazy(() => import("./pages/LandingDemoPage"));
const LandingRepresentantesPage = lazy(() => import("./pages/LandingRepresentantesPage"));
const CasosExitoPage = lazy(() => import("./pages/CasosExitoPage"));
const CasoExitoDetallePage = lazy(() => import("./pages/CasoExitoDetallePage"));
const PagoResultadoPage = lazy(() => import("./pages/PagoResultadoPage"));
const ClientesPage = lazy(() => import("./pages/ClientesPage"));
const AyudaPage = lazy(() => import("./pages/AyudaPage"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/soluciones" element={<SolucionesPage />} />
                <Route path="/pos-para-restaurantes" element={<Navigate to="/soluciones/restaurantes" replace />} />
                <Route path="/pos-para/:slug" element={<NicheRedirect />} />
                <Route path="/pos-para-retail" element={<Navigate to="/soluciones/mini-market" replace />} />
                <Route path="/soluciones/:slug" element={<SolucionNegocioPage />} />
                <Route path="/software-pos-colombia" element={<SoftwarePosColombiaPage />} />
                <Route path="/facturacion-electronica" element={<FacturacionElectronicaPage />} />
                <Route path="/software-pos/:city" element={<SoftwarePosLocalPage />} />
                <Route path="/productos" element={<ProductosPage />} />
                <Route path="/productos/:slug" element={<ProductoDetallePage />} />
                <Route path="/nosotros" element={<NosotrosPage />} />
                <Route path="/comparativa-licencias" element={<ComparativaLicenciasPage />} />
                <Route path="/comparar" element={<CompararPage />} />
                <Route path="/comparar/:slug" element={<ComparacionCompetidorPage />} />
                <Route path="/representantes" element={<RepresentantesPage />} />
                <Route path="/guias-dian" element={<GuiasDianHubPage />} />
                <Route path="/guias-dian/:slug" element={<GuiaDianPage />} />
                <Route path="/herramientas/calculadora-uvt" element={<CalculadoraUVTPage />} />
                <Route path="/herramientas/validador-nit" element={<ValidadorNITPage />} />
                <Route path="/casos-de-exito" element={<CasosExitoPage />} />
                <Route path="/casos-de-exito/:slug" element={<CasoExitoDetallePage />} />
                <Route path="/pago/resultado" element={<PagoResultadoPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/ayuda" element={<AyudaPage />} />
                <Route path="/contacto" element={<ContactoPage />} />
                <Route path="/gracias" element={<GraciasPage />} />
                <Route path="/politica-privacidad" element={<PoliticaPrivacidadPage />} />
                <Route path="/terminos-condiciones" element={<TerminosCondicionesPage />} />
                {/* Landing pages for campaigns */}
                <Route path="/lp/demo" element={<LandingDemoPage />} />
                <Route path="/lp/representantes" element={<LandingRepresentantesPage />} />
                {/* Auth & Admin */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/socio/*" element={<ResellerPage />} />
                {/* Redirect /analytics -> /admin/analytics */}
                <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
                {/* Redirects para URLs antiguas indexadas */}
                <Route path="/hello-world" element={<Navigate to="/software-pos-colombia" replace />} />
                <Route path="/c/uncategorized" element={<Navigate to="/productos" replace />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </>
);

export default App;
