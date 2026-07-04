// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import TargetCursor from "@/components/TargetCursor";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

const Grainient = dynamic(() => import("@/components/Grainient"), { ssr: false });
const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });
const ImageTrail = dynamic(() => import("@/components/ImageTrail"), { ssr: false });
const MetaBalls = dynamic(() => import("@/components/MetaBalls"), { ssr: false });

// Placeholder zdjęcia z I edycji — zastąpić prawdziwymi w /public
const TRAIL_IMAGES = [
  "/sun_run_runners.png",
  "https://picsum.photos/id/1015/400/400",
  "https://picsum.photos/id/1018/400/400",
  "https://picsum.photos/id/1039/400/400",
  "https://picsum.photos/id/1043/400/400",
  "https://picsum.photos/id/1060/400/400",
  "https://picsum.photos/id/325/400/400",
  "https://picsum.photos/id/338/400/400",
  "https://picsum.photos/id/372/400/400",
  "https://picsum.photos/id/376/400/400",
];

const PARTNERS = [
  { name: "DKMS", desc: "Rejestracja dawców szpiku", anchor: "dkms", color: "#ED3939" },
  { name: "VIVO! Lublin", desc: "Partner strategiczny", anchor: "vivo", color: "#0B4282" },
  { name: "AS Babuni", desc: "Partner gastronomiczny", anchor: "as-babuni", color: "#EB8714" },
  { name: "Datasport", desc: "Pomiar czasu i klasyfikacje", anchor: "datasport", color: "#0B4282" },
  { name: "UP Lublin", desc: "Patronat honorowy", anchor: "up-lublin", color: "#EB8714" },
];

const SketchUnderline = ({ color = "#EB8714", width = 200 }) => (
  <svg viewBox={`0 0 ${width} 10`} width={width} height={10} style={{ display: "block", overflow: "visible" }}>
    <path
      d={`M4,7 Q${width * 0.25},2 ${width * 0.5},6 Q${width * 0.75},9 ${width - 4},4`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.38);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative bg-[#F5F1E8] text-[#1A1712] overflow-x-hidden">
      {/* Stałe tło */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#F5D593"
          color2="#F4EAD6"
          color3="#EDC183"
          timeSpeed={0.6}
          colorBalance={0.0}
          warpStrength={0.8}
          warpFrequency={4.0}
          warpSpeed={1.6}
          warpAmplitude={40.0}
          blendAngle={0.0}
          blendSoftness={0.05}
          rotationAmount={400.0}
          noiseScale={2.0}
          grainAmount={0.08}
          grainScale={2.0}
          grainAnimated={false}
          contrast={1.15}
          gamma={1.0}
          saturation={0.78}
          centerX={0.0}
          centerY={0.0}
          zoom={0.9}
        />
        <div className="absolute inset-0 bg-[#F5F1E8]/52" />
      </div>

      <Navbar />

      <TargetCursor
        spinDuration={3}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#1A1712"
        cursorColorOnTarget="#EB8714"
        targetSelector=".cursor-target"
      />

      {/* ═══════════════════════════════════════════
          STICKY CTA — "Zapisz się" (pojawia się po scrollowaniu)
      ═══════════════════════════════════════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
          scrolled ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-[#FCFBF7]/90 backdrop-blur-md border-t border-[#E2DBCC] py-3 px-6 flex justify-center items-center gap-5 shadow-2xl">
          <span className="text-sm text-[#6B6357] hidden sm:block tracking-wide">
            Zapisz się na <span className="text-brand-orange font-bold">II edycję Sun Run 2026!</span>
          </span>
          <a
            href="https://frslublin.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-target inline-flex items-center justify-center px-8 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-black rounded-full text-sm tracking-widest uppercase transition-all duration-200 shadow-lg hover:shadow-brand-orange/30"
          >
            Zapisz się →
          </a>
        </div>
      </div>

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
            color1="#EB8714"
            color2="#ED3939"
            speed={0.45}
            opacity={0.4}
            enableMouseInteraction={true}
          />
        </div>

        {/* "kliknij tutaj!" — zakrzywiona strzałka od wykrzyknika prosto w hamburger menu */}
        <div className="absolute top-28 right-16 hidden sm:flex flex-row items-end pointer-events-none" style={{ zIndex: 20 }}>
          <span style={{ fontFamily: "cursive", color: "#EB8714", fontSize: "1.7rem", fontWeight: 700, transform: "rotate(-8deg)", textShadow: "0 2px 8px rgba(245,241,232,0.8)", whiteSpace: "nowrap" }}>
            kliknij tutaj!
          </span>
          <svg viewBox="0 0 110 100" width={110} height={100} style={{ marginLeft: "-10px", marginBottom: "14px", overflow: "visible" }}>
            {/* łuk startuje przy wykrzykniku i zakręca w górę, w stronę hamburgera */}
            <path d="M4,86 C 42,88 76,64 94,16" fill="none" stroke="#EB8714" strokeWidth="3.2" strokeLinecap="round" opacity="0.95" />
            <path d="M82,22 L95,13 L96,29" fill="none" stroke="#EB8714" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
          </svg>
        </div>

        <div className="max-w-4xl space-y-6 pt-24 pb-16">
          <div>
            <h1 className="text-8xl sm:text-[11rem] font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-br from-brand-orange via-brand-orange to-brand-red leading-none"
              style={{ filter: "drop-shadow(0 2px 10px rgba(235,135,20,0.25))" }}>
              SUN<br />RUN
            </h1>
            <div className="mt-1 ml-1">
              <SketchUnderline color="#EB8714" width={336} />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="h-px w-10 bg-brand-orange/60" />
            <p className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#1A1712] uppercase">
              [DATA BIEGU 2026]
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-5 border border-black/5 max-w-2xl shadow-sm">
            <p className="text-base sm:text-lg text-[#3A342B] leading-relaxed">
              Bieg charytatywny organizowany w 100% przez lubelską młodzież.
              Razem wspieramy{" "}
              <a href="https://hospicjum.lublin.pl" target="_blank" rel="noopener noreferrer"
                className="cursor-target text-brand-orange underline underline-offset-2 decoration-brand-orange/50 hover:decoration-brand-orange transition-all font-semibold">
                Hospicjum Dobrego Samarytanina
              </a>{" "}
              — każdy pakiet startowy to realna pomoc dla ~800 rodzin terminalnie chorych rocznie.
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 pt-2 pointer-events-auto transition-all duration-500 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <a href="https://frslublin.pl" target="_blank" rel="noopener noreferrer"
              className="cursor-target inline-flex items-center justify-center px-12 py-5 bg-brand-orange hover:bg-brand-orange/90 text-white font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0">
              Zapisz się
            </a>
            <button onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
              className="cursor-target inline-flex items-center justify-center px-12 py-5 border border-[#D8CFBD] hover:border-brand-orange/60 bg-white/60 backdrop-blur-sm text-[#1A1712] font-bold rounded-full text-lg tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5">
              Dowiedz się więcej ↓
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. STATS DASHBOARD — Mapa + Dane + Licznik
          (wszystkie widoczne naraz na ekranie)
      ═══════════════════════════════════════════ */}
      <section
        id="stats"
        className="relative z-10 w-full min-h-screen flex items-center py-16 px-6 sm:px-12"
      >
        <div className="max-w-[88rem] mx-auto w-full">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-brand-orange mb-8">
            Szczegóły biegu
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* MAPA — 3/5 szerokości na desktopie */}
            <div className="lg:col-span-3 h-96 sm:h-[440px] lg:h-[620px] rounded-3xl overflow-hidden border border-[#E2DBCC] bg-white/70 backdrop-blur-sm shadow-xl relative">
              <RouteMap />
              <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-md border border-[#E2DBCC] rounded-xl px-4 py-2 text-xs text-[#6B6357] pointer-events-none">
                Trasa · Park Ludowy, al. J. Piłsudskiego
              </div>
            </div>

            {/* DANE + LICZNIK — 2/5 szerokości */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Karta: Ważne Dane */}
              <div className="flex-1 rounded-3xl bg-white/75 border border-[#E2DBCC] backdrop-blur-sm p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-4 block">
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
                    <div key={item.label} className="flex justify-between items-center border-b border-[#E5DFD2] pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-[#6B6357] uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-bold text-[#1A1712]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Karta: Licznik zapisanych */}
              <div className="rounded-3xl bg-white/75 border border-brand-orange/25 backdrop-blur-sm p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-3 block">
                  Zapisanych uczestników
                </span>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-orange to-brand-red leading-none">
                    127
                  </span>
                  <span className="text-[#6B6357] text-sm pb-2">i rośnie!</span>
                </div>
                <p className="text-xs text-[#9A9080] mt-3">
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
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#6B6357]">Dowiedz się więcej</span>
            <div className="h-px flex-1 bg-[#E2DBCC]" />
          </div>
        </div>
        <ScrollStack useWindowScroll={true} itemDistance={80} itemScale={0.015} baseScale={0.96} itemStackDistance={12} stackPosition="12%" scaleEndPosition="8%">
          {/* Karta 1: O Hospicjum */}
          <ScrollStackItem itemClassName="bg-[#F7EFDF] border border-[#E2DBCC] text-[#1A1712]">
            <div className="h-full flex flex-col justify-center">
              <div className="grid md:grid-cols-[1fr,300px] gap-8 items-stretch">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-red mb-1 block">Cel Charytatywny</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-orange">
                      Hospicjum Dobrego Samarytanina
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[#4A4438] leading-relaxed">
                  Hospicjum Dobrego Samarytanina w Lublinie (ul. Bernardyńska 11A) otacza opieką paliatywną
                  ok. <strong className="text-[#1A1712]">800 rodzin</strong> pacjentów z chorobami terminalnymi rocznie.
                  Środki zebrane podczas Sun Run przeznaczamy na specjalistyczny sprzęt medyczny
                  oraz doskonalenie warunków opieki.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-[#F3ECDD] border border-[#E2DBCC] rounded-lg text-xs text-[#6B6357]">
                    KRS: 0000 318 602
                  </div>
                  <div className="px-3 py-1.5 bg-[#F3ECDD] border border-[#E2DBCC] rounded-lg text-xs text-[#6B6357]">
                    ul. Bernardyńska 11A, Lublin
                  </div>
                </div>
                <a
                  href="https://hospicjum.lublin.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 border border-brand-red/40 hover:border-brand-red text-brand-red hover:text-brand-red font-semibold rounded-full text-sm tracking-wide transition-all duration-200 w-fit"
                >
                  Odwiedź stronę hospicjum →
                </a>
              </div>
              {/* Zdjęcie: Hospicjum Dobrego Samarytanina */}
              <div className="hidden md:block rounded-2xl overflow-hidden border border-[#E2DBCC] min-h-[300px] self-stretch flex-1">
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
          <ScrollStackItem itemClassName="bg-[#F7EFDF] border border-[#E2DBCC] text-[#1A1712]">
            <div className="h-full flex flex-col justify-center">
              <div className="grid md:grid-cols-[1fr,300px] gap-8 items-stretch">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange mb-1 block">Dołącz do ekipy</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-red">
                      Zostań Wolontariuszem
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[#4A4438] leading-relaxed">
                  Sun Run to inicjatywa w 100% prowadzona przez młodzież. Szukamy osób chętnych do pomocy
                  przy organizacji — od obsługi miasteczka biegowego, przez wsparcie na trasie,
                  aż po promocję w mediach społecznościowych. Dołącz do naszej ekipy!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {["Obsługa trasy", "Miasteczko biegowe", "Promocja i media", "Punkt DKMS"].map(r => (
                    <div key={r} className="flex items-center gap-2 text-sm text-[#4A4438]">
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full flex-shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:sunrunlublin@gmail.com?subject=Wolontariat%20Sun%20Run%202026"
                  className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange/10 border border-brand-orange/30 hover:border-brand-orange text-brand-orange font-semibold rounded-full text-sm tracking-wide transition-all duration-200 w-fit"
                >
                  Zgłoś się jako wolontariusz →
                </a>
              </div>
              {/* Zdjęcie: sztab / ekipa wolontariuszy */}
              <div className="hidden md:block rounded-2xl overflow-hidden border border-[#E2DBCC] min-h-[300px] self-stretch flex-1">
                <img
                  src="/photos/sztab.jpg"
                  alt="Sztab i wolontariusze Sun Run"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Karta 3: Zostań partnerem */}
          <ScrollStackItem itemClassName="bg-[#F7EFDF] border border-brand-orange/25 text-[#1A1712]">
            <div className="h-full flex flex-col justify-center">
              <div className="grid md:grid-cols-[1fr,300px] gap-8 items-stretch">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange mb-1 block">Współpraca</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-red">
                      Zostań Partnerem
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[#4A4438] leading-relaxed">
                  W I edycji Sun Run wzięło udział ponad <strong className="text-[#1A1712]">350 uczestników</strong>.
                  Partnerstwo to widoczność wśród aktywnej społeczności Lublina oraz realne wsparcie
                  szczytnego celu. Oferujemy pakiety sponsorskie dostosowane do potrzeb Twojej firmy.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Widoczność logo", "Stoisko w miasteczku", "Materiały eventowe", "Media coverage"].map(b => (
                    <span key={b} className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/25 rounded-full text-xs text-brand-orange font-medium">
                      {b}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href="/partnerzy"
                    className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange/10 border border-brand-orange/30 hover:border-brand-orange text-brand-orange font-semibold rounded-full text-sm tracking-wide transition-all duration-200"
                  >
                    Oferta dla partnerów →
                  </Link>
                </div>
              </div>
              {/* Zdjęcie: partnerzy / współpraca */}
              <div className="hidden md:block rounded-2xl overflow-hidden border border-[#E2DBCC] min-h-[300px] self-stretch flex-1">
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
      <section className="relative z-10 w-full pt-44 pb-28 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Wsparcie</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#1A1712]">
              Partnerzy i Sponsorzy
            </h2>
            <p className="text-sm text-[#6B6357] max-w-md mx-auto">
              Kliknij na logo, by dowiedzieć się więcej o wkładzie partnera w projekt!
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PARTNERS.map((p) => (
              <Link
                key={p.name}
                href={`/partnerzy#${p.anchor}`}
                className="cursor-target group flex flex-col items-center justify-center gap-2 p-5 bg-white border border-[#E2DBCC] hover:border-[#D8CFBD] rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xs"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-[#3A342B] group-hover:text-[#1A1712] transition-colors">
                  {p.name}
                </span>
                <span className="text-[10px] text-[#9A9080] leading-snug">{p.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. IMAGE TRAIL — Wspomnienia z I edycji
      ═══════════════════════════════════════════ */}
      <section
        className="relative z-10 w-full h-screen cursor-pointer group overflow-hidden bg-[#EDE7DA]/40"
        onClick={() => (window.location.href = "/archiwum")}
      >
        <ImageTrail items={TRAIL_IMAGES} threshold={70} />
        {/* Overlay z tekstem */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 px-8 bg-white/55 backdrop-blur-sm rounded-3xl py-8 border border-[#E2DBCC]">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block">
              Archiwum · I Edycja 2025
            </span>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-[#1A1712]">
              Wspomnienia
            </h2>
            <p className="text-sm text-[#6B6357]">
              Przesuń kursor, by zobaczyć zdjęcia z biegu
            </p>
            <div className="inline-flex items-center gap-2 text-brand-orange text-sm font-bold group-hover:gap-3 transition-all">
              Odwiedź Archiwum →
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="relative z-10 w-full bg-[#EFE9DC]/95 border-t border-[#E2DBCC] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-red">
                SUN RUN
              </h3>
              <p className="text-xs text-[#6B6357] leading-relaxed">
                Bieg charytatywny dla Hospicjum Dobrego Samarytanina w Lublinie.
                Inicjatywa lubelskiej młodzieży.
              </p>
            </div>

            {/* Nawigacja */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#4A4438]">Strony</h4>
              {[
                { label: "O nas", href: "/o-nas" },
                { label: "Dla partnerów", href: "/partnerzy" },
                { label: "Archiwum I edycji", href: "/archiwum" },
                { label: "Zapisz się", href: "https://frslublin.pl" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block text-sm text-[#6B6357] hover:text-brand-orange transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Kontakt */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#4A4438]">Kontakt</h4>
              <a
                href="mailto:sunrunlublin@gmail.com"
                className="block text-sm text-[#6B6357] hover:text-brand-orange transition-colors"
              >
                sunrunlublin@gmail.com
              </a>
              <p className="text-xs text-[#9A9080]">
                W sprawie partnerstw skontaktuj się z nami mailowo lub przez formularz w zakładce Dla Partnerów.
              </p>
            </div>

            {/* Social media */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#4A4438]">Media</h4>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Instagram", url: "https://instagram.com/sunrunlublin", icon: "IG" },
                  { name: "Facebook", url: "https://facebook.com/sunrunlublin", icon: "FB" },
                  { name: "TikTok", url: "https://tiktok.com/@sunrunlublin", icon: "TT" },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[#6B6357] hover:text-brand-orange transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#F3ECDD] border border-[#E2DBCC] group-hover:border-brand-orange/40 flex items-center justify-center text-[10px] font-black transition-colors">
                      {s.icon}
                    </span>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E2DBCC] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#6B6357]">
              © 2026 Sun Run Lublin · Wszelkie prawa zastrzeżone
            </p>
            <p className="text-xs text-[#9A9080]">
              Hospicjum Dobrego Samarytanina · KRS 0000318602
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
