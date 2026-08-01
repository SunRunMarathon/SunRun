// Zgoda na analitykę (Google Consent Mode v2 + nasz własny tracking).
// Domyślnie: brak zgody. Dopóki użytkownik nie kliknie "Akceptuję" w banerze,
// GA i licznik wejść (page_visits) się nie odpalają.

const CONSENT_KEY = "sr_consent_analytics";
const CONSENT_EVENT = "sunrun:consent-change";
const CONSENT_RESET_EVENT = "sunrun:consent-reset";

export type ConsentValue = "granted" | "denied";

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function hasAnalyticsConsent(): boolean {
  return getStoredConsent() === "granted";
}

export function setConsent(value: ConsentValue) {
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function onConsentChange(cb: (value: ConsentValue) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentValue>).detail);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

// Wycofanie zgody ma być tak samo łatwe jak jej udzielenie (link „Zarządzaj
// zgodą" w stopce, patrz footer.tsx) - czyści zapisany wybór i każe banerowi
// (CookieConsent.tsx) pokazać się ponownie od razu, na tej samej stronie, bez
// grzebania w ustawieniach przeglądarki.
export function resetConsent() {
  window.localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_RESET_EVENT));
}

export function onConsentReset(cb: () => void) {
  window.addEventListener(CONSENT_RESET_EVENT, cb);
  return () => window.removeEventListener(CONSENT_RESET_EVENT, cb);
}
