// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import StaggeredMenu from "./StaggeredMenu";

/**
 * Pozycje menu bocznego.
 *
 * Trzy z nich prowadzą do sekcji na stronie głównej (przewinięcie), a nie do
 * podstron — stąd zapis "/#kotwica". Działa też z podstron: przenosi na stronę
 * główną i przewija do właściwego miejsca.
 *
 * "Strona główna" celowo dubluje funkcję logo w lewym górnym rogu. Nie każdy
 * użytkownik wie, że w logo kryje się odnośnik, a powrót na stronę główną ma być
 * oczywisty.
 *
 * UWAGA: pozycja ZAPISZ SIĘ została stąd usunięta zgodnie z ustalonym składem.
 * Punkt 10 listy sztabu przewiduje ją jako element oddzielony graficznie od
 * odnośników — do zrobienia osobno. Do tego czasu zapisy są dostępne przez
 * przycisk w hero i dolny pasek.
 */
const items = [
  { label: "Strona główna", link: "/", ariaLabel: "Przejdź na stronę główną" },
  { label: "O Festiwalu", link: "/#o-festiwalu", ariaLabel: "O Festiwalu Sun Run 2026" },
  { label: "O Biegu", link: "/#o-biegu", ariaLabel: "Szczegóły biegu — dystans, trasa, limit czasu" },
  { label: "Archiwum", link: "/archiwum", ariaLabel: "Archiwum I edycji Sun Run 2025" },
  { label: "Partnerzy", link: "/#partnerzy", ariaLabel: "Partnerzy i sponsorzy biegu" },
  { label: "O nas", link: "/o-nas", ariaLabel: "O nas — organizatorzy Sun Run" },
];

const socialItems = [
  { label: "Instagram", link: "https://instagram.com/sunrunlublin" },
  { label: "Facebook", link: "https://facebook.com/sunrunlublin" },
  { label: "TikTok", link: "https://tiktok.com/@sunrunlublin" },
];

// Proporcje logo skróconego, zmierzone z wektora (870.228 × 518.490).
// 52px daje obszar kliknięcia 87×52 — obie krawędzie powyżej zalecanego
// minimum 44px dla celu dotykowego. Przy 36px było 60×36, czyli za mało.
const LOGO_H = 52;
const LOGO_W = Math.round((LOGO_H * 870.228) / 518.49); // 87px

// Ile pikseli scrolla zajmuje narastanie logo w rogu, licząc od momentu, w którym
// duże logo hero całkowicie zniknie z ekranu. Zwiększ, żeby pojawiało się wolniej
// i później; zmniejsz, żeby szybciej.
const FADE_DISTANCE = 160;

/**
 * Nagłówek z logo w lewym górnym rogu (pozycja nr 1).
 *
 * Pole ochronne wg księgi znaku: z każdej strony tyle, ile wynosi wysokość litery
 * "U" w napisie SUN RUN. Zmierzone z wektora: 146 / 870.228 = 16.8% szerokości logo
 * (zgadza się z przykładem z księgi: 8.4mm dla logo o szerokości 50mm).
 * Przy LOGO_H = 52px daje to 87px × 0.168 ≈ 15px odstępu.
 * Nagłówek ma padding 1.5em (24px) na telefonie i 2em (32px) na desktopie, czyli
 * powyżej wymaganych 15px — pole ochronne od krawędzi ekranu jest zachowane.
 * Zmieniając LOGO_H sprawdź, czy 0.168 × LOGO_W nadal mieści się w paddingu
 * nagłówka (.staggered-menu-header w StaggeredMenu.css). Przy LOGO_H powyżej
 * ~80px pole ochronne przekroczy 24px paddingu na telefonie i trzeba będzie
 * zwiększyć padding nagłówka.
 *
 * @param revealOnScroll — gdy true (strona główna), logo jest ukryte tak długo, jak
 *   choć fragment dużego logo hero (#hero-logo) jest widoczny na ekranie. Dopiero
 *   gdy hero zniknie całkowicie, małe logo narasta płynnie na przestrzeni
 *   FADE_DISTANCE pikseli scrolla. Na podstronach zostaw false — logo widoczne od razu.
 */
export function Navbar({ revealOnScroll = false }) {
  const [logoOpacity, setLogoOpacity] = useState(revealOnScroll ? 0 : 1);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!revealOnScroll) {
      setLogoOpacity(1);
      return;
    }

    const hero = document.getElementById("hero-logo");
    if (!hero) {
      // Brak dużego logo na tej stronie — pokazujemy małe od razu.
      setLogoOpacity(1);
      return;
    }

    const measure = () => {
      rafRef.current = 0;
      // Odległość, o jaką dolna krawędź dużego logo zjechała ponad górę ekranu.
      // <= 0 → część dużego logo jest jeszcze widoczna, małe ma być niewidoczne.
      const past = -hero.getBoundingClientRect().bottom;
      setLogoOpacity(Math.max(0, Math.min(1, past / FADE_DISTANCE)));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [revealOnScroll]);

  return (
    <StaggeredMenu
      position="right"
      isFixed
      items={items}
      socialItems={socialItems}
      displaySocials
      displayItemNumbering={false}
      colors={["#F94C1F", "#183153"]}
      accentColor="#FE8004"
      menuButtonColor="#183153"
      openMenuButtonColor="#183153"
      changeMenuColorOnOpen={false}
      // Gdy logo jest niewidoczne, wyłączamy też klikalność — inaczej w rogu strony
      // głównej zostawałby niewidoczny odnośnik przechwytujący kliknięcia.
      logoStyle={{
        opacity: logoOpacity,
        pointerEvents: logoOpacity < 0.05 ? "none" : "auto",
      }}
      logoNode={
        // <img> w <a> daje prostokątny obszar klikalny, więc kliknięcie
        // w przezroczyste miejsca między literami też prowadzi na stronę główną.
        <img
          src="/logo/sunrun-skrocone.svg"
          alt="Sun Run"
          width={LOGO_W}
          height={LOGO_H}
          style={{ height: LOGO_H, width: "auto", display: "block" }}
          draggable={false}
        />
      }
    />
  );
}
