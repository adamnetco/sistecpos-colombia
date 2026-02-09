import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  window.dataLayer = window.dataLayer || [];
  function gtag(..._args: any[]) {
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
  function gtag(..._args: any[]) {
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

interface BannerConfig {
  title: string;
  description: string;
  btnAcceptAll: string;
  btnAnalyticsOnly: string;
  btnReject: string;
  analyticsEnabled: boolean;
  adsEnabled: boolean;
}

const DEFAULT_CONFIG: BannerConfig = {
  title: "Usamos cookies para mejorar tu experiencia",
  description:
    "Utilizamos cookies propias y de terceros (Google Analytics, Google Ads) para analizar el uso del sitio y personalizar contenido. Puedes aceptar todas, solo las necesarias o rechazarlas.",
  btnAcceptAll: "Aceptar todo",
  btnAnalyticsOnly: "Solo analítica",
  btnReject: "Rechazar",
  analyticsEnabled: true,
  adsEnabled: true,
};

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<BannerConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) return; // Already consented

    // Load config from DB
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", [
          "consent_banner_title",
          "consent_banner_description",
          "consent_btn_accept_all",
          "consent_btn_analytics_only",
          "consent_btn_reject",
          "consent_analytics_enabled",
          "consent_ads_enabled",
        ]);

      if (data && data.length > 0) {
        const map: Record<string, string> = {};
        data.forEach((r) => (map[r.key] = r.value));
        setConfig({
          title: map.consent_banner_title || DEFAULT_CONFIG.title,
          description: map.consent_banner_description || DEFAULT_CONFIG.description,
          btnAcceptAll: map.consent_btn_accept_all || DEFAULT_CONFIG.btnAcceptAll,
          btnAnalyticsOnly: map.consent_btn_analytics_only || DEFAULT_CONFIG.btnAnalyticsOnly,
          btnReject: map.consent_btn_reject || DEFAULT_CONFIG.btnReject,
          analyticsEnabled: map.consent_analytics_enabled !== "false",
          adsEnabled: map.consent_ads_enabled !== "false",
        });
      }

      // Show banner after a short delay for better UX
      setTimeout(() => setVisible(true), 1500);
    })();
  }, []);

  const handleAcceptAll = useCallback(() => {
    const prefs: ConsentPreferences = {
      analytics_storage: config.analyticsEnabled ? "granted" : "denied",
      ad_storage: config.adsEnabled ? "granted" : "denied",
      ad_user_data: config.adsEnabled ? "granted" : "denied",
      ad_personalization: config.adsEnabled ? "granted" : "denied",
    };
    updateConsent(prefs);
    setVisible(false);
  }, [config]);

  const handleAnalyticsOnly = useCallback(() => {
    updateConsent({
      analytics_storage: config.analyticsEnabled ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    setVisible(false);
  }, [config]);

  const handleRejectAll = useCallback(() => {
    updateConsent(DENIED_DEFAULTS);
    setVisible(false);
  }, []);

  if (!visible) return null;

  const showAnalyticsBtn = config.analyticsEnabled && config.adsEnabled;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-3xl rounded-xl border bg-card shadow-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{config.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.description}{" "}
              <a href="/politica-privacidad" className="underline text-primary hover:text-primary/80">
                Política de Privacidad
              </a>.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" onClick={handleAcceptAll}>
                {config.btnAcceptAll}
              </Button>
              {showAnalyticsBtn && (
                <Button size="sm" variant="outline" onClick={handleAnalyticsOnly}>
                  {config.btnAnalyticsOnly}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={handleRejectAll}>
                {config.btnReject}
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
