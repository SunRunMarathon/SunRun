// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import TargetCursor from "@/components/TargetCursor";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import Stack from "@/components/Stack";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });
const MetaBalls = dynamic(() => import("@/components/MetaBalls"), { ssr: false });

// Zdjęcia-wspomnienia z I edycji do komponentu Stack (sekcja "Wspomnienia").
// Zastąp docelowymi fotografiami z biegu w /public/photos.
const STACK_CARDS = [
  { id: 1, img: "/sun_run_runners.webp", alt: "Biegacze Sun Run 2025" },
  { id: 2, img: "/photos/ekipa.webp", alt: "Ekipa Sun Run 2025" },
  { id: 3, img: "/photos/sztab.webp", alt: "Sztab i wolontariusze" },
  { id: 4, img: "/photos/uniwersytet-jazdy.webp", alt: "Partner Uniwersytet Jazdy" },
];

const PARTNERS = [
  { name: "DKMS", desc: "Rejestracja dawców szpiku", anchor: "dkms", color: "#CE2F25" },
  { name: "VIVO! Lublin", desc: "Partner strategiczny", anchor: "vivo", color: "#183153" },
  { name: "AS Babuni", desc: "Partner gastronomiczny", anchor: "as-babuni", color: "#CE2F25" },
  { name: "Datasport", desc: "Pomiar czasu i klasyfikacje", anchor: "datasport", color: "#183153" },
  { name: "UP Lublin", desc: "Patronat honorowy", anchor: "up-lublin", color: "#CE2F25" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);

  // "Magnes" — strzałkę można próbować odciągnąć, ale jest przyklejona: rusza się
  // tylko odrobinę (rubber-band z nasyceniem), a po puszczeniu sprężyście wraca.
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const [pulling, setPulling] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startY: 0 });

  const rubberBand = (v) => {
    const max = 28; // maks. wychylenie w px — magnes prawie nie puszcza
    return max * Math.tanh(v / (max * 2.4));
  };
  const onArrowPointerDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY };
    setPulling(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onArrowPointerMove = (e) => {
    if (!dragRef.current.active) return;
    setPull({
      x: rubberBand(e.clientX - dragRef.current.startX),
      y: rubberBand(e.clientY - dragRef.current.startY),
    });
  };
  const endArrowDrag = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setPulling(false);
    setPull({ x: 0, y: 0 }); // sprężysty powrót (transition na warstwie pull)
  };

  const wspomnieniaRef = useRef(null);
  const [returnProgress, setReturnProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      setScrolled(window.scrollY > vh * 0.38);
      // Postęp 0→1 w obrębie sekcji HERO — steruje animacją "łapiącej" strzałki
      setHeroProgress(Math.min(1, window.scrollY / (vh * 0.9)));

      // Postęp powrotu strzałki: rośnie, gdy sekcja "Wspomnienia" wjeżdża w ekran.
      // 0 gdy jej góra jest jeszcze poniżej dołu okna, 1 gdy dojdzie do ~40% wysokości.
      const el = wspomnieniaRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top;
        setReturnProgress(Math.max(0, Math.min(1, (vh - top) / (vh * 0.6))));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // FAZA 1 — Strzałka (fixed, przy hamburgerze) próbuje go "złapać": najpierw sięga
  // w górę i w prawo (reach), a pod koniec sekcji startowej poddaje się i całkowicie
  // znika (giveUp).
  const reach = Math.min(1, heroProgress / 0.72);
  const giveUp = Math.max(0, (heroProgress - 0.72) / 0.28);
  const heroTx = reach * 70 - giveUp * 24;
  const heroTy = -reach * 66 + giveUp * 170;
  const heroRot = reach * 8 + giveUp * 55;
  const heroScale = 1 + reach * 0.15 - giveUp * 0.3;
  const heroOpacity = Math.max(0, 1 - giveUp * 1.3); // pełne zniknięcie

  // FAZA 2 — Powrót przy "Wspomnieniach": strzałka zabawnie wpada z góry z obrotem
  // i znów zachęca do kliknięcia ("obejrzane? to teraz tutaj"). Ląduje w pozycji
  // BAZOWEJ (0,0) — czyli wskazuje hamburgera z dystansu, dokładnie jak górna poza,
  // a NIE wsuwa się pod niego. Tylko mniejsza.
  const ret = returnProgress;
  const retTx = (1 - ret) * 48;
  const retTy = (1 - ret) * -120;
  const retRot = (1 - ret) * 210; // pełen obrót do 0°
  const retScale = 0.5 + ret * 0.42; // ląduje na ~0.92 — mniejsza niż górna
  const retOpacity = Math.min(1, ret * 1.6);

  // Wybór aktywnej fazy — powrót ma priorytet, gdy tylko się zaczyna.
  const inReturn = ret > 0.01;
  const arrowTx = inReturn ? retTx : heroTx;
  const arrowTy = inReturn ? retTy : heroTy;
  const arrowRot = inReturn ? retRot : heroRot;
  const arrowScale = inReturn ? retScale : heroScale;
  const arrowOpacity = inReturn ? retOpacity : heroOpacity;
  const arrowText = pulling
    ? "zostaw!"
    : inReturn
    ? "obejrzane? to teraz tutaj!"
    : giveUp > 0.32
    ? "no dobra..."
    : reach > 0.5
    ? "prawie!"
    : "kliknij tutaj!";

  // Drganie: przy "wysilaniu się" (mocno sięga, jeszcze się nie poddała) LUB gdy
  // ktoś próbuje ją odciągnąć — wtedy magnes nerwowo drga.
  const isStraining = (!inReturn && reach > 0.7 && giveUp < 0.35) || pulling;

  return (
    <div className="relative bg-sr-sand text-sr-navy overflow-x-hidden">
      {/* Na stronie głównej małe logo w rogu pojawia się dopiero, gdy duże
          logo hero zniknie z ekranu. Podstrony używają <Navbar /> bez tej flagi,
          więc mają logo widoczne od razu. */}
      <Navbar revealOnScroll />

      <TargetCursor
        spinDuration={3}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#183153"
        cursorColorOnTarget="#FE8004"
        targetSelector=".cursor-target"
      />

      {/* ═══════════════════════════════════════════
          STICKY CTA — "Zapisz się" (pojawia się po scrollowaniu)
      ═══════════════════════════════════════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
          scrolled && !ctaDismissed ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="relative bg-sr-white border-t border-sr-line py-3 px-6 sm:px-12 flex justify-center items-center gap-5 shadow-2xl">
          <span className="text-sm text-[#3D4D65] hidden sm:block tracking-wide">
            Zapisz się na <span className="text-sr-red font-bold">II edycję Sun Run 2026!</span>
          </span>
          <a
            href="https://frslublin.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-target inline-flex items-center justify-center px-8 py-2.5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all duration-200 shadow-lg hover:shadow-sr-orange/30"
          >
            Zapisz się →
          </a>
          <button
            type="button"
            onClick={() => setCtaDismissed(true)}
            aria-label="Zamknij pasek zapisów"
            className="cursor-target absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[#3D4D65] hover:text-[#183153] hover:bg-black/5 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <main>
      {/* ═══════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full min-h-screen flex flex-col justify-center px-8 sm:px-16 md:px-28 text-left select-none">
        {/* MetaBalls — cała prawa połowa ekranu, od góry do dołu sekcji hero.
            Brak overflow:hidden — canvas zajmuje duży obszar, kulki naturalnie
            latają po całej prawej stronie i są widoczne bez ucięcia. */}
        <div
          className="absolute pointer-events-none hidden md:block"
          style={{
            top: 0,
            right: 0,
            width: "55vw",
            height: "100%",
            zIndex: 1,
          }}
        >
          <MetaBalls
            color1="#FE8004"
            color2="#CE2F25"
            speed={0.45}
            opacity={0.4}
            enableMouseInteraction={true}
          />
        </div>

        {/* "kliknij tutaj!" — zakrzywiona strzałka, która przy scrollu sięga w stronę
            hamburgera, próbując go "złapać", a pod koniec sekcji startowej poddaje się.
            POZYCJA FIXED — zostaje na ekranie zamiast odjeżdżać z sekcją hero. */}
        <div
          className="fixed top-24 right-28 hidden sm:flex flex-row items-end pointer-events-none"
          style={{
            zIndex: 40,
            transform: `translate(${arrowTx}px, ${arrowTy}px) rotate(${arrowRot}deg) scale(${arrowScale})`,
            transformOrigin: "bottom right",
            opacity: arrowOpacity,
            transition: "transform 0.12s ease-out, opacity 0.12s ease-out",
          }}
        >
          {/* Warstwa "pull" — łapie wskaźnik i pozwala próbować odciągnąć strzałkę.
              Rusza się minimalnie (rubber-band), a po puszczeniu sprężyście wraca. */}
          <div
            onPointerDown={onArrowPointerDown}
            onPointerMove={onArrowPointerMove}
            onPointerUp={endArrowDrag}
            onPointerCancel={endArrowDrag}
            style={{
              pointerEvents: arrowOpacity > 0.05 ? "auto" : "none",
              cursor: pulling ? "grabbing" : "grab",
              touchAction: "none",
              transform: `translate(${pull.x}px, ${pull.y}px)`,
              transition: pulling
                ? "none"
                : "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div className={`flex flex-row items-end ${isStraining ? "arrow-shake" : ""}`}>
              <span style={{ fontFamily: "cursive", color: "#CE2F25", fontSize: "1.7rem", fontWeight: 700, transform: "rotate(-8deg)", textShadow: "0 2px 8px rgba(245,241,232,0.8)", whiteSpace: "nowrap" }}>
                {arrowText}
              </span>
              <svg viewBox="0 0 110 100" width={110} height={100} style={{ marginLeft: "-10px", marginBottom: "14px", overflow: "visible" }}>
                {/* łuk startuje przy wykrzykniku i zakręca w górę, w stronę hamburgera */}
                <path d="M4,86 C 42,88 76,64 94,16" fill="none" stroke="#CE2F25" strokeWidth="3.2" strokeLinecap="round" opacity="0.95" />
                <path d="M82,22 L95,13 L96,29" fill="none" stroke="#CE2F25" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              </svg>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-6 pt-24 pb-16">
          {/* Główne logo (pozycja nr 2) — nigdy nie znika ze strony głównej i nie
              przesuwa się. Docelowa szerokość 720px, ale ograniczona też wysokością
              okna, żeby przyciski CTA zostały widoczne bez scrollowania.
              id="hero-logo" — Navbar obserwuje ten element, by wiedzieć, kiedy
              pokazać małe logo w rogu. */}
          <h1 id="hero-logo" className="m-0">
            <img
              src="/logo/sunrun-pelne.svg"
              alt="Sun Run — Spotkajmy się dla Hospicjum"
              width={870}
              height={634}
              className="h-auto"
              style={{ width: "min(720px, 88vw, 62vh)" }}
              draggable={false}
            />
          </h1>

          <div className="flex items-center gap-4 pt-1">
            <div className="h-px w-10 bg-sr-orange/60" />
            <p className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#183153] uppercase">
              [DATA BIEGU 2026]
            </p>
          </div>

          <div className="bg-sr-white rounded-2xl px-6 py-5 border border-sr-line max-w-2xl shadow-sm">
            <p className="text-base sm:text-lg text-[#183153] leading-relaxed">
              Bieg charytatywny organizowany w 100% przez lubelską młodzież.
              Razem wspieramy{" "}
              <a href="https://hospicjum-samarytanin.pl" target="_blank" rel="noopener noreferrer"
                className="cursor-target text-sr-red underline underline-offset-2 decoration-sr-orange/50 hover:decoration-sr-orange transition-all font-semibold">
                Hospicjum Dobrego Samarytanina
              </a>{" "}
              — każdy pakiet startowy to realna pomoc dla ~800 rodzin terminalnie chorych rocznie.
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 pt-2 pointer-events-auto transition-all duration-500 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <a href="https://frslublin.pl" target="_blank" rel="noopener noreferrer"
              className="cursor-target inline-flex items-center justify-center px-12 py-5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0">
              Zapisz się
            </a>
            <button onClick={() => document.getElementById("o-biegu")?.scrollIntoView({ behavior: "smooth" })}
              className="cursor-target inline-flex items-center justify-center px-12 py-5 border border-sr-line hover:border-sr-orange/60 bg-sr-white text-[#183153] font-bold rounded-full text-lg tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5">
              Dowiedz się więcej ↓
            </button>
          </div>
        </div>
      </section>

      {/* TYMCZASOWE zakotwiczenie dla pozycji "O Festiwalu" z menu bocznego.
          Sekcja o Festiwalu jeszcze nie istnieje — czekamy na materiały od sztabu.
          Do tego czasu odnośnik przewija tutaj, czyli na koniec sekcji startowej,
          gdzie ta sekcja logicznie stanie. Po jej dodaniu przenieś id="o-festiwalu"
          na właściwą sekcję i usuń ten znacznik. */}
      <div id="o-festiwalu" aria-hidden="true" />

      {/* ═══════════════════════════════════════════
          2. STATS DASHBOARD — Mapa + Dane + Licznik
          (wszystkie widoczne naraz na ekranie)
      ═══════════════════════════════════════════ */}
      <section
        id="o-biegu"
        className="relative z-10 w-full min-h-screen flex items-center py-16 px-6 sm:px-12"
      >
        <div className="max-w-[88rem] mx-auto w-full">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red mb-8">
            Szczegóły biegu
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* MAPA — 3/5 szerokości na desktopie */}
            <div className="lg:col-span-3 h-96 sm:h-[440px] lg:h-[620px] rounded-3xl overflow-hidden border border-sr-line bg-sr-white shadow-xl relative">
              <RouteMap />
              <div className="absolute bottom-4 left-4 bg-sr-white border border-sr-line rounded-xl z-[1000] px-4 py-2 text-xs text-[#3D4D65] pointer-events-none">
                Trasa · Park Ludowy, al. J. Piłsudskiego
              </div>
            </div>

            {/* DANE + LICZNIK — 2/5 szerokości */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Karta: Ważne Dane */}
              <div className="flex-1 rounded-3xl bg-sr-white border border-sr-line p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-4 block">
                  Ważne dane
                </span>
                <div className="space-y-3">
                  {[
                    { label: "Dystans", value: "5 km (2 pętle)" },
                    { label: "Limit czasu", value: "60 minut" },
                    { label: "Minimalny wiek", value: "14 lat" },
                    { label: "Format", value: "Bieg i Nordic Walking" },
                    { label: "Timing", value: "Datasport" },
                    { label: "Linia startu", value: "Park Ludowy, Lublin" },
                    { label: "Start o godz.", value: "[GODZINA]" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center border-b border-[rgb(24 49 83 / 0.14)] pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-[#3D4D65] uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-bold text-[#183153]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Karta: Licznik zapisanych */}
              <div className="rounded-3xl bg-sr-white border border-sr-orange/25 p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-3 block">
                  Zapisanych uczestników
                </span>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sr-navy to-sr-red leading-none">
                    127
                  </span>
                  <span className="text-[#3D4D65] text-sm pb-2">i rośnie!</span>
                </div>
                <p className="text-xs text-[#3D4D65] mt-3">
                  Dane orientacyjne · aktualizacja wkrótce
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. SCROLL STACK — głębsze informacje
      ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-16 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#3D4D65]">Dowiedz się więcej</span>
            <div className="h-px flex-1 bg-sr-line" />
          </div>
        </div>
        <ScrollStack useWindowScroll={true} itemDistance={80} itemScale={0.015} baseScale={0.96} itemStackDistance={12} stackPosition="12%" scaleEndPosition="8%">
          {/* Karta 1: O Hospicjum */}
          <ScrollStackItem itemClassName="bg-[#FFFFFF] border border-sr-line text-[#183153]">
            <div className="h-full flex flex-col justify-center">
              <div className="grid md:grid-cols-[1fr,300px] gap-8 items-stretch">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="text-base sm:text-lg font-bold uppercase tracking-[0.18em] text-sr-red mb-2 block">Cel Charytatywny</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sr-red to-sr-navy">
                      Hospicjum Dobrego Samarytanina
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[#183153] leading-relaxed">
                  Hospicjum Dobrego Samarytanina w Lublinie (ul. Bernardyńska 11A) otacza opieką paliatywną
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
              {/* Zdjęcie: Hospicjum Dobrego Samarytanina */}
              <div className="hidden md:block rounded-2xl overflow-hidden border border-sr-line min-h-[300px] self-stretch flex-1">
                <img
                  src="/photos/hospicujm.webp"
                  alt="Hospicjum Dobrego Samarytanina w Lublinie"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Karta 2: Zostań wolontariuszem */}
          <ScrollStackItem itemClassName="bg-[#FFFFFF] border border-sr-line text-[#183153]">
            <div className="h-full flex flex-col justify-center">
              <div className="grid md:grid-cols-[1fr,300px] gap-8 items-stretch">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="text-base sm:text-lg font-bold uppercase tracking-[0.18em] text-sr-red mb-2 block">Dołącz do ekipy</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sr-navy to-sr-red">
                      Zostań Wolontariuszem
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[#183153] leading-relaxed">
                  Sun Run to inicjatywa w 100% prowadzona przez młodzież. Szukamy osób chętnych do pomocy
                  przy organizacji — od obsługi miasteczka biegowego, przez wsparcie na trasie,
                  aż po promocję w mediach społecznościowych. Dołącz do naszej ekipy!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {["Obsługa trasy", "Miasteczko biegowe", "Promocja i media", "Punkt DKMS"].map(r => (
                    <div key={r} className="flex items-center gap-2 text-sm text-[#183153]">
                      <span className="w-1.5 h-1.5 bg-sr-orange rounded-full flex-shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:sunrunlublin@gmail.com?subject=Wolontariat%20Sun%20Run%202026"
                  className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-sr-orange/10 border border-sr-orange/30 hover:border-sr-orange text-sr-red font-semibold rounded-full text-sm tracking-wide transition-all duration-200 w-fit"
                >
                  Zgłoś się jako wolontariusz →
                </a>
              </div>
              {/* Zdjęcie: sztab / ekipa wolontariuszy */}
              <div className="hidden md:block rounded-2xl overflow-hidden border border-sr-line min-h-[300px] self-stretch flex-1">
                <img
                  src="/photos/sztab.webp"
                  alt="Sztab i wolontariusze Sun Run"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Karta 3: Zostań partnerem */}
          <ScrollStackItem itemClassName="bg-[#FFFFFF] border border-sr-orange/25 text-[#183153]">
            <div className="h-full flex flex-col justify-center">
              <div className="grid md:grid-cols-[1fr,300px] gap-8 items-stretch">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="text-base sm:text-lg font-bold uppercase tracking-[0.18em] text-sr-red mb-2 block">Współpraca</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sr-navy to-sr-red">
                      Zostań Partnerem
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[#183153] leading-relaxed">
                  W I edycji Sun Run wzięło udział ponad <strong className="text-[#183153]">350 uczestników</strong>.
                  Partnerstwo to widoczność wśród aktywnej społeczności Lublina oraz realne wsparcie
                  szczytnego celu. Oferujemy pakiety sponsorskie dostosowane do potrzeb Twojej firmy.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Widoczność logo", "Stoisko w miasteczku", "Materiały eventowe", "Media coverage"].map(b => (
                    <span key={b} className="px-3 py-1 bg-sr-orange/10 border border-sr-orange/25 rounded-full text-xs text-sr-red font-medium">
                      {b}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href="/partnerzy"
                    className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-sr-orange/10 border border-sr-orange/30 hover:border-sr-orange text-sr-red font-semibold rounded-full text-sm tracking-wide transition-all duration-200"
                  >
                    Oferta dla partnerów →
                  </Link>
                </div>
              </div>
              {/* Zdjęcie: partnerzy / współpraca */}
              <div className="hidden md:block rounded-2xl overflow-hidden border border-sr-line min-h-[300px] self-stretch flex-1">
                <img
                  src="/photos/partner.avif"
                  alt="Partnerzy i współpraca przy Sun Run"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              </div>
            </div>
          </ScrollStackItem>
        </ScrollStack>
      </section>

      {/* ═══════════════════════════════════════════
          4. PARTNERZY
      ═══════════════════════════════════════════ */}
      <section id="partnerzy" className="relative z-10 w-full min-h-screen flex items-center py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red">Wsparcie</span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase text-[#183153]">
              Partnerzy i Sponsorzy
            </h2>
            <p className="text-base sm:text-lg text-[#3D4D65] max-w-xl mx-auto">
              Kliknij na logo, by dowiedzieć się więcej o wkładzie partnera w projekt!
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6">
            {PARTNERS.map((p) => (
              <Link
                key={p.name}
                href={`/partnerzy#${p.anchor}`}
                className="cursor-target group flex flex-col items-center justify-center gap-3 p-8 bg-white border border-sr-line hover:border-sr-line rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl text-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm sm:text-base font-bold text-[#183153] group-hover:text-[#183153] transition-colors">
                  {p.name}
                </span>
                <span className="text-xs text-[#3D4D65] leading-snug">{p.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. WSPOMNIENIA — zajawka archiwum + Stack zdjęć
      ═══════════════════════════════════════════ */}
      <section ref={wspomnieniaRef} className="relative z-10 w-full min-h-screen flex items-center py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Tekst + CTA */}
          <div className="space-y-6">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red block">
              Archiwum · I Edycja 2025
            </span>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase text-[#183153] leading-none">
              Wspomnienia
            </h2>
            <p className="text-base sm:text-lg text-[#183153] leading-relaxed max-w-md">
              Ponad 350 uczestników, świetna atmosfera i realna pomoc dla hospicjum.
              Przeciągnij zdjęcia obok, a po całą relację, wyniki i galerię zajrzyj do archiwum.
            </p>
            <Link
              href="/archiwum"
              className="cursor-target inline-flex items-center gap-2 px-9 py-4 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-base tracking-widest uppercase transition-all duration-300 shadow-lg hover:-translate-y-0.5"
            >
              Odwiedź Archiwum →
            </Link>
          </div>

          {/* Stack zdjęć — przeciągalny stos wspomnień */}
          <div className="flex justify-center md:justify-end py-6">
            <Stack
              randomRotation
              sensitivity={150}
              sendToBackOnClick
              cardDimensions={{ width: 380, height: 380 }}
              cardsData={STACK_CARDS}
            />
          </div>
        </div>
      </section>
      </main>

      {/* ═══════════════════════════════════════════
          6. FOOTER
      ═══════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
