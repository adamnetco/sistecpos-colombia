import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RestaurantesPage from "./pages/RestaurantesPage";
import RetailPage from "./pages/RetailPage";
import ProductosPage from "./pages/ProductosPage";
import ProductoDetallePage from "./pages/ProductoDetallePage";
import NosotrosPage from "./pages/NosotrosPage";
import ComparativaLicenciasPage from "./pages/ComparativaLicenciasPage";
import ContactoPage from "./pages/ContactoPage";
import SolucionNegocioPage from "./pages/SolucionNegocioPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pos-para-restaurantes" element={<RestaurantesPage />} />
          <Route path="/pos-para-retail" element={<RetailPage />} />
          <Route path="/pos-para-:slug" element={<SolucionNegocioPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/productos/:slug" element={<ProductoDetallePage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/comparativa-licencias" element={<ComparativaLicenciasPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
