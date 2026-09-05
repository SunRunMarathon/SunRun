"use client";

import { MapPin } from "lucide-react";
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
// FaqSection.tsx. Bloki to redakcyjny podział surowej, płaskiej listy pozycji
// na fragmenty dnia, żeby akordeon miał realną treść do rozwijania/zwijania.
// Godziny celowo zaokrąglone do pełnych 10 minut (nie co do minuty) i bez
// nazw wykonawców/wyników bingo - na życzenie sztabu treść ma być ogólniejsza
// niż surowy, drobiazgowy harmonogram sceny.
const HARMONOGRAM: BlokHarmonogramu[] = [
  {
    id: "blok-1",
    tytul: "Otwarcie i rozgrzewka",
    zakres: "16:00–18:30",
    pozycje: [
      { godzina: "16:00", punkt: "Otwarcie wydarzenia" },
      { godzina: "17:00–18:00", punkt: "Koncert" },
      { godzina: "18:00–18:10", punkt: "Belgijka przed biegiem" },
      { godzina: "18:10–18:30", punkt: "Oficjalna rozgrzewka na scenie (LUK Lublin)" },
    ],
  },
  {
    id: "blok-2",
    tytul: "Bieg główny",
    zakres: "18:30–19:50",
    pozycje: [
      { godzina: "18:30–19:50", punkt: "Czas trwania biegu (doping)" },
    ],
  },
  {
    id: "blok-3",
    tytul: "Pokazy i koncerty",
    zakres: "19:40–20:30",
    pozycje: [
      { godzina: "19:40–20:00", punkt: "Pokazy taneczne" },
      { godzina: "20:00–20:30", punkt: "Koncert" },
    ],
  },
  {
    id: "blok-4",
    tytul: "Finał wieczoru",
    zakres: "20:50–22:00",
    pozycje: [
      { godzina: "20:50–21:20", punkt: "Oficjalna dekoracja" },
      { godzina: "21:40–21:50", punkt: "Belgijka na zakończenie wydarzenia" },
      { godzina: "21:50–22:00", punkt: "Oficjalne zamknięcie festiwalu" },
    ],
  },
];

// Stoiska nie są punktami w kolejności czasowej jak reszta harmonogramu -
// stoją cały dzień równolegle do sceny - stąd osobna stała, osobny (drugi)
// Accordion i inny akcent kolorystyczny (pomarańcz zamiast czerwieni), żeby
// wizualnie nie wyglądało to jak kolejny, następujący po sobie punkt.
const STOISKA: BlokHarmonogramu = {
  id: "blok-stoiska",
  tytul: "Stoiska i atrakcje",
  zakres: "16:00–22:00",
  pozycje: [
    { godzina: "16:00–22:00", punkt: "Malowanie twarzy i warkoczyki" },
    { godzina: "16:00–22:00", punkt: "Ludzkie warcaby" },
    { godzina: "16:00–22:00", punkt: "Znajdź idealną olimpiadę na stoisku olimpedia.com" },
    { godzina: "16:00–19:00", punkt: "Dmuchańce" },
    { godzina: "16:00–19:00", punkt: "Pojazd Żuk" },
    { godzina: "16:00–17:00", punkt: "Policjant dzielnicowy z radiowozem" },
    { godzina: "16:30–18:00 i 19:30–21:00", punkt: "Warsztaty szycia" },
    { godzina: "18:00–19:30", punkt: "Wystawa ubrań ze stoiska szycia" },
    { godzina: "od 16:00", punkt: "Stoisko Klubu Szachowego Cebularz Lublin" },
    { godzina: "w trakcie festiwalu", punkt: "Aeroklub Lubelski w Radawcu – symulator lotu" },
    { godzina: "19:00–22:00", punkt: "Świecący zbijak" },
    { godzina: "19:00–20:00", punkt: "Poszukiwanie skarbu" },
    { godzina: "w trakcie festiwalu", punkt: "Trener personalny – pokaz podstawowych ćwiczeń" },
  ],
};

function WierszePozycji({ blokId, pozycje }: { blokId: string; pozycje: PozycjaHarmonogramu[] }) {
  return (
    <div className="space-y-2">
      {pozycje.map((p, i) => (
        <div
          key={`${blokId}-${i}`}
          className="flex justify-between items-baseline gap-4 border-b border-sr-line pb-2 last:border-0 last:pb-0"
        >
          <span className="text-sm font-bold text-[#183153] shrink-0 tabular-nums">{p.godzina}</span>
          <span className="text-sm text-[#3D4D65] text-right">{p.punkt}</span>
        </div>
      ))}
    </div>
  );
}

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
          Program sceny głównej i miasteczka festiwalowego Sun Run 2026 - rozwiń każdy blok, żeby zobaczyć szczegółowy plan.
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
                <WierszePozycji blokId={blok.id} pozycje={blok.pozycje} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Separator + inny akcent koloru (pomarańcz zamiast czerwieni) - stoiska
            stoją cały dzień równolegle do sceny, nie są kolejnym punktem "po"
            "Finale wieczoru", więc mają wyglądać jak osobna kategoria. */}
        <div className="max-w-3xl mx-auto flex items-center gap-3 mt-8 mb-3" aria-hidden="true">
          <span className="h-px flex-1 bg-sr-line" />
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-sr-orange whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5" />
            Poza harmonogramem - przez cały festiwal
          </span>
          <span className="h-px flex-1 bg-sr-line" />
        </div>

        <Accordion type="multiple" className="max-w-3xl mx-auto space-y-3">
          <AccordionItem
            value={STOISKA.id}
            className="rounded-2xl border border-dashed border-sr-line-strong bg-sr-white px-6"
          >
            <AccordionTrigger className="text-left text-[#183153] font-bold hover:no-underline text-base py-4">
              <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <span>{STOISKA.tytul}</span>
                <span className="text-xs font-semibold text-sr-orange uppercase tracking-wider">
                  {STOISKA.zakres}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <WierszePozycji blokId={STOISKA.id} pozycje={STOISKA.pozycje} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

export default HarmonogramSection;
