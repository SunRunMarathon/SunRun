"use client";

import { useEffect } from "react";
import { getVisitorId } from "@/lib/visitor-id";
import { trackSignupClick } from "@/lib/track-interaction";
import { trackEvent } from "@/lib/analytics";

const SIGNUP_URL = "https://frslublin.pl/pl/app/races/sign_up_form/295";

export function ReferralLanding({ code, inviterName }: { code: string; inviterName: string }) {
  // Wejscie na spersonalizowany link liczy sie jako "hit" tego kodu -
  // niezaleznie od tego, czy numer startowy zapraszajacego jest juz
  // zweryfikowany (patrz lib/referrals-db.ts: weryfikacja nie moze blokowac
  // dzialania linku). Konwersje liczy sie pozniej w adminie przez wspolny
  // visitor_id z klikniecia "Zapisz sie" ponizej.
  useEffect(() => {
    fetch("/api/referral/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, visitorId: getVisitorId() }),
    }).catch(() => {});
    trackEvent("referral_landing_view", { code });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <section className="relative z-10 w-full px-6 sm:px-12 pt-32 pb-20 text-center">
      <div className="max-w-2xl mx-auto">
        <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red mb-4 block">
          Zaproszenie
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#183153] mb-6 leading-tight">
          {inviterName} zaprasza Cię na Sun Run!
        </h1>
        <p className="text-base sm:text-lg text-[#3D4D65] leading-relaxed mb-10">
          Charytatywny bieg i piknik rodzinny w Parku Ludowym w Lublinie. 12 września 2026
          spotykamy się, żeby wspólnie wesprzeć Hospicjum Dobrego Samarytanina — 5 km dla
          każdego, niezależnie od kondycji, a do tego muzyka i atrakcje dla całej rodziny.
        </p>
        <a
          href={SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackSignupClick("referral")}
          className="cursor-target inline-flex items-center justify-center px-10 py-5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Zapisz się
        </a>
      </div>
    </section>
  );
}

export default ReferralLanding;
