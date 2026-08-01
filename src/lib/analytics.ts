// Cienka warstwa nad gtag. Zanim użytkownik zaakceptuje baner (patrz
// CookieConsent + consent.ts), skrypt GA w ogóle się nie ładuje, więc
// window.gtag nie istnieje — trackEvent po cichu nic wtedy nie robi.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
