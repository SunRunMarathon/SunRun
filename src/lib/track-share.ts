import { trackEvent } from "@/lib/analytics";

export type ShareChannel =
  | "modal_open"
  | "qr_download"
  | "qr_copy"
  | "twitter"
  | "facebook"
  | "copy_link"
  | "native_share";

// Zapis do bazy (/api/share-click, patrz /admin) + event GA4 — jedno
// wywołanie dla każdego kliknięcia w modal "Udostępnij" i jego kanały.
export function trackShare(channel: ShareChannel) {
  trackEvent("share_click", { channel });
  fetch("/api/share-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, landingPath: window.location.pathname }),
  }).catch(() => {});
}
