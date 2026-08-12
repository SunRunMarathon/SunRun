"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Wczesniej: kompaktowa karta + modal generujacy link na tej samej stronie.
// Modal renderowal sie POD pozniejszymi sekcjami (Wspomnienia/FAQ/Partnerzy)
// i sam w sobie byl za malo widoczny jak na cos, co ma zachecac do udzialu -
// stad zwykly link na osobna, wieksza podstrone (/zaproszenie) zamiast
// modala. Patrz ReferralGenerator.tsx.

// Odstęp między przyciskiem a płatkami po lewej/prawej stronie - to one są
// najciaśniejsze (przycisk jest szeroki i płaski, dziura w środku grafiki
// w przybliżeniu okrągła, więc u góry/dołu luzu jest więcej niż po bokach).
const ODSTEP_OD_PLATKOW = 16;

// Zmierzone dokladnie (flood-fill po kanale alfa) na
// public/slonecznik-duzy-transparent.png: prawdziwy SRODEK dziury (liczony
// jako centroid wszystkich przezroczystych pikseli w niej) wypada w
// (369,9; 379,0) - NIE dokladnie w geometrycznym srodku calego obrazka
// (372,5; 371,5), jak zakladala wczesniejsza wersja tego pliku. Ta roznica
// (~2,6px w poziomie, ~7,5px w pionie w skali natywnej) to byla realna
// przyczyna zgloszonej asymetrii odstepu lewo/prawo od przycisku - obrazek
// centrowal sie na WLASNYM srodku, nie na srodku dziury. Liczac promien od
// poprawnego centroidu (nie od geometrycznego srodka), dziura okazuje sie
// niemal idealnym kolem (promien 198,0-201,4px, wczesniejszy odczyt
// 192-208px byl artefaktem liczenia z blednego punktu) - stad bezpieczny
// promien (198) tez sie zmienil.
const SLONECZNIK_SZEROKOSC = 745;
const SLONECZNIK_WYSOKOSC = 743;
const SLONECZNIK_PROMIEN_DZIURY = 198;
const SLONECZNIK_SRODEK_DZIURY_X = 369.9;
const SLONECZNIK_SRODEK_DZIURY_Y = 379.0;

// "Powiekszenie o 5%" - proste skalowanie koncowego rozmiaru, niezalezne od
// wyliczenia opartego na szerokosci przycisku + stalym odstepie ponizej.
const POWIEKSZENIE = 1.05;

export function ReferralPanel() {
  // Grafika ma być wyśrodkowana na SAMYM PRZYCISKU (nie na całej karcie) i
  // skalowana względem jego realnej, wyrenderowanej szerokości - stąd pomiar
  // zamiast jednej stałej wartości, żeby luka po bokach zostawała "nieduża"
  // niezależnie od tego, jak szeroki jest przycisk na danym ekranie.
  const przyciskRef = useRef<HTMLAnchorElement | null>(null);
  const [szerokoscSlonecznika, setSzerokoscSlonecznika] = useState(0);

  useEffect(() => {
    const zmierz = () => {
      const w = przyciskRef.current?.getBoundingClientRect().width;
      if (!w) return;
      const docelowaSrednicaDziury = w + 2 * ODSTEP_OD_PLATKOW;
      setSzerokoscSlonecznika(
        Math.round(docelowaSrednicaDziury * (SLONECZNIK_SZEROKOSC / (2 * SLONECZNIK_PROMIEN_DZIURY)) * POWIEKSZENIE)
      );
    };
    zmierz();
    const ro = new ResizeObserver(zmierz);
    if (przyciskRef.current) ro.observe(przyciskRef.current);
    window.addEventListener("resize", zmierz);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", zmierz);
    };
  }, []);

  return (
    // overflow-hidden: grafika bywa znacznie większa niż sama karta (żeby
    // dziura w środku pomieściła przycisk z zapasem) - to, co by z niej
    // wystawało poza ramkę, ma zostać przycięte, a nie powiększać karty.
    // z-0 obok relative jest KONIECZNE, nie kosmetyczne: samo `relative` nie
    // tworzy nowego kontekstu warstwowania, więc ujemny z-index grafiki
    // (patrz niżej) odnosiłby się do najbliższego PRZODKA, który go tworzy -
    // czyli w praktyce malowałby się POD białym tłem tej karty, a nie nad
    // nim. Dopiero `relative` + `z-index` razem izolują warstwy wewnątrz
    // samej karty.
    <div className="relative z-0 overflow-hidden rounded-3xl bg-sr-white border border-sr-line p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
      <div>
        <span className="text-base sm:text-lg font-bold uppercase tracking-[0.18em] text-sr-red mb-2 block">
          Zapisany?
        </span>
        <p className="text-sm sm:text-base text-[#183153] font-bold">
          Zaproś rodzinę i znajomych do wzięcia udziału w biegu Sun Run i otrzymaj nagrodę w dniu biegu!
          <br />
          Na tych, którzy zrekrutują największą liczbę biegaczy, czekają nagrody specjalne!
        </p>
      </div>
      {/* Kontener bez własnego z-index - grafika dostaje z-index ujemny, więc
          zgodnie z kolejnością warstw CSS (ujemny z-index < statyczna treść
          w normalnym przepływie) automatycznie renderuje się POD tekstem i
          POD przyciskiem, mimo że oba nie mają własnego z-index. */}
      <div className="relative shrink-0">
        {szerokoscSlonecznika > 0 && (
          <img
            src="/slonecznik-duzy-transparent.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              width: szerokoscSlonecznika,
              height: szerokoscSlonecznika,
              // -50% centruje GEOMETRYCZNY srodek obrazka na przycisku; dodatkowy
              // px-owy przesuw doklada roznice miedzy tym srodkiem a prawdziwym
              // srodkiem dziury (patrz stale SLONECZNIK_SRODEK_DZIURY_* wyzej),
              // skalowana razem z wyswietlanym rozmiarem obrazka.
              transform: `translate(calc(-50% + ${(SLONECZNIK_SZEROKOSC / 2 - SLONECZNIK_SRODEK_DZIURY_X) * (szerokoscSlonecznika / SLONECZNIK_SZEROKOSC)}px), calc(-50% + ${(SLONECZNIK_WYSOKOSC / 2 - SLONECZNIK_SRODEK_DZIURY_Y) * (szerokoscSlonecznika / SLONECZNIK_SZEROKOSC)}px))`,
            }}
            // max-w-none: Tailwind daje wszystkim <img> domyślnie max-width:100%
            // liczone od kontenera (tu: wąskiego, mierzonego na szerokość
            // przycisku), więc bez tego szerokość obcinała się do jego
            // rozmiaru, a wysokość - bez analogicznego max-height - już nie.
            // Efekt: grafika renderowała się rozciągnięta, nie kwadratowa.
            className="absolute top-1/2 left-1/2 -z-10 max-w-none opacity-30 pointer-events-none select-none"
          />
        )}
        <Link
          ref={przyciskRef}
          href="/zaproszenie"
          className="cursor-target relative px-8 py-3.5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all shadow-lg hover:-translate-y-0.5"
        >
          Zaproś znajomych
        </Link>
      </div>
    </div>
  );
}

export default ReferralPanel;
