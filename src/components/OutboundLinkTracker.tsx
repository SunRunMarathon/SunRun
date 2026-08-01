"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// Globalny listener kliknięć — łapie każdy klik w link wychodzący (inna
// domena: FRS, media społecznościowe, strona hospicjum), mailto i tel, plus
// dowolny element oznaczony data-track-event="nazwa" (prosty hak do ręcznego
// oznaczania konkretnych CTA bez dotykania tego pliku). Zdarzenia trafiają do
// GA4 jako outbound_click / contact_click / <nazwa z data-track-event>.
export function OutboundLinkTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        "a[href], [data-track-event]"
      );
      if (!target) return;

      const trackedName = target.getAttribute("data-track-event");
      if (trackedName) {
        trackEvent(trackedName, { label: target.textContent?.trim().slice(0, 100) });
      }

      const href = target.getAttribute("href");
      if (!href) return;

      if (href.startsWith("mailto:")) {
        trackEvent("contact_click", { type: "email", href });
        return;
      }
      if (href.startsWith("tel:")) {
        trackEvent("contact_click", { type: "phone", href });
        return;
      }
      if (href.startsWith("http")) {
        try {
          const url = new URL(href);
          if (url.hostname !== window.location.hostname) {
            trackEvent("outbound_click", {
              href,
              domain: url.hostname,
              label: target.textContent?.trim().slice(0, 100),
            });
          }
        } catch {
          // niepoprawny URL — nic nie robimy
        }
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

export default OutboundLinkTracker;
