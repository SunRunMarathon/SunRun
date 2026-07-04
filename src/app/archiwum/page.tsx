"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import TargetCursor from "@/components/TargetCursor";

const Grainient = dynamic(() => import("@/components/Grainient"), { ssr: false });

const ARTICLES = [
  {
    title: "Sun Run 2025 — relacja z biegu",
    source: "Kurier Lubelski",
    date: "6 września 2025",
    excerpt: "Ponad 350 uczestników przebiegło przez Park Ludowy w Lublinie, wspierając Hospicjum Dobrego Samarytanina...",
    url: "#",
    color: "#D99A00",
  },
  {
    title: "Młodzież organizuje bieg dla hospicjum",
    source: "Dziennik Wschodni",
    date: "4 września 2025",
    excerpt: "Inicjatywa lubelskich uczniów z III LO im. Unii Lubelskiej przyciągnęła setki biegaczy i spacerowiczów...",
    url: "#",
    color: "#EB8714",
  },
  {
    title: "DKMS na Sun Run — relacja",
    source: "dkms.pl",
    date: "7 września 2025",
    excerpt: "Podczas II edycji biegu charytatywnego w Lublinie udało się zarejestrować nowych potencjalnych dawców szpiku...",
    url: "#",
    color: "#ED3939",
  },
];

const STATS_2025 = [
  { val: "350+", label: "uczestników" },
  { val: "5 km", label: "dystans" },
  { val: "6.09.2025", label: "data biegu" },
  { val: "2", label: "pętle w Parku Ludowym" },
];

// Placeholder zdjęcia — zastąpić prawdziwymi
const GALLERY_IMAGES = [
  "/sun_run_runners.png",
  "https://picsum.photos/id/1015/600/400",
  "https://picsum.photos/id/1018/600/400",
  "https://picsum.photos/id/1039/600/400",
  "https://picsum.photos/id/1043/600/400",
  "https://picsum.photos/id/1060/600/400",
  "https://picsum.photos/id/325/600/400",
  "https://picsum.photos/id/338/600/400",
  "https://picsum.photos/id/372/600/400",
  "https://picsum.photos/id/376/600/400",
  "https://picsum.photos/id/392/600/400",
  "https://picsum.photos/id/419/600/400",
];

export default function ArchiwumPage() {
  return (
    <div className="relative min-h-screen bg-[#F5F1E8] text-[#1A1712] overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#F4CDB0"
          color2="#F1E7D6"
          color3="#EAD6B0"
          timeSpeed={0.2}
          warpStrength={0.8}
          warpFrequency={5.0}
          contrast={1.1}
          gamma={1.0}
          saturation={0.7}
          grainAmount={0.07}
          zoom={0.9}
        />
        <div className="absolute inset-0 bg-[#F5F1E8]/55" />
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

      <main className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center px-8 sm:px-16 md:px-28 pt-24 pb-16">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-brand-red px-3 py-1.5 bg-brand-red/10 rounded-full border border-brand-red/30">
              I edycja · 6 września 2025
            </span>
            <h1 className="text-5xl sm:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-brand-red via-brand-orange to-brand-orange leading-none">
              Archiwum<br />2025
            </h1>
            <p className="text-base sm:text-lg text-[#3A342B] leading-relaxed max-w-2xl">
              Pierwsza edycja Sun Run przeszła nasze najśmielsze oczekiwania. Ponad 350 uczestników,
              znakomita atmosfera i realna pomoc dla Hospicjum Dobrego Samarytanina w Lublinie.
            </p>
          </div>
        </section>

        {/* Statystyki 2025 */}
        <section className="py-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red block mb-8">
              I edycja w liczbach
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {STATS_2025.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/70 border border-[#E2DBCC] backdrop-blur-sm rounded-2xl p-6 text-center shadow-sm"
                >
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-red to-brand-orange">
                    {s.val}
                  </p>
                  <p className="text-xs text-[#6B6357] mt-2 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inicjatywy towarzyszące */}
        <section className="py-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block mb-3">
              Wokół biegu
            </span>
            <h2 className="text-3xl font-black uppercase text-[#1A1712] mb-8">
              Inicjatywy towarzyszące
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  icon: "🩸",
                  title: "Punkt DKMS",
                  desc: "Stoisko rejestracji potencjalnych dawców szpiku kostnego działało przez cały czas trwania wydarzenia.",
                  color: "#ED3939",
                },
                {
                  icon: "🎤",
                  title: '"Nagraj się dla Hospicjum"',
                  desc: 'Kampania "Rekord dla Hospicjum" — uczestnicy nagrywali wiadomości dla pacjentów. Wsparcie KUL i ambasadorów.',
                  color: "#EB8714",
                },
                {
                  icon: "🎓",
                  title: "Patronat UP Lublin",
                  desc: "Honorowy patronat Uniwersytetu Przyrodniczego w Lublinie.",
                  color: "#0B4282",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white/70 border border-[#E2DBCC] backdrop-blur-sm rounded-2xl p-6 shadow-sm"
                >
                  <span className="text-3xl block mb-3">{item.icon}</span>
                  <h3 className="font-black text-base mb-2" style={{ color: item.color }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B6357] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wyniki */}
        <section className="py-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block mb-3">
              Sport
            </span>
            <h2 className="text-3xl font-black uppercase text-[#1A1712] mb-8">
              Klasyfikacje i wyniki
            </h2>
            <div className="bg-white/70 border border-[#E2DBCC] backdrop-blur-sm rounded-2xl p-8 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-orange mb-4">
                    Kategorie
                  </h3>
                  <ul className="space-y-2 text-sm text-[#3A342B]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
                      OPEN — czas brutto (każdy wiek)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
                      14+ lat — czas netto
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-red rounded-full" />
                      30+ lat — czas netto
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                      50+ lat — czas netto
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-orange mb-4">
                    Szczegóły pomiaru
                  </h3>
                  <ul className="space-y-2 text-sm text-[#3A342B]">
                    <li>System: Datasport (elektroniczny pomiar)</li>
                    <li>Limit czasu: 60 minut</li>
                    <li>Dystans: 5 km (2 pętle asfaltowe)</li>
                    <li>Wiek minimalny: 14 lat</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#E2DBCC]">
                <a
                  href="https://datasport.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 border border-[#D8CFBD] hover:border-brand-orange text-[#3A342B] hover:text-brand-orange rounded-full text-sm transition-all"
                >
                  Pełne wyniki na datasport.pl →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Artykuły */}
        <section className="py-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red block mb-3">
              Media
            </span>
            <h2 className="text-3xl font-black uppercase text-[#1A1712] mb-8">
              Artykuły o Sun Run 2025
            </h2>
            <div className="space-y-4">
              {ARTICLES.map((a) => (
                <a
                  key={a.title}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target flex flex-col sm:flex-row gap-4 sm:items-center bg-white/70 border border-[#E2DBCC] hover:border-[#D8CFBD] backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 group shadow-sm"
                >
                  <div
                    className="w-1 h-full min-h-[3rem] rounded-full flex-shrink-0 hidden sm:block"
                    style={{ backgroundColor: a.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: a.color }}>
                        {a.source}
                      </span>
                      <span className="text-xs text-[#9A9080]">{a.date}</span>
                    </div>
                    <h3 className="font-black text-[#1A1712] group-hover:text-brand-orange transition-colors mb-1">
                      {a.title}
                    </h3>
                    <p className="text-sm text-[#6B6357]">{a.excerpt}</p>
                  </div>
                  <span className="text-[#9A9080] group-hover:text-brand-orange transition-colors flex-shrink-0">
                    →
                  </span>
                </a>
              ))}
            </div>
            <p className="text-xs text-[#9A9080] mt-6">
              * Linki do artykułów zostaną dodane po zebraniu wszystkich publikacji.
            </p>
          </div>
        </section>

        {/* Galeria zdjęć */}
        <section className="py-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block mb-3">
              Fotografie
            </span>
            <h2 className="text-3xl font-black uppercase text-[#1A1712] mb-3">
              Galeria zdjęć
            </h2>
            <p className="text-sm text-[#6B6357] mb-8">
              Placeholder — prawdziwe zdjęcia z biegu zostaną dodane wkrótce.
            </p>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {GALLERY_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className="break-inside-avoid rounded-xl overflow-hidden border border-[#E2DBCC] hover:border-[#D8CFBD] transition-all duration-300 cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Zdjęcie z I edycji Sun Run 2025 #${i + 1}`}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA do II edycji */}
        <section className="py-16 px-8 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block">
              Co dalej?
            </span>
            <h2 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-red">
              Dołącz do II edycji!
            </h2>
            <p className="text-sm text-[#6B6357]">
              II edycja Sun Run 2026 już w drodze. Zapisz się i biegnij z nami!
            </p>
            <a
              href="https://frslublin.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target inline-flex items-center justify-center px-10 py-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-black rounded-full text-sm tracking-widest uppercase transition-all shadow-xl"
            >
              Zapisz się na 2026 →
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
