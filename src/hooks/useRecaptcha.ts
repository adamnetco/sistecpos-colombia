import { useEffect, useCallback, useRef } from "react";

const SITE_KEY = "6Lc4iG0sAAAAAC3AvXBWdJZEQ4l4tXu0wOcz_xz2";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || document.getElementById("recaptcha-script")) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const getToken = useCallback(async (action: string): Promise<string | null> => {
    try {
      return await new Promise((resolve) => {
        if (!window.grecaptcha) {
          console.warn("reCAPTCHA not loaded");
          resolve(null);
          return;
        }
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(SITE_KEY, { action });
            resolve(token);
          } catch (err) {
            console.error("reCAPTCHA execute error:", err);
            resolve(null);
          }
        });
      });
    } catch {
      return null;
    }
  }, []);

  return { getToken };
}
