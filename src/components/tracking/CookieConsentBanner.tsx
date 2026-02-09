import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const CONSENT_KEY = "sistecpos_cookie_consent";

type ConsentState = "granted" | "denied";

interface ConsentPreferences {
  analytics_storage: ConsentState;
  ad_storage: ConsentState;
  ad_user_data: ConsentState;
  ad_personalization: ConsentState;
}

const DENIED_DEFAULTS: ConsentPreferences = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

const GRANTED_ALL: ConsentPreferences = {
  analytics_storage: "granted",
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
};

/**
 * Initializes Google Consent Mode v2 defaults.
 * MUST run before any Google tags (gtag.js / GTM) load.
 */
export function initConsentDefaults() {
  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }

  const saved = localStorage.getItem(CONSENT_KEY);
  const prefs: ConsentPreferences = saved ? JSON.parse(saved) : DENIED_DEFAULTS;

  gtag("consent", "default", {
    analytics_storage: prefs.analytics_storage,
    ad_storage: prefs.ad_storage,
    ad_user_data: prefs.ad_user_data,
    ad_personalization: prefs.ad_personalization,
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
}

function updateConsent(prefs: ConsentPreferences) {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }

  gtag("consent", "update", {
    analytics_storage: prefs.analytics_storage,
    ad_storage: prefs.ad_storage,
    ad_user_data: prefs.ad_user_data,
    ad_personalization: prefs.ad_personalization,
  });

  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    updateConsent(GRANTED_ALL);
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    updateConsent(DENIED_DEFAULTS);
    setVisible(false);
  }, []);

  const handleAcceptNecessary = useCallback(() => {
    // Grant only analytics, deny ads
    updateConsent({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-3xl rounded-xl border bg-card shadow-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Usamos cookies para mejorar tu experiencia</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utilizamos cookies propias y de terceros (Google Analytics, Google Ads) para analizar el uso del sitio y personalizar contenido.
              Puedes aceptar todas, solo las necesarias o rechazarlas. Más info en nuestra{" "}
              <a href="/politica-privacidad" className="underline text-primary hover:text-primary/80">
                Política de Privacidad
              </a>.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" onClick={handleAcceptAll}>
                Aceptar todo
              </Button>
              <Button size="sm" variant="outline" onClick={handleAcceptNecessary}>
                Solo analítica
              </Button>
              <Button size="sm" variant="ghost" onClick={handleRejectAll}>
                Rechazar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extend Window for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}
