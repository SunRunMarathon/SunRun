"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SECTION_GAP } from "@/lib/layout";

type PozycjaHarmonogramu = { godzina: string; punkt: string };
type BlokHarmonogramu = {
  id: string;
  tytul: string;
  zakres: string;
  pozycje: PozycjaHarmonogramu[];
};

// Trzymane jako dane (nie osobne komponenty) - ten sam wzorzec co `faqs` w
// FaqSection.tsx. Bloki to redakcyjny podział surowej, płaskiej listy 14
// pozycji na 4 fragmenty dnia, żeby akordeon miał realną treść do
// rozwijania/zwijania (patrz plan - do ewentualnej korekty nazw bloków
// przez sztab, źródło nie podawało nazw grup).
const HARMONOGRAM: BlokHarmonogramu[] = [
  {
    id: "blok-1",
    tytul: "Otwarcie i rozgrzewka",
    zakres: "16:00–18:27",
    pozycje: [
      { godzina: "16:00", punkt: "Otwarcie wydarzenia" },
      { godzina: "17:00–17:55", punkt: "Koncert Milion Limonów" },
      { godzina: "18:00–18:10", punkt: "Belgijka przed biegiem" },
      { godzina: "18:12–18:27", punkt: "Oficjalna rozgrzewka na scenie (LUK Lublin)" },
    ],
  },
  {
    id: "blok-2",
    tytul: "Bieg główny",
    zakres: "18:30–19:50",
    pozycje: [
      { godzina: "18:30–19:50", punkt: "Czas trwania biegu (doping)" },
      { godzina: "19:20–19:40", punkt: "Wyniki bingo dziecięcego" },
    ],
  },
  {
    id: "blok-3",
    tytul: "Pokazy i koncerty",
    zakres: "19:40–20:30",
    pozycje: [
      { godzina: "19:40–19:45", punkt: "Pokaz tańca towarzyskiego (12–13 lat)" },
      { godzina: "19:45–19:55", punkt: "Pokaz tańca towarzyskiego Miłosza Szczotki" },
      { godzina: "20:00–20:30", punkt: "Koncert Rzędzian Wąsak" },
    ],
  },
  {
    id: "blok-4",
    tytul: "Finał wieczoru",
    zakres: "20:45–22:00",
    pozycje: [
      { godzina: "20:45–21:15", punkt: "Oficjalna dekoracja" },
      { godzina: "21:15–21:35", punkt: "Wyniki bingo 14+" },
      { godzina: "21:35–21:45", punkt: "Belgijka na zakończenie wydarzenia" },
      { godzina: "21:45–22:00", punkt: "Oficjalne zamknięcie festiwalu" },
    ],
  },
];

export function HarmonogramSection() {
  return (
    <section
      id="harmonogram"
      className="relative z-10 w-full px-6 sm:px-12 scroll-mt-28"
      style={{ paddingBottom: SECTION_GAP }}
      aria-labelledby="harmonogram-heading"
    >
      <div className="max-w-[88rem] mx-auto w-full">
        <h2
          id="harmonogram-heading"
          className="text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-5"
        >
          Harmonogram
        </h2>
        <p className="text-sm sm:text-base text-[#3D4D65] mb-8 max-w-2xl">
          Program sceny głównej Sun Run 2026 - rozwiń każdy blok, żeby zobaczyć szczegółowy plan.
        </p>

        {/* type="multiple": bloki są niezależne, można mieć otwartych kilka
            naraz (np. porównać "Bieg główny" z "Pokazami") - inaczej niż w
            FAQ, gdzie pytania są tematycznie rozłączne i single ma sens. */}
        <Accordion type="multiple" defaultValue={["blok-1"]} className="max-w-3xl mx-auto space-y-3">
          {HARMONOGRAM.map((blok) => (
            <AccordionItem
              key={blok.id}
              value={blok.id}
              className="rounded-2xl border border-sr-line bg-sr-white px-6 not-last:border-b-0"
            >
              <AccordionTrigger className="text-left text-[#183153] font-bold hover:no-underline text-base py-4">
                <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                  <span>{blok.tytul}</span>
                  <span className="text-xs font-semibold text-sr-red uppercase tracking-wider">
                    {blok.zakres}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-2">
                  {blok.pozycje.map((p) => (
                    <div
                      key={p.godzina}
                      className="flex justify-between items-baseline gap-4 border-b border-sr-line pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-sm font-bold text-[#183153] shrink-0 tabular-nums">
                        {p.godzina}
                      </span>
                      <span className="text-sm text-[#3D4D65] text-right">{p.punkt}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default HarmonogramSection;
