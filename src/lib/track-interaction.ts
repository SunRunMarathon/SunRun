import { trackEvent } from "@/lib/analytics";
import { getVisitorId } from "@/lib/visitor-id";

export type SignupLocation = "navbar" | "sticky_bar" | "hero" | "footer" | "archiwum" | "referral";
// string, nie unia literałów: MEDIA/socialItems w footer.tsx i navbar.tsx są
// typowane jak SocialIcon (name: string) - dopasowana literałowa unia
// wymagałaby "as const" w dwóch miejscach dla zerowej korzyści.
export type SocialPlatform = string;

// Zapis do bazy (/api/interaction-click, patrz /admin) + event GA4 — wzorem
// trackShare() w track-share.ts. Nie blokuje nawigacji: wywoływane z onClick
// na zwykłych <a href>, bez preventDefault.
// visitorId: ten sam identyfikator co w ankiecie (patrz lib/visitor-id.ts) —
// pozwala w /admin połączyć kliknięcie "Zapisz się" z wcześniejszą
// odpowiedzią w ankiecie tej samej osoby, żeby zobaczyć, które źródło daje
// najwięcej realnych zapisów, nie tylko odpowiedzi w ankiecie.
function trackInteraction(category: "signup" | "social", location: string) {
  trackEvent("interaction_click", { category, location });
  fetch("/api/interaction-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category,
      location,
      landingPath: window.location.pathname,
      visitorId: getVisitorId(),
    }),
  }).catch(() => {});
}

export function trackSignupClick(location: SignupLocation) {
  trackInteraction("signup", location);
}

export function trackSocialClick(platform: SocialPlatform) {
  trackInteraction("social", platform);
}
