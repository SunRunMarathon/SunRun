// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import StaggeredMenu from "./StaggeredMenu";
import { ShareModal, ShareIcon } from "./ShareModal";
import { POKAZ_PARTNEROW } from "@/flagi";
import { useIsMobile } from "@/hooks/useIsMobile";
import { trackSignupClick, trackSocialClick } from "@/lib/track-interaction";

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
 * ZAPISZ SIĘ (punkt 10 listy sztabu) wyróżnia się kolorem #F94C1F zamiast
 * granatu i prowadzi wprost do formularza FRS w nowej karcie.
 */

/**
 * Kliknięcie w boczne menu zamyka panel (patrz toggleMenu w onClick niżej).
 * StaggeredMenu na czas otwarcia panelu blokuje scroll strony przez
 * `position: fixed` na body, a przy zamknięciu PRZYWRACA dokładnie scrollY
 * sprzed otwarcia (StaggeredMenu.tsx, blokada scrolla pod panelem) - scroll
 * wywołany tutaj SYNCHRONICZNIE ginąłby więc natychmiast, nadpisany przez to
 * przywrócenie. Podwójny rAF odkłada faktyczne przewinięcie na klatkę PO tym,
 * jak efekt zamykający panel zdąży odpalić.
 *
 * `sekcjaId` to id elementu na stronie głównej; `null` oznacza scroll do
 * samej góry (dla "Strona główna" - tam nie ma jednego elementu docelowego).
 * Na innych podstronach element/scenariusz "juz na gorze" nie zachodzi, wiec
 * funkcja po prostu nie robi nic i zwykly href (np. "/") załatwia nawigację.
 */
const stworzPrzewinDoSekcji = (sekcjaId) => (e) => {
  if (sekcjaId) {
    const el = document.getElementById(sekcjaId);
    if (!el) return; // inna podstrona — zwykły odnośnik "/#..." załatwi sprawę
    e.preventDefault();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth" });
      });
    });
  } else {
    if (window.location.pathname !== "/") return; // inna podstrona — zwykła nawigacja na "/"
    e.preventDefault();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }
};

const przejdzDoGory = stworzPrzewinDoSekcji(null);
const przejdzDoFestiwalu = stworzPrzewinDoSekcji("o-festiwalu");
const przejdzDoHarmonogramu = stworzPrzewinDoSekcji("harmonogram");
const przejdzDoBiegu = stworzPrzewinDoSekcji("o-biegu");
const przejdzDoPartnerow = stworzPrzewinDoSekcji("partnerzy");

const items = [
  { label: "Strona główna", link: "/", ariaLabel: "Przejdź na stronę główną", onSelect: przejdzDoGory },
  { label: "O Festiwalu", link: "/#o-festiwalu", ariaLabel: "O Festiwalu Sun Run 2026", onSelect: przejdzDoFestiwalu },
  { label: "Harmonogram", link: "/#harmonogram", ariaLabel: "Harmonogram wydarzeń na scenie Sun Run 2026", onSelect: przejdzDoHarmonogramu },
  { label: "O Biegu", link: "/#o-biegu", ariaLabel: "Szczegóły biegu - dystans, trasa, limit czasu", onSelect: przejdzDoBiegu },
  {
    label: "Zaproś znajomych",
    link: "/zaproszenie",
    ariaLabel: "Zaproś znajomych na Sun Run 2026",
    // Jedyna pozycja w menu, ktora zwykle lamie sie na dwie linie - a przy
    // wspolnym line-height:1.5 (patrz StaggeredMenu.css, potrzebne dla
    // ogonka "ę" w "Zapisz się") odstep miedzy "Zaproś" i "znajomych" wyglada
    // nieproporcjonalnie duzo. Zmierzone metrykami czcionki LEMON MILK: ten
    // konkretny tekst (bez ogonkow - jedyny diakrytyk to akcent NAD "Ś") ma
    // margines nawet przy line-height 1.2 (limitujacy czynnik to miejsce nad
    // "Ś", nie pod zadna litera - w LEMON MILK "j"/"y" nie schodza ponizej
    // linii bazowej). 1.3 zostawia bezpieczny zapas (~3px) zamiast schodzic
    // do granicy.
    tightLineHeight: 1.3,
  },
  { label: "Archiwum", link: "/archiwum", ariaLabel: "Archiwum I edycji Sun Run 2025" },
  // Odfiltrowana razem z ukrytą sekcją — patrz POKAZ_PARTNEROW w src/flagi.ts.
  // Bez tego pozycja zostałaby w menu i prowadziła do kotwicy, której nie ma.
  { label: "Partnerzy", link: "/#partnerzy", ariaLabel: "Partnerzy i sponsorzy biegu", ukryjGdy: !POKAZ_PARTNEROW, onSelect: przejdzDoPartnerow },
  { label: "O nas", link: "/o-nas", ariaLabel: "O nas - organizatorzy Sun Run" },
  {
    label: "Zapisz się",
    link: "https://frslublin.pl/pl/app/races/sign_up_form/295",
    ariaLabel: "Zapisz się na Sun Run 2026 - formularz zapisów FRS",
    external: true,
    color: "#F94C1F",
    onSelect: () => trackSignupClick("navbar"),
  },
];

// Kolor przycisku "Menu" + symbolu "+" musi dzialac na DWOCH roznych tlach w
// stanie zamknietym: piaskowym tle strony (gora, header w pelni przezroczysty)
// i granatowym tle headera (po przescrollowaniu, patrz headerStyle nizej) - a
// zaden pojedynczy kolor z palety nie ma dobrego kontrastu na obu naraz
// (zmierzone: granat na piasku 9,5:1 - dobrze, ale granat na granacie to ~1:1;
// piasek na granacie 9,5:1 - dobrze, ale piasek na piasku to ~1:1). Kolor
// wiec PLYNNIE przechodzi granat->piasek w tym samym tempie co samo tlo
// headera (logoOpacity), zamiast przeskakiwac skokowo.
function mieszajKolory(hexA: string, hexB: string, t: number) {
  const parsuj = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = parsuj(hexA);
  const [r2, g2, b2] = parsuj(hexB);
  const mieszaj = (a: number, b: number) => Math.round(a + (b - a) * t);
  const skladowa = (v: number) => v.toString(16).padStart(2, "0");
  return `#${skladowa(mieszaj(r1, r2))}${skladowa(mieszaj(g1, g2))}${skladowa(mieszaj(b1, b2))}`;
}

const socialItems = [
  {
    label: "Instagram",
    link: "https://www.instagram.com/sunrun.lublin/",
    icon: "instagram",
    onClick: () => trackSocialClick("instagram"),
  },
  {
    label: "Facebook",
    link: "https://www.facebook.com/sun.run.charytatywny/",
    icon: "facebook",
    onClick: () => trackSocialClick("facebook"),
  },
  {
    label: "TikTok",
    link: "https://www.tiktok.com/@sun.run_",
    icon: "tiktok",
    onClick: () => trackSocialClick("tiktok"),
  },
];

// Proporcje logo skróconego, zmierzone z wektora (870.228 × 518.490).
// 52px daje obszar kliknięcia 87×52 — obie krawędzie powyżej zalecanego
// minimum 44px dla celu dotykowego. Przy 36px było 60×36, czyli za mało.
const LOGO_H = 52;
const LOGO_W = Math.round((LOGO_H * 870.228) / 518.49); // 87px

// Wysokość paska nawigacji - JEDNA stała, którą StaggeredMenu przekazuje dalej
// jako --sr-navbar-h (patrz navbarHeight w StaggeredMenu.tsx). Ustawia zarówno
// realną wysokość samego nagłówka, jak i górny padding panelu bocznego, więc
// nic nie skacze między "zamknięte" a "otwarte" ani między stronami.
const NAVBAR_H = 100;

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

  // Chowanie paska na mobile: znika przy scrollu w dol, wraca natychmiast przy
  // scrollu w gore, zawsze widoczny na samej gorze. Prog 24px na kazdym etapie
  // ("czy jestesmy na gorze" i "czy ruch byl wystarczajaco duzy") eliminuje
  // migotanie przy drobnych drganiach palca - klasyczny blad tego wzorca.
  const isMobile = useIsMobile();
  const [scrollHidden, setScrollHidden] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setScrollHidden(false);
      return;
    }
    const THRESHOLD = 24;
    let lastY = window.scrollY;
    let ticking = false;

    const measure = () => {
      ticking = false;
      const currentY = window.scrollY;
      if (currentY < THRESHOLD) {
        setScrollHidden(false);
        lastY = currentY;
        return;
      }
      const diff = currentY - lastY;
      if (Math.abs(diff) < THRESHOLD) return;
      setScrollHidden(diff > 0);
      lastY = currentY;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  // Stopka na mobile zajmuje caly ekran i ma wlasne logo - dublowanie paska
  // nawigacji nie ma sensu, wiec znika calkowicie, dopoki stopka jest widoczna.
  // IntersectionObserver zamiast sztywnego progu w pikselach, bo wysokosc
  // stopki zmienia sie wraz z trescia.
  useEffect(() => {
    if (!isMobile) {
      setFooterVisible(false);
      return;
    }
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [isMobile]);

  const headerHidden = isMobile && (footerVisible || scrollHidden);

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
      navbarHeight={NAVBAR_H}
      headerHidden={headerHidden}
      // Tło nagłówka pojawia się dopiero razem z logo w rogu (ten sam
      // logoOpacity) - u góry strony, nad hero, header ma zostać w pełni
      // przezroczysty jak dotychczas. Gdy logo jest już widoczne (przewinięte
      // w głąb strony), header dostaje granatowe, rozmyte tło w tym samym
      // tempie co samo logo - inaczej przy scrollu w górę nagłówek potrafi
      // wrócić dokładnie nad nagłówkiem sekcji i wizualnie się z nim zlać
      // (zgłoszone jako "logo nachodzi na O BIEGU"). Granat (#183153) to ten
      // sam kolor co tło stopki - stąd też piaskowy wariant logo i piaskowy
      // (nie granatowy) kolor przycisku menu poniżej, żeby całość czytała się
      // jak ten sam, spójny motyw co stopka.
      headerStyle={{
        backgroundColor: `rgba(24, 49, 83, ${logoOpacity * 0.9})`,
        backdropFilter: logoOpacity > 0.05 ? "blur(10px)" : "none",
        WebkitBackdropFilter: logoOpacity > 0.05 ? "blur(10px)" : "none",
      }}
      items={items.filter((it) => !it.ukryjGdy)}
      socialItems={socialItems}
      displaySocials
      // Ten sam <ShareModal/> co w stopce (patrz footer.tsx) - inny wyzwalacz
      // (4. ikona w rzedzie Znajdz nas zamiast napisu z ikonka), ale
      // identyczne zachowanie po kliknieciu, bo to dokladnie ten sam
      // komponent. Klasy jak przy pozostalych ikonach (--icon: padding/cel
      // dotykowy), --share nadpisuje tylko kolor na czarny.
      shareNode={
        <ShareModal
          trigger={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              aria-label="Udostępnij Sun Run"
              className="sm-socials-link sm-socials-link--icon sm-socials-link--share"
            >
              <ShareIcon size={40} />
            </button>
          )}
        />
      }
      displayItemNumbering={false}
      colors={["#F94C1F", "#183153"]}
      accentColor="#FE8004"
      // Zamkniete: granat->piasek razem z logoOpacity (patrz komentarz przy
      // mieszajKolory). Otwarte: zawsze granat - panel ma biale tlo (13,1:1),
      // gdzie ani granat u gory strony, ani piasek po przescrollowaniu nie
      // maja szans wygrac z tym jednym, stalym wyborem.
      menuButtonColor={mieszajKolory("#183153", "#F4D8A2", logoOpacity)}
      openMenuButtonColor="#183153"
      changeMenuColorOnOpen
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
          src="/logo/sunrun-skrocone-piaskowe.svg"
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
