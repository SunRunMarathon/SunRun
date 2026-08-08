"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";
import { trackEvent } from "@/lib/analytics";

const GA_ID = "G-13PE0DJ8V6";

function loadGtag() {
  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // KRYTYCZNE: zwykła `function`, bez `...rest` w parametrach - potrzebujemy
  // jej WŁASNEGO `arguments`. gtag.js rozpoznaje komendy w dataLayer tylko,
  // gdy trafiają tam jako `arguments` (Object.prototype.toString.call daje
  // "[object Arguments]") - to jest to, co robi oficjalny snippet Google:
  // `function gtag(){ dataLayer.push(arguments); }`. Wcześniejsza wersja
  // zbierała argumenty przez `...args`, co samo w sobie tworzy zwykłą
  // TABLICĘ ("[object Array]") i wypychała TĘ tablicę - gtag.js takiego
  // kształtu nie rozpoznaje jako komendy i po cichu go ignoruje. Efekt:
  // dataLayer wyglądał poprawnie, skrypt ładował się z 200, ale żaden wpis
  // nigdy nie został faktycznie przetworzony - stąd zero ruchu w GA4 mimo
  // pozornie sprawnego kodu.
  function gtag() {
    // To WŁAŚNIE reguła "prefer-rest-params" (w poprzedniej wersji: `function
    // gtag(...args)`) spowodowała, że GA4 nigdy nie odbierał komend - `...rest`
    // daje zwykłą tablicę, a gtag.js wymaga dokładnie `arguments`. Zamiana
    // z powrotem na rest params przywróci bug.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
  window.gtag = gtag;
  // Oficjalna kolejność Google dla Consent Mode v2: "default" MUSI polecieć
  // przed czymkolwiek innym, nawet tutaj, gdzie i tak ląduje w tej samej
  // klatce co "update" (skrypt i tak ładuje się dopiero po zgodzie - patrz
  // komentarz pod funkcją). Bez tego gtag.js dostaje "update" jako pierwszy
  // sygnał zgody w ogóle, czego oficjalny wzorzec nie przewiduje.
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  // Consent Mode v2 — ad storage zostaje odrzucony, bo strona nie prowadzi
  // reklam; analytics_storage jest udzielony, skoro w ogóle doszliśmy do
  // wczytania tagu (czyli użytkownik już kliknął "Akceptuję").
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

// Skrypt GA4 ładuje się DOPIERO po zgodzie z banera cookies (CookieConsent.tsx)
// — przed zgodą window.gtag w ogóle nie istnieje, więc trackEvent() z
// lib/analytics.ts jest wtedy no-opem. To mocniejszy wariant niż typowy
// Consent Mode v2 (gdzie tag ładuje się zawsze i wysyła ograniczone/cookieless
// pingi) — tu nic nie leci do Google przed wyraźną zgodą.
export function GoogleAnalytics() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (hasAnalyticsConsent()) loadGtag();
    const off = onConsentChange((value) => {
      if (value === "granted") {
        loadGtag();
        return;
      }
      // Wycofanie zgody PO tym, jak tag juz sie zaladowal (link "Zarzadzaj
      // zgoda" w stopce) - samego skryptu nie da sie sciagnac z powrotem, ale
      // Consent Mode ma na to odpowiedz: po tym sygnale Google faktycznie
      // przestaje zapisywac/wykorzystywac dane, mimo ze tag technicznie
      // zostaje wczytany w przegladarce.
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "denied" });
      }
    });
    return off;
  }, []);

  // gtag('config', ...) w loadGtag() już wysyła page_view dla pierwszego
  // wejścia — tu łapiemy tylko KOLEJNE nawigacje w obrębie SPA (Link z
  // next/navigation nie przeładowuje strony, więc bez tego GA widziałoby
  // tylko pierwszą odwiedzoną podstronę).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackEvent("page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}

export default GoogleAnalytics;
