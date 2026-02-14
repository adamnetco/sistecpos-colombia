import { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Trophy, HelpCircle, Navigation, Settings, Bot } from "lucide-react";

const WhatsAppSettingsTab = lazy(() => import("./settings/WhatsAppSettingsTab"));
const SuccessStoriesTab = lazy(() => import("./settings/SuccessStoriesTab"));
const DynamicFAQsTab = lazy(() => import("./settings/DynamicFAQsTab"));
const NavManagerTab = lazy(() => import("./settings/NavManagerTab"));
const GeneralSettingsTab = lazy(() => import("./settings/GeneralSettingsTab"));
const ChatbotSettingsTab = lazy(() => import("./ChatbotSettingsTab"));

function Loader() {
  return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
}

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración del Sitio</h1>
        <p className="text-muted-foreground">Gestiona WhatsApp, casos de éxito, FAQs, navegación y enlaces</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2"><Settings className="h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2"><MessageCircle className="h-4 w-4" />WhatsApp</TabsTrigger>
          <TabsTrigger value="stories" className="gap-2"><Trophy className="h-4 w-4" />Casos de Éxito</TabsTrigger>
          <TabsTrigger value="faqs" className="gap-2"><HelpCircle className="h-4 w-4" />FAQs</TabsTrigger>
          <TabsTrigger value="nav" className="gap-2"><Navigation className="h-4 w-4" />Navegación</TabsTrigger>
          <TabsTrigger value="chatbot" className="gap-2"><Bot className="h-4 w-4" />Chatbot</TabsTrigger>
        </TabsList>

        <TabsContent value="general"><Suspense fallback={<Loader />}><GeneralSettingsTab /></Suspense></TabsContent>
        <TabsContent value="whatsapp"><Suspense fallback={<Loader />}><WhatsAppSettingsTab /></Suspense></TabsContent>
        <TabsContent value="stories"><Suspense fallback={<Loader />}><SuccessStoriesTab /></Suspense></TabsContent>
        <TabsContent value="faqs"><Suspense fallback={<Loader />}><DynamicFAQsTab /></Suspense></TabsContent>
        <TabsContent value="nav"><Suspense fallback={<Loader />}><NavManagerTab /></Suspense></TabsContent>
        <TabsContent value="chatbot"><Suspense fallback={<Loader />}><ChatbotSettingsTab /></Suspense></TabsContent>
      </Tabs>
    </div>
  );
}
