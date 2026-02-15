import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

import { TrackingScriptInjector } from "@/components/tracking/TrackingScriptInjector";
import { CookieConsentBanner } from "@/components/tracking/CookieConsentBanner";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
      
      <TrackingScriptInjector />
      <CookieConsentBanner />
    </div>
  );
}
