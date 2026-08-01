"use client";

import { useEffect } from "react";
import { collectClientMeta } from "@/lib/client-meta";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";

const LOGGED_KEY = "sr_visit_logged";

// Loguje jedno wejście na stronę główną na sesję przeglądarki — surowiec do
// "wejścia vs wypełnienia ankiety" w /admin. Odpala się dopiero po zgodzie na
// analitykę (ten sam baner co GA), więc jeśli ktoś odrzuci baner, w ogóle się
// nie wykona — patrz src/lib/consent.ts.
export function VisitTracker() {
  useEffect(() => {
    const logVisit = () => {
      if (window.sessionStorage.getItem(LOGGED_KEY) === "1") return;
      if (!hasAnalyticsConsent()) return;
      window.sessionStorage.setItem(LOGGED_KEY, "1");
      const meta = collectClientMeta();
      fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
      }).catch(() => {});
    };

    logVisit();
    const off = onConsentChange(logVisit);
    return off;
  }, []);

  return null;
}

export default VisitTracker;
