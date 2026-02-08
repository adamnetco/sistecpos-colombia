import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import SolucionesPage from "./pages/SolucionesPage";
import RestaurantesPage from "./pages/RestaurantesPage";
import RetailPage from "./pages/RetailPage";
import ProductosPage from "./pages/ProductosPage";
import ProductoDetallePage from "./pages/ProductoDetallePage";
import NosotrosPage from "./pages/NosotrosPage";
import ComparativaLicenciasPage from "./pages/ComparativaLicenciasPage";
import ContactoPage from "./pages/ContactoPage";
import SolucionNegocioPage from "./pages/SolucionNegocioPage";
import SoftwarePosLocalPage from "./pages/SoftwarePosLocalPage";
import SoftwarePosColombiaPage from "./pages/SoftwarePosColombiaPage";
import FacturacionElectronicaPage from "./pages/FacturacionElectronicaPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/soluciones" element={<SolucionesPage />} />
            <Route path="/pos-para-restaurantes" element={<RestaurantesPage />} />
            <Route path="/pos-para-retail" element={<RetailPage />} />
            <Route path="/soluciones/:slug" element={<SolucionNegocioPage />} />
            <Route path="/software-pos-colombia" element={<SoftwarePosColombiaPage />} />
            <Route path="/facturacion-electronica" element={<FacturacionElectronicaPage />} />
            <Route path="/software-pos/:city" element={<SoftwarePosLocalPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/productos/:slug" element={<ProductoDetallePage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/comparativa-licencias" element={<ComparativaLicenciasPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            {/* Redirects para URLs antiguas indexadas */}
            <Route path="/hello-world" element={<Navigate to="/software-pos-colombia" replace />} />
            <Route path="/c/uncategorized" element={<Navigate to="/productos" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
