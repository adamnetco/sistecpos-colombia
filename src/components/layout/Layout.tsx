import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { TrackingScriptInjector } from "@/components/tracking/TrackingScriptInjector";
import { CookieConsentBanner } from "@/components/tracking/CookieConsentBanner";
import { CartProvider } from "@/hooks/useCart";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <CartDrawer />
        <ChatbotWidget />
        <TrackingScriptInjector />
        <CookieConsentBanner />
      </div>
    </CartProvider>
  );
}
