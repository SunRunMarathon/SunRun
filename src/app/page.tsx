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
  { name: "Datasport", desc: "Pomiar czasu i klasyfikacje", anchor: "datasport", color: "#E8EBF7" },
  { name: "UP Lublin", desc: "Patronat honorowy", anchor: "up-lublin", color: "#FFEC8E" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.38);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative bg-black text-white overflow-x-hidden">
      {/* Stałe tło */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#FF9FFC"
          color2="#5227FF"
          color3="#B497CF"
          timeSpeed={0.22}
          colorBalance={0.0}
          warpStrength={1.0}
          warpFrequency={5.0}
          warpSpeed={2.0}
          warpAmplitude={50.0}
          blendAngle={0.0}
          blendSoftness={0.05}
          rotationAmount={500.0}
          noiseScale={2.0}
          grainAmount={0.1}
          grainScale={2.0}
          grainAnimated={false}
          contrast={1.5}
          gamma={1.0}
          saturation={1.0}
          centerX={0.0}
          centerY={0.0}
          zoom={0.9}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <Navbar />

      <TargetCursor
        spinDuration={3}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#E8EBF7"
        cursorColorOnTarget="#FFEC8E"
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
        <div className="bg-zinc-950/90 backdrop-blur-md border-t border-brand-yellow/20 py-3 px-6 flex justify-center items-center gap-5 shadow-2xl">
          <span className="text-sm text-zinc-400 hidden sm:block tracking-wide">
            Zapisz się na <span className="text-brand-yellow font-bold">II edycję Sun Run 2026!</span>
          </span>
          <a
            href="https://frslublin.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-target inline-flex items-center justify-center px-8 py-2.5 bg-brand-yellow hover:bg-brand-yellow/90 text-zinc-950 font-black rounded-full text-sm tracking-widest uppercase transition-all duration-200 shadow-lg hover:shadow-brand-yellow/30"
          >
            Zapisz się →
          </a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full min-h-screen flex flex-col justify-center px-8 sm:px-16 md:px-28 text-left select-none">
        <div className="max-w-3xl space-y-6 pt-24 pb-16">
          {/* Badge edycji */}
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-brand-yellow px-3 py-1.5 bg-brand-yellow/10 rounded-full border border-brand-yellow/25">
            II Edycja 2026 · Lublin
          </span>

          {/* Tytuł */}
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-red drop-shadow-[0_4px_20px_rgba(235,135,20,0.35)] leading-none">
            SUN<br />RUN
          </h1>

          {/* DATA BIEGU — bardzo widoczna */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-px w-8 bg-brand-yellow/60" />
            <p className="text-2xl sm:text-3xl font-extrabold tracking-widest text-brand-white uppercase">
              [DATA BIEGU 2026]
            </p>
          </div>

          {/* Opis */}
          <p className="text-base sm:text-lg text-brand-white/70 leading-relaxed max-w-xl">
            Bieg charytatywny organizowany w 100% przez lubelską młodzież.
            Razem wspieramy{" "}
            <a
              href="https://hospicjum.lublin.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target text-brand-yellow underline underline-offset-2 decoration-brand-yellow/40 hover:decoration-brand-yellow transition-all"
            >
              Hospicjum Dobrego Samarytanina
            </a>{" "}
            — każdy pakiet startowy to realna pomoc dla ~800 rodzin terminalnie chorych rocznie.
          </p>

          {/* CTA — duży żółty przycisk (w hero, przed scrollowaniem) */}
          <div
            className={`flex flex-col sm:flex-row gap-4 pt-6 pointer-events-auto transition-all duration-500 ${
              scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <a
              href="https://frslublin.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target inline-flex items-center justify-center px-10 py-4 bg-brand-yellow hover:bg-brand-yellow/90 text-zinc-950 font-black rounded-full text-base sm:text-lg tracking-widest uppercase transition-all duration-300 shadow-2xl hover:shadow-brand-yellow/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Zapisz się
            </a>
            <button
              onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
              className="cursor-target inline-flex items-center justify-center px-10 py-4 border border-zinc-700 hover:border-brand-yellow/50 bg-zinc-950/40 backdrop-blur-md text-brand-white font-bold rounded-full text-base tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5"
            >
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
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-brand-yellow/70 mb-8">
            Szczegóły biegu
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* MAPA — 3/5 szerokości na desktopie */}
            <div className="lg:col-span-3 h-72 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-sm shadow-2xl relative">
              <RouteMap />
              <div className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/60 rounded-xl px-4 py-2 text-xs text-zinc-400 pointer-events-none">
                Trasa · Park Ludowy, al. J. Piłsudskiego
              </div>
            </div>

            {/* DANE + LICZNIK — 2/5 szerokości */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Karta: Ważne Dane */}
              <div className="flex-1 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-sm p-6 shadow-xl">
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
                    <div key={item.label} className="flex justify-between items-center border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-zinc-400 uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-bold text-brand-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Karta: Licznik zapisanych */}
              <div className="rounded-3xl bg-zinc-950/70 border border-brand-yellow/20 backdrop-blur-sm p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3 block">
                  Zapisanych uczestników
                </span>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-yellow to-brand-orange leading-none">
                    127
                  </span>
                  <span className="text-zinc-400 text-sm pb-2">i rośnie!</span>
                </div>
                <p className="text-xs text-zinc-500 mt-3">
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
        <ScrollStack useWindowScroll={true} itemDistance={160} itemScale={0.03} baseScale={0.87}>
          {/* Karta 1: O Hospicjum */}
          <ScrollStackItem itemClassName="bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-brand-white">
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-red/20 border border-brand-red/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-red mb-1 block">Cel Charytatywny</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-orange">
                      Hospicjum Dobrego Samarytanina
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Hospicjum Dobrego Samarytanina w Lublinie (ul. Bernardyńska 11A) otacza opieką paliatywną
                  ok. <strong className="text-brand-white">800 rodzin</strong> pacjentów z chorobami terminalnymi rocznie.
                  Środki zebrane podczas Sun Run przeznaczamy na specjalistyczny sprzęt medyczny
                  oraz doskonalenie warunków opieki.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-400">
                    KRS: 0000 318 602
                  </div>
                  <div className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-400">
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
              <div className="text-xs text-zinc-600 uppercase tracking-widest pt-4 border-t border-zinc-900">
                O Sun Run · 1 / 3
              </div>
            </div>
          </ScrollStackItem>

          {/* Karta 2: Zostań wolontariuszem */}
          <ScrollStackItem itemClassName="bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-brand-white">
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🙋</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-yellow mb-1 block">Dołącz do ekipy</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-orange">
                      Zostań Wolontariuszem
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Sun Run to inicjatywa w 100% prowadzona przez młodzież. Szukamy osób chętnych do pomocy
                  przy organizacji — od obsługi miasteczka biegowego, przez wsparcie na trasie,
                  aż po promocję w mediach społecznościowych. Dołącz do naszej ekipy!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {["Obsługa trasy", "Miasteczko biegowe", "Promocja i media", "Punkt DKMS"].map(r => (
                    <div key={r} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full flex-shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:sunrunlublin@gmail.com?subject=Wolontariat%20Sun%20Run%202026"
                  className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-brand-yellow/10 border border-brand-yellow/30 hover:border-brand-yellow text-brand-yellow font-semibold rounded-full text-sm tracking-wide transition-all duration-200 w-fit"
                >
                  Zgłoś się jako wolontariusz →
                </a>
              </div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest pt-4 border-t border-zinc-900">
                O Sun Run · 2 / 3
              </div>
            </div>
          </ScrollStackItem>

          {/* Karta 3: Zostań partnerem */}
          <ScrollStackItem itemClassName="bg-zinc-950/80 border border-brand-orange/20 backdrop-blur-md text-brand-white">
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange mb-1 block">Współpraca</span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-yellow">
                      Zostań Partnerem
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  W I edycji Sun Run wzięło udział ponad <strong className="text-brand-white">350 uczestników</strong>.
                  Partnerstwo to widoczność wśród aktywnej społeczności Lublina oraz realne wsparcie
                  szczytnego celu. Oferujemy pakiety sponsorskie dostosowane do potrzeb Twojej firmy.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Widoczność logo", "Stoisko w miasteczku", "Materiały eventowe", "Media coverage"].map(b => (
                    <span key={b} className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full text-xs text-brand-orange font-medium">
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
              <div className="text-xs text-zinc-600 uppercase tracking-widest pt-4 border-t border-zinc-900">
                O Sun Run · 3 / 3
              </div>
            </div>
          </ScrollStackItem>
        </ScrollStack>
      </section>

      {/* ═══════════════════════════════════════════
          4. PARTNERZY
      ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-28 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow/70">Wsparcie</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-brand-white">
              Partnerzy i Sponsorzy
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Kliknij na logo, by dowiedzieć się więcej o wkładzie partnera w projekt!
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PARTNERS.map((p) => (
              <Link
                key={p.name}
                href={`/partnerzy#${p.anchor}`}
                className="cursor-target group flex flex-col items-center justify-center gap-2 p-5 bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-zinc-950 font-black text-xs"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                  {p.name}
                </span>
                <span className="text-[10px] text-zinc-600 leading-snug">{p.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. IMAGE TRAIL — Wspomnienia z I edycji
      ═══════════════════════════════════════════ */}
      <section
        className="relative z-10 w-full h-screen cursor-pointer group overflow-hidden bg-zinc-950/40"
        onClick={() => (window.location.href = "/archiwum")}
      >
        <ImageTrail items={TRAIL_IMAGES} threshold={70} />
        {/* Overlay z tekstem */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 px-8 bg-zinc-950/40 backdrop-blur-sm rounded-3xl py-8 border border-zinc-800/40">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow/80 block">
              Archiwum · I Edycja 2025
            </span>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-brand-white">
              Wspomnienia
            </h2>
            <p className="text-sm text-zinc-400">
              Przesuń kursor, by zobaczyć zdjęcia z biegu
            </p>
            <div className="inline-flex items-center gap-2 text-brand-yellow text-sm font-bold group-hover:gap-3 transition-all">
              Odwiedź Archiwum →
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="relative z-10 w-full bg-zinc-950/95 border-t border-zinc-800/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-orange">
                SUN RUN
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Bieg charytatywny dla Hospicjum Dobrego Samarytanina w Lublinie.
                Inicjatywa lubelskiej młodzieży.
              </p>
            </div>

            {/* Nawigacja */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Strony</h4>
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
                  className="block text-sm text-zinc-400 hover:text-brand-yellow transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Kontakt */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Kontakt</h4>
              <a
                href="mailto:sunrunlublin@gmail.com"
                className="block text-sm text-zinc-400 hover:text-brand-yellow transition-colors"
              >
                sunrunlublin@gmail.com
              </a>
              <p className="text-xs text-zinc-600">
                W sprawie partnerstw skontaktuj się z nami mailowo lub przez formularz w zakładce Dla Partnerów.
              </p>
            </div>

            {/* Social media */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Media</h4>
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
                    className="flex items-center gap-3 text-sm text-zinc-400 hover:text-brand-yellow transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-brand-yellow/40 flex items-center justify-center text-[10px] font-black transition-colors">
                      {s.icon}
                    </span>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-600">
              © 2026 Sun Run Lublin · Wszelkie prawa zastrzeżone
            </p>
            <p className="text-xs text-zinc-700">
              Hospicjum Dobrego Samarytanina · KRS 0000318602
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
