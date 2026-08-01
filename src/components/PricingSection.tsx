"use client";

import { useEffect, useState } from "react";

// To NIE jest cena biletu - Sun Run to bieg charytatywny, więc wpłata jest
// darowizną z progiem MINIMALNYM. Kwoty rosną z czasem, żeby zachęcić do
// wcześniejszych zapisów, ale każdy próg dopuszcza wpłatę wyższą niż minimum
// (i to realnie zwiększa wpłaty - stąd wyraźne podkreślenie tego w treści).
//
// Te same wartości (kwoty, daty) trafiają też do offers w JSON-LD
// (src/components/StructuredData.tsx) - jedno źródło prawdy, żeby to, co
// widzi człowiek na stronie, i to, co dostaje Google w danych strukturalnych,
// zawsze zgadzało się co do znaku. Zmieniasz próg tutaj -> zmień identycznie
// tam, inaczej wracamy do ryzyka cloakingu.
export type Tier = {
  id: string;
  label: string;
  amount: number;
  deadlineLabel: string;
  // Koniec obowiązywania progu (włącznie, koniec dnia czasu polskiego).
  activeUntil: string;
};

export const TIERS: Tier[] = [
  { id: "t1", label: "I termin", amount: 60, deadlineLabel: "do 9 sierpnia 2026", activeUntil: "2026-08-09T23:59:59+02:00" },
  { id: "t2", label: "II termin", amount: 70, deadlineLabel: "do 9 września 2026", activeUntil: "2026-09-09T23:59:59+02:00" },
  { id: "t3", label: "III termin", amount: 80, deadlineLabel: "w dniu biegu (12 września 2026)", activeUntil: "2026-09-12T23:59:59+02:00" },
];

// Liczone z aktualnej daty, nie zaszyte na sztywno - inaczej strona zaczęłaby
// pokazywać nieaktualny próg dzień po każdym terminie. Po terminie III (czyli
// po samym biegu) zwraca ostatni próg - to i tak już nieaktywny formularz zapisu.
function getActiveTierIndex(now: Date): number {
  for (let i = 0; i < TIERS.length; i++) {
    if (now.getTime() <= new Date(TIERS[i].activeUntil).getTime()) return i;
  }
  return TIERS.length - 1;
}

const REJESTRACJA_URL = "https://frslublin.pl/pl/app/races/sign_up_form/295";

export function PricingSection() {
  // null do czasu zamontowania na kliencie - inaczej serwer (data renderowania)
  // i klient (data w przeglądarce użytkownika) mogłyby przy odrobinie pecha
  // wylosować różny próg w okolicach północy i React zgłosiłby niezgodność
  // hydracji. Pierwsza klatka po obu stronach jest identyczna (bez podświetleń),
  // właściwy stan doskakuje chwilę później.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(getActiveTierIndex(new Date()));
  }, []);

  // Wypełnienie cienkiej "osi czasu" nad kartami - czysto dekoracyjne (stan
  // progu jest już jednoznacznie opisany słownie na każdej karcie), więc
  // aria-hidden. Brak podświetlenia (activeIndex===null) = pusta oś.
  const fillPct = activeIndex === null ? 0 : ((activeIndex + 1) / TIERS.length) * 100;

  return (
    <section id="oplaty" className="relative z-10 w-full px-6 sm:px-12 pb-16 sm:pb-24">
      <div className="max-w-[88rem] mx-auto">
        <h2 className="text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-4">
          Minimalna wpłata
        </h2>
        <p className="text-sm sm:text-base text-[#3D4D65] leading-relaxed max-w-3xl mb-2">
          Sun Run to bieg charytatywny, a nie płatna impreza - kwoty poniżej to{" "}
          <strong className="text-[#183153]">minimalna wpłata</strong>, nie cena biletu.
        </p>
        <p className="text-sm sm:text-base text-[#3D4D65] leading-relaxed max-w-3xl mb-8">
          Możesz śmiało wpłacić więcej niż minimum - cały dochód trafia bezpośrednio do
          Hospicjum Dobrego Samarytanina, a każda dodatkowa złotówka realnie pomaga.
        </p>

        {/* Delikatna oś czasu nad kartami - bez zegara i bez czerwieni, tylko
            spokojne zaznaczenie, że próg przesuwa się wraz z kalendarzem. */}
        <div aria-hidden="true" className="hidden sm:block h-1 rounded-full bg-sr-line mb-3 overflow-hidden max-w-[88rem]">
          <div
            className="h-full rounded-full bg-sr-orange transition-[width] duration-700 ease-out"
            style={{ width: `${fillPct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TIERS.map((tier, i) => {
            const isActive = activeIndex === i;
            const isPast = activeIndex !== null && i < activeIndex;

            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl border p-6 transition-colors ${
                  isActive
                    ? "bg-sr-white border-sr-orange shadow-lg"
                    : isPast
                      ? "bg-sr-sand/40 border-sr-line"
                      : "bg-sr-white border-sr-line shadow-sm"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-sr-orange text-sr-navy text-[10px] font-black uppercase tracking-widest shadow">
                    Aktualny próg
                  </span>
                )}
                {isPast && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-sr-navy text-sr-white text-[10px] font-black uppercase tracking-widest">
                    Zakończony
                  </span>
                )}

                <span className="text-xs font-bold uppercase tracking-widest text-[#3D4D65]">
                  {tier.label}
                </span>
                <p className="mt-2 mb-1">
                  <span className="text-4xl font-black text-[#183153]">{tier.amount}</span>
                  <span className="text-lg font-bold text-[#3D4D65]"> zł</span>
                </p>
                <p className="text-xs text-[#3D4D65] uppercase tracking-wider mb-1">
                  minimalna wpłata
                </p>
                <p className="text-sm text-[#3D4D65]">{tier.deadlineLabel}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <a
            href={REJESTRACJA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-target inline-flex items-center justify-center px-12 py-5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Zapisz się
          </a>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
