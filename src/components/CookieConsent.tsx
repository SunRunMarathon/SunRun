"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { getStoredConsent, setConsent, onConsentReset } from "@/lib/consent";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getBottomBarVariants } from "@/lib/motion-variants";

// Baner zgody na Google Analytics. Domyślnie brak zgody - GA (patrz
// GoogleAnalytics.tsx) w ogóle się nie ładuje, dopóki użytkownik nie kliknie
// "Akceptuję". To silniejszy wariant niż standardowy Consent Mode v2 (gdzie
// tag ładuje się zawsze i tylko ogranicza zbieranie): tu nic nie leci do
// Google, dopóki nie ma wyraźnej zgody.
export function CookieConsent() {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  // Domyślnie nisko (bottom-0). Podnosi się TYLKO gdy dolny sticky pasek
  // "Zapisz się" (page.tsx, #sticky-signup-bar) faktycznie wjedzie na ekran -
  // nie na stałe "w razie gdyby ktoś zescrollował". CookieConsent żyje w
  // layout.tsx i nie odmontowuje się przy nawigacji, a pasek istnieje tylko
  // na stronie głównej i sam wjeżdża/wyjeżdża (translate-y) w reakcji na
  // scroll - stąd MutationObserver (łapie pojawienie się/zniknięcie paska
  // przy nawigacji) + IntersectionObserver (łapie sam wjazd/wyjazd na ekran).
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
    // "Zarządzaj zgodą" w stopce czyści zapisany wybór i odpala ten event -
    // baner ma się pokazać ponownie natychmiast, na tej samej stronie.
    return onConsentReset(() => setVisible(true));
  }, []);

  useEffect(() => {
    let io: IntersectionObserver | null = null;

    const attach = () => {
      const bar = document.getElementById("sticky-signup-bar");
      if (!bar) {
        setBarVisible(false);
        return;
      }
      io?.disconnect();
      io = new IntersectionObserver(([entry]) => setBarVisible(entry.isIntersecting), {
        threshold: 0.1,
      });
      io.observe(bar);
    };

    attach();
    // Łapie zarówno pierwsze pojawienie się paska (SSR->hydracja, powrót na
    // stronę główną z innej podstrony), jak i jego zniknięcie z DOM.
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io?.disconnect();
      mo.disconnect();
    };
  }, []);

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setVisible(false);
    // Niezalezne od samej zgody (patrz komentarz w api/consent-choice/route.ts) -
    // to jedyne miejsce, w ktorym widac, ile osob w ogole widzialo baner i co
    // wybraly, wliczajac "Odrzuc" (ktorego GA/page_visits z definicji nigdy
    // nie zobacza).
    fetch("/api/consent-choice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice: value }),
    }).catch(() => {});
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Zgoda na pliki cookie i analitykę"
          // bottom-0 domyślnie; podnosi się na bottom-24/28 TYLKO gdy barVisible
          // (patrz efekt wyżej) - dokładnie tyle, ile potrzeba, żeby zmieścić się
          // nad dolnym stickym paskiem "Zapisz się" (page.tsx, ~97px wysokości,
          // z-50), a nie stały zapas na wypadek scrolla. transition-[bottom]
          // animuje samo przesunięcie niezależnie od wjazdu/wyjazdu bannera
          // (te animuje getBottomBarVariants przez osobne, framer-motionowe y).
          className={`fixed inset-x-0 z-[200] p-4 sm:p-6 transition-[bottom] duration-300 ease-out ${
            barVisible ? "bottom-24 sm:bottom-28" : "bottom-0"
          }`}
          variants={getBottomBarVariants(reducedMotion)}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mx-auto max-w-3xl bg-sr-navy text-sr-sand rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-xs sm:text-sm leading-relaxed flex-1">
              Używamy Google Analytics, żeby zrozumieć, skąd przychodzą odwiedzający i&nbsp;jak
              korzystają ze strony. Włączy się dopiero po Twojej zgodzie. Szczegóły w{" "}
              <Link href="/polityka-prywatnosci" className="underline hover:text-sr-orange">
                polityce prywatności
              </Link>
              .
            </p>
            <div className="flex gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="cursor-target flex-1 sm:flex-none px-5 py-2.5 border border-sr-sand/40 hover:border-sr-sand rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Odrzuć
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="cursor-target flex-1 sm:flex-none px-5 py-2.5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy rounded-full text-xs font-black uppercase tracking-widest transition-colors"
              >
                Akceptuję
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
