"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { getStoredConsent, setConsent } from "@/lib/consent";
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

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Zgoda na pliki cookie i analitykę"
          className="fixed inset-x-0 bottom-0 z-[200] p-4 sm:p-6"
          variants={getBottomBarVariants(reducedMotion)}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mx-auto max-w-3xl bg-sr-navy text-sr-sand rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-xs sm:text-sm leading-relaxed flex-1">
              Używamy Google Analytics, żeby zrozumieć, skąd przychodzą odwiedzający i jak
              korzystają ze strony. Włączy się dopiero po Twojej zgodzie. Szczegóły w{" "}
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
