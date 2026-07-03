"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import TargetCursor from "@/components/TargetCursor";

const Grainient = dynamic(() => import("@/components/Grainient"), { ssr: false });

const TEAM = [
  {
    role: "Lider Projektu",
    name: "Jakub Delega",
    org: "III LO im. Unii Lubelskiej",
    color: "#FFEC8E",
  },
  {
    role: "Koordynator Gałęzi Program",
    name: "Tosia Polkowska",
    org: "Gałąź Program",
    color: "#EB8714",
  },
  {
    role: "Lider Zespołu Technicznego",
    name: "Wiktor",
    org: "Gałąź Program · Dział Tech",
    color: "#ED3939",
  },
  {
    role: "Główny Deweloper",
    name: "Miłosz Kamiński",
    org: "Gałąź Program · Dział Tech",
    color: "#0B4282",
  },
];

const BRANCHES = [
  {
    name: "Administracja",
    desc: "Zarządzanie dokumentacją, koordynacja wewnętrzna, obsługa formalna.",
    icon: "📋",
    color: "#E8EBF7",
  },
  {
    name: "Wykonanie",
    desc: "Logistyka, obsługa trasy, miasteczko biegowe, punkt startu i mety.",
    icon: "🏃",
    color: "#EB8714",
  },
  {
    name: "Promocja",
    desc: "Media społecznościowe, materiały graficzne, PR, kontakt z mediami.",
    icon: "📣",
    color: "#FFEC8E",
  },
  {
    name: "Program",
    desc: "Strona internetowa (Dział Tech), scena i atrakcje eventowe (Dział Sceniczny).",
    icon: "💻",
    color: "#ED3939",
  },
];

export default function ONasPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Tło */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#0B4282"
          color2="#1a0b5e"
          color3="#112244"
          timeSpeed={0.15}
          warpStrength={0.6}
          warpFrequency={4.0}
          contrast={1.3}
          grainAmount={0.08}
          zoom={0.9}
        />
        <div className="absolute inset-0 bg-black/45" />
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

      <main className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center px-8 sm:px-16 md:px-28 pt-24 pb-16">
          <div className="max-w-3xl space-y-6">
            <Link
              href="/"
              className="cursor-target text-xs text-zinc-500 hover:text-brand-yellow tracking-widest uppercase transition-colors"
            >
              ← Strona główna
            </Link>
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-brand-blue px-3 py-1.5 bg-brand-blue/10 rounded-full border border-brand-blue/30 mt-4">
              Kim jesteśmy
            </span>
            <h1 className="text-5xl sm:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-brand-white via-brand-yellow to-brand-orange leading-none">
              O Nas
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              Sun Run to całkowicie oddolna inicjatywa lubelskiej młodzieży, stworzona z pasji
              do sportu i potrzeby serca. Wszystko organizujemy sami — od logistyki,
              przez promocję, po stronę internetową, którą właśnie oglądasz.
            </p>
          </div>
        </section>

        {/* Misja */}
        <section className="py-20 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <div className="bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow block mb-4">
                Nasza misja
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-brand-white mb-6">
                Sport w służbie dobrego celu
              </h2>
              <div className="grid sm:grid-cols-2 gap-8 text-sm text-zinc-300 leading-relaxed">
                <p>
                  Sun Run powstało z prostego przekonania: bieganie łączy ludzi,
                  a wspólny wysiłek może dawać realną pomoc tym, którzy jej potrzebują.
                  Każda złotówka zebrana podczas biegu trafia bezpośrednio do{" "}
                  <a
                    href="https://hospicjum.lublin.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-yellow hover:underline"
                  >
                    Hospicjum Dobrego Samarytanina
                  </a>{" "}
                  w Lublinie.
                </p>
                <p>
                  I edycja w 2025 roku zebrała uczestników powyżej 350 osób
                  i pomogła sfinansować materace przeciwodleżynowe oraz prace
                  nad całorocznym ogrodem hospicyjnym. II edycja będzie jeszcze
                  większa — dołącz do nas!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Struktura organizacyjna */}
        <section className="py-20 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block mb-3">
              Struktura
            </span>
            <h2 className="text-3xl font-black uppercase text-brand-white mb-10">
              Gałęzie organizacyjne
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {BRANCHES.map((b) => (
                <div
                  key={b.name}
                  className="bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{b.icon}</span>
                    <h3
                      className="font-black uppercase text-lg"
                      style={{ color: b.color }}
                    >
                      {b.name}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zespół */}
        <section className="py-20 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red block mb-3">
              Kluczowe osoby
            </span>
            <h2 className="text-3xl font-black uppercase text-brand-white mb-10">
              Zespół
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map((t) => (
                <div
                  key={t.name}
                  className="bg-zinc-950/60 border border-zinc-800/60 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-3"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-zinc-950 mb-1"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-1">
                      {t.role}
                    </p>
                    <p className="font-black text-brand-white">{t.name}</p>
                    <p className="text-xs text-zinc-600 mt-1">{t.org}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-600 mt-8 max-w-2xl">
              Za sukcesem Sun Run stoi cała ekipa wolontariuszy i współorganizatorów
              — lista wszystkich zaangażowanych osób zostanie opublikowana po zakończeniu II edycji.
            </p>
          </div>
        </section>

        {/* Droga komunikacji */}
        <section className="py-20 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <div className="bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow block mb-4">
                Komunikacja
              </span>
              <h2 className="text-2xl font-black uppercase text-brand-white mb-6">
                Droga komunikacyjna
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {[
                  { label: "Deweloper (Miłosz)", color: "#0B4282" },
                  { label: "→" },
                  { label: "Wiktor (Tech Lead)", color: "#ED3939" },
                  { label: "→" },
                  { label: "Tosia Polkowska (Koord. Program)", color: "#EB8714" },
                  { label: "→" },
                  { label: "Jakub Delega (Lider)", color: "#FFEC8E" },
                ].map((item, i) =>
                  item.label === "→" ? (
                    <span key={i} className="text-zinc-600 font-bold text-lg">
                      →
                    </span>
                  ) : (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-zinc-950"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-8 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-black uppercase text-brand-white">
              Dołącz do nas!
            </h2>
            <p className="text-sm text-zinc-400">
              Szukamy wolontariuszy do II edycji. Napisz do nas!
            </p>
            <a
              href="mailto:sunrunlublin@gmail.com"
              className="cursor-target inline-flex items-center justify-center px-8 py-3.5 bg-brand-yellow hover:bg-brand-yellow/90 text-zinc-950 font-black rounded-full text-sm tracking-widest uppercase transition-all"
            >
              Skontaktuj się →
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
