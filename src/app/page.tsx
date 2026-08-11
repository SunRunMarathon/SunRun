// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { POKAZ_PARTNEROW } from "@/flagi";
import SurveyPopup, { OPEN_SURVEY_EVENT, ANSWERED_KEY, SURVEY_ANSWERED_EVENT } from "@/components/SurveyPopup";
import { FaqSection } from "@/components/FaqSection";
import { ReferralPanel } from "@/components/ReferralPanel";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SECTION_GAP } from "@/lib/layout";
import { TIERS, getActiveTierIndex } from "@/lib/pricing";
import { trackSignupClick } from "@/lib/track-interaction";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });
// gsap i cala logika sledzenia myszy w TargetCursor sa bezuzyteczne na dotyku —
// dynamic + ssr:false, zeby ten kod w ogole nie trafial do bundle'a mobile
// (komponent i tak renderuje null na mobile, ale bez tego jego JS nadal by
// sie pobieral i parsowal).
const TargetCursor = dynamic(() => import("@/components/TargetCursor"), { ssr: false });
// Stack (przeciagalna talia zdjec) uzywa Framer Motion do fizyki przeciagania
// i tak dobrze nie widac tego efektu na waskim ekranie - na mobile w ogole
// nie ladujemy tego komponentu (patrz rendering nizej: prosta siatka zamiast).
const Stack = dynamic(() => import("@/components/Stack"), { ssr: false });

// Zdjęcia-wspomnienia z I edycji do komponentu Stack (sekcja „Wspomnienia").
// Karty 1 i 3 były zastępnikami i poszły do kosza: pierwsza to generyczna
// grafika stockowa z angielskimi numerami startowymi („RUN FOR HOPE"),
// trzecia — zdjęcie z Adobe Stock z widocznym znakiem wodnym, czyli coś,
// co nie miało prawa stać na publicznej stronie. W ich miejsce prawdziwe
// kadry z I edycji, przycięte do kwadratu pod karty komponentu.
const STACK_CARDS = [
  { id: 1, img: "/photos/2025/stos-start.webp", alt: "Start I edycji Sun Run 2025" },
  { id: 2, img: "/photos/ekipa.webp", alt: "Ekipa Sun Run 2025" },
  { id: 3, img: "/photos/2025/stos-trasa.webp", alt: "Uczestnicy na trasie w Parku Ludowym" },
  { id: 4, img: "/photos/uniwersytet-jazdy.webp", alt: "Partner Uniwersytet Jazdy" },
];

// Potwierdzeni partnerzy 2026 - wprost z arkusza sztabu "Nasi potwierdzeni
// sponsorzy". Loga leżą w public/partners/, wszystkie przycięte do tej samej
// wysokości źródłowej (420px), więc w CSS wystarcza jedna wysokość na
// wszystkie, żeby wyszły optycznie wyrównane mimo różnych proporcji.
// Adresy stron - tylko te, co do których nie ma wątpliwości (sprawdzone
// wyszukiwaniem/bezpośrednim odczytem), nie zgadywane.
const MEDIA_PATRONI = [
  { name: "TVP3 Lublin", file: "tvp3-lublin.png", w: 703, h: 420, url: "https://lublin.tvp.pl" },
  { name: "Radio Lublin", file: "radio-lublin.png", w: 2313, h: 420, url: "https://radio.lublin.pl" },
  { name: "Radio Free", file: "radio-free.png", w: 714, h: 420, url: "https://radiofreee.pl" },
  { name: "Dziennik Wschodni", file: "dziennik-wschodni.png", w: 1438, h: 420, url: "https://dziennikwschodni.pl" },
  { name: "Kurier Lubelski", file: "kurier-lubelski.png", w: 1184, h: 420, url: "https://kurierlubelski.pl" },
];

const SPONSORZY = [
  { name: "Lubella", file: "lubella.png", w: 861, h: 420, url: "https://lubella.pl" },
];

export default function Home() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  // TargetCursor to czysta dekoracja bez sensu na dotyku — na mobile/
  // reduced-motion w ogóle jej nie renderujemy (patrz niżej).
  const disableDecorativeMotion = isMobile || prefersReducedMotion;

  // Steruje wyłącznie dolnym paskiem zapisów: true, gdy przycisk „Zapisz się"
  // spod logo wyjedzie poza górną krawędź ekranu.
  const [scrolled, setScrolled] = useState(false);
  const przyciskZapiszRef = useRef(null);
  const [ctaDismissed, setCtaDismissed] = useState(false);

  // Na telefonie tekst „O Festiwalu" startuje przycięty do kilku linijek
  // (jeden ciąg akapitów w jednej kolumnie, nie siatka 2x2 - ta zostaje tylko
  // od sm w górę) i rozwija się w całość po kliknięciu „Zobacz więcej".
  const [festiwalRozwiniety, setFestiwalRozwiniety] = useState(false);

  // Stan przycisku ankiety w hero — czyta ten sam klucz localStorage co sam
  // popup, plus nasłuchuje SURVEY_ANSWERED_EVENT, żeby przełączyć się od razu
  // po wysłaniu odpowiedzi, bez czekania na przeładowanie strony.
  const [ankietaOdpowiedziana, setAnkietaOdpowiedziana] = useState(false);
  useEffect(() => {
    setAnkietaOdpowiedziana(window.localStorage.getItem(ANSWERED_KEY) === "1");
    const onAnswered = () => setAnkietaOdpowiedziana(true);
    window.addEventListener(SURVEY_ANSWERED_EVENT, onAnswered);
    return () => window.removeEventListener(SURVEY_ANSWERED_EVENT, onAnswered);
  }, []);

  const wspomnieniaRef = useRef(null);

  // Rozmiar kart w stosie „Wspomnienia". Stack dostaje szerokość w pikselach,
  // a sztywne 380px nie mieściło się w kolumnie: na telefonie rozpychało ścieżkę
  // siatki ponad ekran (przy 320px stos był ucinany o 60px, a razem z nim
  // wyjeżdżał nagłówek, bo dziedziczył szerokość po tej samej ścieżce),
  // a przy ~820px, gdzie siatka ma już dwie kolumny, stos wychodził w prawo.
  const siatkaWspomnienRef = useRef(null);
  const [rozmiarKarty, setRozmiarKarty] = useState(380);

  useEffect(() => {
    const dopasuj = () => {
      const siatka = siatkaWspomnienRef.current;
      if (!siatka) return;
      // clientWidth siatki jest bezpieczne: kontener ma w-full + max-width, więc
      // jego pudełko wyznacza rodzic, nawet gdy ścieżki wewnątrz się rozpychają.
      // Liczby ścieżek NIE bierzemy z ich rozmiarów (te bywają już rozepchane),
      // tylko z liczby wartości w gridTemplateColumns.
      const cs = getComputedStyle(siatka);
      const ile = cs.gridTemplateColumns.split(/\s+/).filter(Boolean).length || 1;
      const odstep = parseFloat(cs.columnGap) || 0;
      const kolumna = (siatka.clientWidth - odstep * (ile - 1)) / ile;
      setRozmiarKarty(Math.max(220, Math.min(380, Math.floor(kolumna))));
    };
    dopasuj();
    const ro = new ResizeObserver(dopasuj);
    if (siatkaWspomnienRef.current) ro.observe(siatkaWspomnienRef.current);
    window.addEventListener("resize", dopasuj);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", dopasuj);
    };
  }, []);

  // ── Odstępy między sekcjami ──────────────────────────────────────────────
  // Jedna wartość na całą stronę: wysokość kafelka „Zapisanych uczestników"
  // z sekcji „O biegu". Kafelek ma 166px niezależnie od szerokości okna
  // (sprawdzone od 1920 do 390px), więc nadaje się na miarę odniesienia.
  // Sama liczba mieszka w src/lib/layout.ts (SECTION_GAP) - żeby komponenty
  // sekcji renderowane osobno (np. FaqSection.tsx) używały dokładnie tej
  // samej wartości, a nie własnych, ręcznie dobranych marginesów.
  const LUKA = SECTION_GAP;

  // Licznik "Zapisanych uczestników" - wpisywany ręcznie w /admin (FRS nie ma
  // publicznego API), strona tylko odczytuje ostatnią wartość.
  const [registeredCount, setRegisteredCount] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setRegisteredCount(data.registeredCount))
      .catch(() => {});
  }, []);

  // Aktualny próg minimalnej wpłaty (oś czasu w sekcji „O biegu") - liczony z
  // biezacej daty w efekcie, nie przy pierwszym renderze: serwer i klient
  // mogłyby przy odrobinie pecha wylosować inny dzień w okolicach północy i
  // React zgłosiłby niezgodność hydracji. Pierwsza klatka po obu stronach jest
  // identyczna (bez podświetleń), właściwy stan doskakuje chwilę później.
  const [aktualnyProg, setAktualnyProg] = useState(null);
  useEffect(() => {
    setAktualnyProg(getActiveTierIndex(new Date()));
  }, []);

  // Mapa w sekcji „O biegu" ma sięgać spodem do spodu ostatniej karty w prawej
  // kolumnie (Dane / Minimalna wpłata / Licznik zapisanych). Mierzymy kolumnę,
  // nie na odwrót: karty mają wysokość z treści, mapa nie ma żadnej — więc
  // pomiar jest jednokierunkowy, bez pętli. Tylko na siatce dwukolumnowej
  // (lg+) — poniżej mapa i karty stoją jedna pod drugą, dopasowanie nie ma
  // tam sensu, więc wraca się do zwykłych klas Tailwinda (null).
  const prawaKolumnaRef = useRef(null);
  const [wysokoscMapy, setWysokoscMapy] = useState(null);
  useEffect(() => {
    const zmierz = () => {
      const kolumna = prawaKolumnaRef.current;
      if (!kolumna || window.innerWidth < 1024) {
        setWysokoscMapy(null);
        return;
      }
      setWysokoscMapy(Math.round(kolumna.getBoundingClientRect().height));
    };
    zmierz();
    const ro = new ResizeObserver(zmierz);
    if (prawaKolumnaRef.current) ro.observe(prawaKolumnaRef.current);
    window.addEventListener("resize", zmierz);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", zmierz);
    };
  }, []);

  // Dolny odstęp sekcji „Wspomnienia". Liczony od przycisku „Odwiedź Archiwum",
  // a nie od dołu sekcji: stos zdjęć obok sięga niżej niż przycisk, więc zwykły
  // padding dałby lukę mierzoną od zdjęć. Sztab chce ją mierzyć od przycisku
  // i zignorować, że zdjęcia podejdą bliżej stopki.
  const przyciskArchiwumRef = useRef(null);
  const [dolWspomnien, setDolWspomnien] = useState(LUKA);

  useEffect(() => {
    const policz = () => {
      const sekcja = wspomnieniaRef.current;
      const przycisk = przyciskArchiwumRef.current;
      const siatka = siatkaWspomnienRef.current;
      if (!sekcja || !przycisk || !siatka) return;

      // Gdy siatka zwinie się do jednej kolumny, zdjęcia nie stoją już OBOK
      // przycisku, tylko POD nim — i to one są ostatnim elementem sekcji.
      // Mierzenie luki od przycisku znaczyłoby wtedy, że stopka wchodzi na
      // zdjęcia, więc w tym układzie wracamy do zwykłego odstępu od dołu.
      const kolumn = getComputedStyle(siatka).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
      if (kolumn < 2) {
        setDolWspomnien(LUKA);
        return;
      }

      const cs = getComputedStyle(sekcja);
      const dolTresci = sekcja.getBoundingClientRect().bottom - parseFloat(cs.paddingBottom);
      const nadmiar = dolTresci - przycisk.getBoundingClientRect().bottom;
      setDolWspomnien(Math.max(0, Math.round(LUKA - nadmiar)));
    };
    policz();
    const ro = new ResizeObserver(policz);
    if (wspomnieniaRef.current) ro.observe(wspomnieniaRef.current);
    window.addEventListener("resize", policz);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", policz);
    };
  }, []);

  const festiwal = (
    // scroll-mt-28: odsuwa nagłówek spod logo w rogu, żeby po skoku z menu
    // logo było nad nim, a nie na nim.
    <div id="o-festiwalu" className="scroll-mt-28">
      <h2 className="text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-5">
        O Festiwalu
      </h2>
      {/* Data doszła tutaj z pola pod logo — stąd też jest pierwsza w wierszu,
          przed godziną, tak jak w usuniętym miejscu.
          Godzina 16:00 to OTWARCIE FESTIWALU, nie start biegu (18:30) —
          patrz AGENTS.md. Sam bieg ma własną godzinę w sekcji „O biegu". */}
      <div className="flex flex-wrap items-center gap-3 pb-5 mb-5 border-b border-sr-line text-sm sm:text-base font-extrabold uppercase tracking-[0.18em] text-[#183153]">
        <span>12 września 2026</span>
        <span aria-hidden="true" className="text-sr-red">|</span>
        <span>16:00</span>
        <span aria-hidden="true" className="text-sr-red">|</span>
        <span>Park Ludowy w Lublinie</span>
      </div>

      {/* Kostka 2x2: zawsze dokladnie dwie kolumny (grid-cols-2, nie auto-fit) -
          gora: wstep + atmosfera, dol: Glowny punkt + Ubierz sie na zolto.
          Wypelnia cala szerokosc rodzica (max-w-[88rem] mx-auto, ten sam
          kontener co reszta sekcji strony) - od lewego do prawego marginesu. */}
      <div className="hidden sm:grid grid-cols-2 gap-x-10 gap-y-5 text-sm sm:text-base text-[#183153] leading-relaxed">
        <p>
          Wyobraź sobie wrześniowe popołudnie pełne muzyki, uśmiechu i dobrej energii. Miejsce,
          gdzie możesz spotkać się z przyjaciółmi, poznać nowych ludzi i wspólnie zrobić coś
          dobrego. Tak właśnie wyglądać będzie Sun Run 2026 - wydarzenie charytatywne, którego
          celem jest wsparcie podopiecznych Hospicjum Dobrego Samarytanina w Lublinie.
        </p>
        <p>
          Na uczestników czekać będzie wyjątkowa atmosfera, muzyka, wiele atrakcji dla dzieci,
          młodzieży i dorosłych, strefa jedzenia oraz przestrzeń do wspólnego spędzenia czasu.
          Chcemy stworzyć miejsce, w którym radość, spotkania z innymi i pomaganie połączą się
          w jedno niezapomniane wydarzenie.
        </p>
        <p>
          Głównym punktem Sun Run będzie charytatywny bieg na 5 km. To wydarzenie dla każdego -
          niezależnie od kondycji i doświadczenia. Możesz pobiec, ale możesz również przejść
          całą trasę własnym tempem. Najważniejsze nie jest miejsce na mecie, ale wspólny cel
          i pomoc tym, którzy jej potrzebują.
        </p>
        <p>
          <span className="font-extrabold text-[#CE2F25]">Ubierz się na żółto</span> i razem sprawmy, aby Park Ludowy rozbłysnął kolorem słońca,
          nadziei i solidarności. Zabierz ze sobą rodzinę, przyjaciół i znajomych - spotkajmy
          się, poznajmy nowych ludzi i spędźmy ten dzień razem.
        </p>
      </div>

      <div className="sm:hidden text-sm text-[#183153] leading-relaxed">
        <div className={festiwalRozwiniety ? "space-y-4" : "space-y-4 line-clamp-6"}>
          <p>
            Wyobraź sobie wrześniowe popołudnie pełne muzyki, uśmiechu i dobrej energii. Miejsce, gdzie możesz spotkać się z przyjaciółmi, poznać nowych ludzi i wspólnie zrobić coś dobrego. Tak właśnie wyglądać będzie Sun Run 2026 - wydarzenie charytatywne, którego celem jest wsparcie podopiecznych Hospicjum Dobrego Samarytanina w Lublinie.
          </p>
          <p>
            Na uczestników czekać będzie wyjątkowa atmosfera, muzyka, wiele atrakcji dla dzieci, młodzieży i dorosłych, strefa jedzenia oraz przestrzeń do wspólnego spędzenia czasu. Chcemy stworzyć miejsce, w którym radość, spotkania z innymi i pomaganie połączą się w jedno niezapomniane wydarzenie.
          </p>
          <p>
            Głównym punktem Sun Run będzie charytatywny bieg na 5 km. To wydarzenie dla każdego - niezależnie od kondycji i doświadczenia. Możesz pobiec, ale możesz również przejść całą trasę własnym tempem. Najważniejsze nie jest miejsce na mecie, ale wspólny cel i pomoc tym, którzy jej potrzebują.
          </p>
          <p>
            <span className="font-extrabold text-[#CE2F25]">Ubierz się na żółto</span> i razem sprawmy, aby Park Ludowy rozbłysnął kolorem słońca, nadziei i solidarności. Zabierz ze sobą rodzinę, przyjaciół i znajomych - spotkajmy się, poznajmy nowych ludzi i spędźmy ten dzień razem.
          </p>
        </div>
        {!festiwalRozwiniety && (
          <button
            type="button"
            onClick={() => setFestiwalRozwiniety(true)}
            className="cursor-target cursor-pointer mt-3 flex flex-col items-center gap-0.5 mx-auto font-extrabold text-sr-red"
          >
            Zobacz więcej
            <ChevronDown className="w-6 h-6 animate-nudge-down" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <p className="mt-5 text-sm sm:text-base font-extrabold text-sr-red">
        Spotkajmy się dla Hospicjum! Razem możemy rozświetlić czyjś świat.
      </p>
    </div>
  );

  useEffect(() => {
    let rafId = 0;

    const measure = () => {
      rafId = 0;

      // Dolny pasek zapisów wchodzi dokładnie wtedy, gdy przycisk „Zapisz się"
      // spod logo wyjedzie górą poza ekran. Wcześniej był to próg ułamkowy
      // (38% wysokości okna), przez co pasek potrafił się pojawić, gdy przycisk
      // był jeszcze widoczny — dublował wtedy sam siebie.
      const przycisk = przyciskZapiszRef.current;
      setScrolled(przycisk ? przycisk.getBoundingClientRect().bottom < 0 : false);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="relative bg-sr-sand text-sr-navy overflow-x-hidden">
      {/* Na stronie głównej małe logo w rogu pojawia się dopiero, gdy duże
          logo hero zniknie z ekranu. Podstrony używają <Navbar /> bez tej flagi,
          więc mają logo widoczne od razu. */}
      <Navbar revealOnScroll />

      {!disableDecorativeMotion && (
        <TargetCursor
          spinDuration={3}
          hideDefaultCursor={true}
          parallaxOn={true}
          cursorColor="#183153"
          cursorColorOnTarget="#CE2F25"
          targetSelector=".cursor-target"
        />
      )}

      {/* ═══════════════════════════════════════════
          STICKY CTA — "Zapisz się" (pojawia się po scrollowaniu)
      ═══════════════════════════════════════════ */}
      <div
        // id obserwowany przez CookieConsent.tsx (IntersectionObserver): baner
        // cookies podnosi się TYLKO wtedy, gdy ten pasek faktycznie wjechał na
        // ekran (translate-y-0), zamiast mieć na stałe zarezerwowane miejsce
        // na wypadek scrolla - patrz komentarz w CookieConsent.tsx.
        id="sticky-signup-bar"
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
          scrolled && !ctaDismissed ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Pasek jest o połowę wyższy niż był (65 → 97px). Każdy wymiar, który
            składa się na tę wysokość, przemnożony przez 1,5 — dlatego wartości
            są nietypowe (18px zamiast 12, 21px zamiast 14): to nie skala
            Tailwinda, tylko dokładne 1,5× poprzednich liczb. Przy foncie podanym
            wprost trzeba też podać interlinię, bo arbitralny rozmiar jej nie
            ustawia, a to ona współtworzy wysokość przycisku. */}
        <div className="relative bg-sr-white border-t border-sr-line py-[1.125rem] pl-6 pr-14 sm:px-12 flex justify-center items-center gap-[1.875rem] shadow-2xl">
          <span className="text-[1.3125rem] text-[#3D4D65] hidden sm:block tracking-wide">
            Zapisz się na <span className="text-sr-red font-extrabold">II edycję Sun Run 2026!</span>
          </span>
          {/* px-6 poniżej sm: przy pełnym px-12 powiększony przycisk wchodził
              na krzyżyk zamykania na telefonach węższych niż 390px (przy 320px
              aż o 30px). Wysokość paska zostaje 1,5×, zwężamy tylko boki. */}
          <a
            href="https://frslublin.pl/pl/app/races/sign_up_form/295"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackSignupClick("sticky_bar")}
            className="cursor-target inline-flex items-center justify-center px-6 sm:px-12 py-[0.9375rem] bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-[1.3125rem]/[1.875rem] tracking-widest uppercase transition-all duration-200 shadow-lg hover:shadow-sr-orange/30"
          >
            Zapisz się →
          </a>
          <button
            type="button"
            onClick={() => setCtaDismissed(true)}
            aria-label="Zamknij pasek zapisów"
            className="cursor-target absolute right-3 top-1/2 -translate-y-1/2 w-[2.625rem] h-[2.625rem] flex items-center justify-center rounded-full text-[#3D4D65] hover:text-[#183153] hover:bg-black/5 transition-colors text-[1.875rem] leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <main>
      {/* ═══════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════ */}
      <section
        className="relative z-10 w-full px-6 sm:px-12 text-left select-none"
        style={{ paddingBottom: LUKA }}
      >
        <div className="max-w-[88rem] mx-auto w-full pt-24">
          {/* Logo obok tekstu, oba w jednym rzędzie od lewego do prawego
              marginesu (zamiast wąskiej kolumny z pustą przestrzenią po
              prawej) — czysty CSS flex, bez JS mierzącego sąsiada, więc bez
              migotania przy pierwszym renderze.
              id="hero-logo" — Navbar obserwuje ten element, by wiedzieć, kiedy
              pokazać małe logo w rogu. */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-x-16 gap-y-10 w-full">
            <h1 id="hero-logo" className="m-0 shrink-0">
              <img
                src="/logo/sunrun-pelne.svg"
                alt=""
                width={870}
                height={634}
                className="h-auto w-full max-w-[480px]"
                draggable={false}
              />
              {/* Logo samo w sobie nie niesie tekstu, a H1 to najważniejszy sygnał
                  tekstowy na stronie dla wyszukiwarek - bez tego jedyny "tekst" H1
                  to alt obrazka. sr-only: niewidoczne wizualnie (branding logo bez
                  zmian), ale czytane przez czytniki ekranu i indeksowane. */}
              <span className="sr-only">
                Sun Run Lublin - charytatywny festiwal i bieg na 5 km o zachodzie słońca w Parku Ludowym, 12 września 2026, na rzecz Hospicjum Dobrego Samarytanina
              </span>
            </h1>

            <p className="flex-1 text-lg sm:text-xl lg:text-2xl text-[#183153] leading-relaxed">
              Sun Run to charytatywny festiwal w Parku Ludowym w Lublinie, organizowany na rzecz
              Hospicjum Dobrego Samarytanina. Głównym punktem wydarzenia będzie{" "}
              <span className="font-extrabold">5-kilometrowy bieg o zachodzie słońca</span>, który
              możesz pokonać biegiem lub marszem. Załóż coś żółtego i zabierz ze sobą rodzinę,
              przyjaciół – tych nowych i tych, z którymi dawno nie rozmawiałeś. Spotkajmy się dla
              Hospicjum!
            </p>
          </div>

          {/* Przyciski w jednym rzędzie na tej samej szerokości co logo+tekst
              nad nimi (grid-cols-3, wysokość komórek wyrównana automatycznie
              przez grid) zamiast wąskiej kolumny pod logo. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 w-full pointer-events-auto">
            <a ref={przyciskZapiszRef} href="https://frslublin.pl/pl/app/races/sign_up_form/295" target="_blank" rel="noopener noreferrer"
              onClick={() => trackSignupClick("hero")}
              className="cursor-target inline-flex items-center justify-center px-8 py-5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0">
              Zapisz się
            </a>
            <button
              data-track-event="dowiedz_sie_wiecej_click"
              onClick={() => document.getElementById("o-festiwalu")?.scrollIntoView({ behavior: "smooth" })}
              className="cursor-target cursor-pointer inline-flex items-center justify-center px-8 py-5 border border-sr-line hover:border-sr-orange/60 bg-sr-white text-[#183153] font-black rounded-full text-lg tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5">
              Dowiedz się więcej
            </button>

            {/* Ankieta „Skąd o nas usłyszałaś/eś?" — popup otwiera się TYLKO na
                kliknięcie tego przycisku (patrz SurveyPopup.tsx — nie ma już
                samoczynnego wyskakiwania przy scrollu). Po odpowiedzi przycisk
                się dezaktywuje i blaknie na #3D4D65/#FBBA76.
                Aktywny wariant: granat #183153 z pomarańczowym tekstem #FE8004
                daje 5,2:1, czyli spełnia AA — to jedno z niewielu zestawień,
                w których pomarańcz wolno użyć jako koloru tekstu (patrz tabela
                w globals.css). */}
            <button
              type="button"
              data-track-event={ankietaOdpowiedziana ? undefined : "ankieta_open"}
              disabled={ankietaOdpowiedziana}
              onClick={() => window.dispatchEvent(new Event(OPEN_SURVEY_EVENT))}
              className={`inline-flex w-full items-center justify-center px-8 py-5 font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 ${
                ankietaOdpowiedziana
                  // cursor-none: bez tego przeglądarka pokazuje domyślny "not-allowed"
                  // nad zdezaktywowanym przyciskiem, a TargetCursor chowa słonko nad
                  // KAŻDYM elementem z własnym kursorem systemowym (patrz maWlasnyKursor
                  // w TargetCursor.tsx) — słonko znikałoby tu bez potrzeby.
                  ? "cursor-none bg-[#3D4D65] text-[#FBBA76]"
                  : "cursor-target cursor-pointer bg-sr-navy text-sr-orange shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {ankietaOdpowiedziana ? "Dziękujemy za odpowiedź!" : "Skąd o nas usłyszałaś/eś?"}
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          1.5. ZAPROŚ ZNAJOMEGO
      ═══════════════════════════════════════════ */}
      <section id="zaproszenie" className="relative z-10 w-full px-6 sm:px-12 scroll-mt-28" style={{ paddingBottom: LUKA }}>
        <div className="max-w-[88rem] mx-auto w-full">
          <ReferralPanel />
        </div>
      </section>

      {/* Sekcja „O Festiwalu" - ten sam wzorzec marginesów co reszta strony
          (px-6 sm:px-12 + max-w-[88rem] mx-auto, patrz "O biegu" niżej), a nie
          osobny wzorzec tylko dla hero. Ujednolicone, żeby cała strona - hero,
          festiwal, o biegu, partnerzy itd. - trzymała się dokładnie tego
          samego marginesu na każdej szerokości okna. */}
      <section
        className="relative z-10 w-full px-6 sm:px-12"
        style={{ paddingBottom: LUKA }}
      >
        <div className="max-w-[88rem] mx-auto w-full">{festiwal}</div>
      </section>

      {/* ═══════════════════════════════════════════
          2. STATS DASHBOARD — Mapa + Dane + Licznik
          (wszystkie widoczne naraz na ekranie)
      ═══════════════════════════════════════════ */}
      <section
        id="o-biegu"
        className="relative z-10 w-full px-6 sm:px-12 scroll-mt-28" style={{ paddingBottom: LUKA }}
      >
        <div className="max-w-[88rem] mx-auto w-full">
          {/* text-[1.75rem] = dokładnie dwukrotność poprzedniego text-sm (14px). */}
          <h2 className="text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-8">
            O biegu
          </h2>
          {/* Na desktopie mapa zajmuje dokładnie połowę szerokości (wcześniej 3/5),
              a kolumna z kartami drugą połowę — karty rozszerzyły się ku środkowi,
              więc odstęp między nimi a mapą został bez zmian. Na telefonie układ
              pozostaje jednokolumnowy, bo podział wchodzi dopiero od breakpointu lg. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* MAPA — połowa szerokości na desktopie. Wysokość z klas Tailwinda
                to tylko fallback (mobile/tablet, przed pomiarem) - na lg+
                nadpisuje ją wysokoscMapy (patrz efekt wyżej), żeby spód mapy
                dosięgał spodu ostatniej karty w prawej kolumnie. */}
            <div
              className="h-96 sm:h-[440px] lg:h-[620px] rounded-3xl overflow-hidden border border-sr-line bg-sr-white shadow-xl relative"
              style={wysokoscMapy ? { height: wysokoscMapy } : undefined}
            >
              <RouteMap />
              <div className="absolute bottom-4 left-4 bg-sr-white border border-sr-line rounded-xl z-[1000] px-4 py-2 text-xs text-[#3D4D65] pointer-events-none">
                Trasa · Park Ludowy, al. J. Piłsudskiego
              </div>
            </div>

            {/* DANE + LICZNIK — druga połowa szerokości */}
            <div ref={prawaKolumnaRef} className="flex flex-col gap-5">
              {/* Karta: Dane */}
              <div className="flex-1 rounded-3xl bg-sr-white border border-sr-line p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-4 block">
                  Dane
                </span>
                <div className="space-y-3">
                  {[
                    { label: "Godzina startu", value: "18:30" },
                    { label: "Dystans", value: "5 km (2 pętle)" },
                    { label: "Minimalny wiek", value: "14 lat" },
                    { label: "Limit czasu", value: "80 minut" },
                    { label: "Atest", value: "PZLA" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center border-b border-[rgb(24 49 83 / 0.14)] pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-[#3D4D65] uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-bold text-[#183153]">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Akapit uzupełniający tabelę — w tej samej karcie, oddzielony
                    linią, żeby było widać, że to osobna część. */}
                <div className="mt-5 pt-5 border-t border-[rgb(24 49 83 / 0.14)] text-sm text-[#3D4D65] leading-relaxed space-y-2">
                  <p>Czas biegu będzie mierzony specjalnymi opaskami.</p>
                  <p>
                    Uczestnicy będą rywalizować ze sobą w ośmiu kategoriach: generalnej kobiet
                    i mężczyzn oraz wiekowych kobiet i mężczyzn (14+, 30+, 50+).
                  </p>
                  <p>Biegacze będą mieli zapewnioną wodę pitną.</p>
                </div>
              </div>

              {/* Karta: Minimalna wpłata - kompaktowa oś czasu, nie osobna
                  sekcja na pół ekranu (poprzednia wersja była za duża - sztab
                  poprosił o przeniesienie tutaj, obok reszty danych o biegu).
                  Wartości progów trzymane w src/lib/pricing.ts (TIERS) - to
                  samo źródło zasila FAQ i offers w JSON-LD, więc kwoty i daty
                  w tych trzech miejscach zawsze się zgadzają. */}
              <div className="rounded-3xl bg-sr-white border border-sr-line p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-1 block">
                  Minimalna wpłata
                </span>
                <p className="text-xs text-[#3D4D65] leading-relaxed mb-4">
                  To darowizna z progiem minimalnym, nie cena biletu - możesz wpłacić więcej.
                </p>

                {/* Oś czasu: cienki pasek pod trzema progami, wypełniony do
                    aktywnego kroku. Czysto dekoracyjny (aria-hidden) - stan
                    każdego progu jest już jednoznacznie opisany słownie
                    (etykieta "Teraz" / "Zakończony"), nie samym kolorem. */}
                <div aria-hidden="true" className="h-1 rounded-full bg-sr-line mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sr-orange transition-[width] duration-700 ease-out"
                    style={{ width: aktualnyProg === null ? 0 : `${((aktualnyProg + 1) / TIERS.length) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {TIERS.map((tier, i) => {
                    const isActive = aktualnyProg === i;
                    const isPast = aktualnyProg !== null && i < aktualnyProg;
                    return (
                      <div
                        key={tier.id}
                        className={`rounded-xl border p-2.5 text-center ${
                          isActive
                            ? "bg-sr-white border-sr-orange"
                            : isPast
                              ? "bg-sr-sand/40 border-sr-line"
                              : "bg-sr-white border-sr-line"
                        }`}
                      >
                        <p className="text-lg font-black text-[#183153] leading-none">
                          {tier.amount}<span className="text-xs font-bold text-[#3D4D65]"> zł</span>
                        </p>
                        <p className="text-[10px] text-[#3D4D65] leading-tight mt-1">{tier.deadlineLabel}</p>
                        {isActive && (
                          <p className="text-[9px] font-black uppercase tracking-wider text-sr-orange mt-1">Teraz</p>
                        )}
                        {isPast && (
                          <p className="text-[9px] font-black uppercase tracking-wider text-sr-navy mt-1">Zakończony</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Karta: Licznik zapisanych */}
              <div className="rounded-3xl bg-sr-white border border-sr-orange/25 p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-3 block">
                  Zapisanych uczestników
                </span>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sr-navy to-sr-red leading-none">
                    {registeredCount ?? "–"}
                  </span>
                  <span className="text-[#3D4D65] text-sm pb-2">i rośnie!</span>
                </div>
                <p className="text-xs text-[#3D4D65] mt-3">
                  Aktualizowane ręcznie przez organizatorów
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. CEL CHARYTATYWNY — zwykła ramka

          Wcześniej była to sekcja z trzema kafelkami nasuwającymi się na siebie
          przy przewijaniu (ScrollStack). Efekt usunięty zgodnie z listą sztabu,
          a wraz z nim dwa kafelki: „Dołącz do ekipy" i „Współpraca". Został sam
          cel charytatywny, już jako zwykła ramka bez animacji.
      ═══════════════════════════════════════════ */}
      {/* Kontener celowo taki sam jak w sekcji „O biegu" powyżej
          (max-w-[88rem] + px-6 sm:px-12), żeby lewa krawędź ramki pokrywała się
          z lewą krawędzią mapy, a prawa z prawą krawędzią karty „Zapisanych
          uczestników". Wcześniej sekcja miała własny, węższy kontener
          (max-w-[1200px] + px-8 sm:px-16) i ramka była wciśnięta o 136px z każdej
          strony przy 1440px. */}
      <section className="relative z-10 w-full px-6 sm:px-12">
        <div className="max-w-[88rem] mx-auto pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#3D4D65]">Dowiedz się więcej</span>
            <div className="h-px flex-1 bg-sr-line" />
          </div>
        </div>

        <div className="max-w-[88rem] mx-auto" style={{ paddingBottom: LUKA }}>
          <div className="rounded-3xl bg-[#FFFFFF] border border-sr-line text-[#183153] p-8 sm:p-10 shadow-lg">
            {/* Dwie równe kolumny: tekst po lewej, zdjęcie po prawej — każda po
                połowie szerokości ramki.

                Szerokość jest PROPORCJONALNA (grid-cols-2), nie podana w pikselach.
                Wcześniejsza wersja miała sztywne 720px na kolumnę zdjęcia i przez to
                wychodziła poza ramkę na wszystkim węższym niż ~1300px. Układ pionowy,
                który to naprawiał, dawał z kolei ramkę wysoką na ~970px, czyli
                niemieszczącą się na typowym ekranie. Ten wariant łączy jedno z drugim.

                Poniżej breakpointu md kolumny zwijają się do jednej i zdjęcie ląduje
                pod tekstem na pełną szerokość. */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div>
                  <span className="text-base sm:text-lg font-bold uppercase tracking-[0.18em] text-sr-red mb-2 block">Cel Charytatywny</span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sr-red to-sr-navy">
                    Hospicjum Dobrego Samarytanina
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[#183153] leading-relaxed">
                  Hospicjum Dobrego Samarytanina w Lublinie (ul. Bernardyńska 11A) otacza opieką
                  paliatywną
                  ok. <strong className="text-[#183153]">800 rodzin</strong> pacjentów z chorobami terminalnymi rocznie.
                  Środki zebrane podczas Sun Run przeznaczamy na specjalistyczny sprzęt medyczny
                  oraz doskonalenie warunków opieki.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-[#FFFFFF] border border-sr-line rounded-lg text-xs text-[#3D4D65]">
                    KRS: 0000 026 380
                  </div>
                  <div className="px-3 py-1.5 bg-[#FFFFFF] border border-sr-line rounded-lg text-xs text-[#3D4D65]">
                    ul. Bernardyńska 11A, Lublin
                  </div>
                </div>
                <a
                  href="https://hospicjum-samarytanin.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 border border-sr-red/40 hover:border-sr-red text-sr-red hover:text-sr-red font-semibold rounded-full text-sm tracking-wide transition-all duration-200 w-fit"
                >
                  Odwiedź stronę hospicjum →
                </a>
              </div>

              {/* Wysokość zdjęcia wynika z proporcji 3:2, a nie ze sztywnej wartości —
                  dzięki temu skaluje się razem z kolumną i nie ma jak wystawać. */}
              <div className="w-full aspect-[3/2] rounded-2xl overflow-hidden border border-sr-line">
                <img
                  src="/photos/hospicujm.webp"
                  alt="Hospicjum Dobrego Samarytanina w Lublinie"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. WSPOMNIENIA — zajawka archiwum + Stack zdjęć
      ═══════════════════════════════════════════ */}
      {/* Bez min-h-screen: sekcja miała wcześniej wymuszoną wysokość całego okna
          przy 428px treści, więc przy 1920×1080 zostawało w niej 652px pustki.
          Dolny odstęp liczy się od PRZYCISKU, nie od dołu sekcji — stos zdjęć
          sięga niżej niż przycisk, a sztab chce mierzyć lukę od przycisku
          i zignorować zdjęcia. */}
      <section
        ref={wspomnieniaRef}
        style={{ paddingBottom: dolWspomnien }}
        className="relative z-10 w-full flex items-center px-6 sm:px-12"
      >
        <div ref={siatkaWspomnienRef} className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Tekst + CTA */}
          <div className="@container space-y-6">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red block">
              Archiwum · I Edycja 2025
            </span>
            {/* Wielkość nagłówka liczona od szerokości KOLUMNY (cqw), nie okna.
                Na progach text-6xl/7xl/8xl „WSPOMNIENIA" nie mieściło się:
                na telefonie wyjeżdżało poza ekran, a od breakpointu md kolumna
                jest WĘŻSZA niż na telefonie (siatka dzieli się na dwie),
                więc napis wchodził na stos zdjęć obok. Próg oparty na
                szerokości okna nie mógł tego złapać, bo kolumna nie rośnie
                z oknem monotonicznie. */}
            <h2 className="text-[clamp(2rem,12cqw,6rem)] font-black uppercase text-[#183153] leading-none">
              Wspomnienia
            </h2>
            <p className="text-base sm:text-lg text-[#183153] leading-relaxed max-w-md">
              Ponad 350 uczestników, świetna atmosfera i realna pomoc dla hospicjum. Przeciągnij
              zdjęcia obok, a po podsumowanie edycji i galerię zajrzyj do archiwum.
            </p>
            <Link
              ref={przyciskArchiwumRef}
              href="/archiwum"
              className="cursor-target inline-flex items-center gap-2 px-9 py-4 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-base tracking-widest uppercase transition-all duration-300 shadow-lg hover:-translate-y-0.5"
            >
              Odwiedź Archiwum →
            </Link>
          </div>

          {/* Stack zdjęć — przeciągalny stos wspomnień. Na telefonie i tak nie
              widać dobrze efektu przekładania kart (Framer Motion drag), więc
              tam pokazujemy zamiast tego prostą, czytelną siatkę 2x2 tych
              samych zdjęć — bez ładowania biblioteki animacji w ogóle. */}
          {isMobile ? (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto py-6">
              {STACK_CARDS.map((card) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={card.id}
                  src={card.img}
                  alt={card.alt}
                  className="w-full aspect-square object-cover rounded-2xl border border-sr-line shadow-md"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center md:justify-end py-6">
              <Stack
                randomRotation
                sensitivity={150}
                sendToBackOnClick
                cardDimensions={{ width: rozmiarKarty, height: rozmiarKarty }}
                cardsData={STACK_CARDS}
              />
            </div>
          )}
        </div>
      </section>

      <FaqSection />

      {/* ═══════════════════════════════════════════
          5. PARTNERZY I PATRONI — tuż nad stopką (na życzenie Wiktora)
      ═══════════════════════════════════════════ */}
      {/* Dwie oddzielne grupy - patronat medialny i sponsorzy to różne role
          i media patronackie oczekują rozdzielenia. Loga NIE są kartami
          (jak we wcześniejszej, ukrytej wersji tej sekcji) - to cudze znaki
          towarowe, więc żadnych ramek/teł narzucanych na nie: stała wysokość
          w CSS (h-8/h-10) wyrównuje je optycznie mimo różnych proporcji
          źródłowych, a szerokość zostaje naturalna (w-auto + object-contain).
          width/height na <img> to realne wymiary plików w public/partners -
          zapobiega skokowi layoutu przed wczytaniem. */}
      {POKAZ_PARTNEROW && (
      <section id="partnerzy" className="relative z-10 w-full px-6 sm:px-12 scroll-mt-28" style={{ paddingBottom: LUKA }}>
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-10 space-y-4">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red">Wsparcie</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-[#183153]">
              Partnerzy i Patroni
            </h2>
          </div>
          <div className="rounded-3xl bg-white border border-sr-line shadow-lg p-8 sm:p-10 space-y-10">
            <div className="space-y-5">
              <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#3D4D65]">
                Patronat medialny
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
                {MEDIA_PATRONI.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-target block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/partners/${p.file}`}
                      alt={p.name}
                      width={p.w}
                      height={p.h}
                      className="h-8 sm:h-10 w-auto object-contain"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>

            <div className="h-px bg-sr-line" />

            <div className="space-y-5">
              <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#3D4D65]">
                Sponsorzy
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
                {SPONSORZY.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-target block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/partners/${p.file}`}
                      alt={p.name}
                      width={p.w}
                      height={p.h}
                      className="h-8 sm:h-10 w-auto object-contain"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
      </main>

      {/* ═══════════════════════════════════════════
          6. FOOTER
      ═══════════════════════════════════════════ */}
      <Footer />

      <SurveyPopup />
    </div>
  );
}
