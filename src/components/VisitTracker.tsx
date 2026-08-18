"use client";

import { useEffect } from "react";
import { collectClientMeta } from "@/lib/client-meta";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";
import { getVisitorId } from "@/lib/visitor-id";

const LOGGED_KEY = "sr_visit_logged";
const LOGGED_TOTAL_KEY = "sr_visit_total_logged";

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
        body: JSON.stringify({ visitorId: getVisitorId(), ...meta }),
      }).catch(() => {});
    };

    logVisit();
    const off = onConsentChange(logVisit);
    return off;
  }, []);

  // Osobny, ZAWSZE dzialajacy licznik - patrz api/visit-total/route.ts. Nie
  // czeka na zgode i nie sprawdza jej w ogole, bo nie wysyla nic ponad sam
  // fakt wejscia (zero IP/user-agent/UTM/identyfikatora). sessionStorage tu
  // sluzy WYLACZNIE do lokalnej deduplikacji w obrebie jednej karty
  // przegladarki - nic z niego nie trafia na serwer, wiec to nie jest
  // "przechowywanie informacji w celu sledzenia" w rozumieniu ePrivacy.
  useEffect(() => {
    if (window.sessionStorage.getItem(LOGGED_TOTAL_KEY) === "1") return;
    window.sessionStorage.setItem(LOGGED_TOTAL_KEY, "1");
    fetch("/api/visit-total", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}

export default VisitTracker;
