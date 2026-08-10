"use client";

import { useEffect } from "react";
import { collectClientMeta } from "@/lib/client-meta";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";

const LOGGED_KEY = "sr_visit_logged";

// Loguje jedno wejście (pierwsza odwiedzona podstrona) na sesję przeglądarki -
// surowiec do "wejścia vs wypełnienia ankiety" w /admin. Zamontowany w
// layout.tsx (nie tylko na stronie głównej), żeby liczyć też wejścia
// bezposrednio na /archiwum, /o-nas czy /zaproszenie/[code] (np. z linku
// polecajacego) - landingPath w client-meta.ts i tak juz czyta realna sciezke.
// Odpala się dopiero po zgodzie na analitykę (ten sam baner co GA), więc
// jeśli ktoś odrzuci baner, w ogóle się nie wykona — patrz src/lib/consent.ts.
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
