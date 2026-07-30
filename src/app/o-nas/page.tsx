"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import TargetCursor from "@/components/TargetCursor";


const TEAM = [
  {
    role: "Lider Projektu",
    name: "Jakub Delega",
    org: "III LO im. Unii Lubelskiej",
    color: "#CE2F25",
  },
  {
    role: "Koordynator Gałęzi Program",
    name: "Tosia Polkowska",
    org: "Gałąź Program",
    color: "#CE2F25",
  },
  {
    role: "Lider Zespołu Technicznego",
    name: "Wiktor",
    org: "Gałąź Program · Dział Tech",
    color: "#CE2F25",
  },
  {
    role: "Główny Deweloper",
    name: "Miłosz Kamiński",
    org: "Gałąź Program · Dział Tech",
    color: "#183153",
  },
];

const BRANCHES = [
  {
    name: "Administracja",
    desc: "Zarządzanie dokumentacją, koordynacja wewnętrzna, obsługa formalna.",
    icon: "📋",
    color: "#183153",
  },
  {
    name: "Wykonanie",
    desc: "Logistyka, obsługa trasy, miasteczko biegowe, punkt startu i mety.",
    icon: "🏃",
    color: "#CE2F25",
  },
  {
    name: "Promocja",
    desc: "Media społecznościowe, materiały graficzne, PR, kontakt z mediami.",
    icon: "📣",
    color: "#CE2F25",
  },
  {
    name: "Program",
    desc: "Strona internetowa (Dział Tech), scena i atrakcje eventowe (Dział Sceniczny).",
    icon: "💻",
    color: "#183153",
  },
];

export default function ONasPage() {
  return (
    <div className="relative min-h-screen bg-sr-sand text-sr-navy overflow-x-hidden">

      <Navbar />
      <TargetCursor
        spinDuration={3}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#183153"
        cursorColorOnTarget="#FE8004"
        targetSelector=".cursor-target"
      />

      <main className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex items-center px-8 sm:px-16 md:px-28 pt-24 pb-16">
          <div className="w-full grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
            <div className="max-w-3xl space-y-6">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-sr-navy px-3 py-1.5 bg-sr-navy/10 rounded-full border border-sr-navy/30">
                Kim jesteśmy
              </span>
              <h1 className="text-5xl sm:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-sr-navy via-sr-navy to-sr-red leading-none">
                O Nas
              </h1>
              <p className="text-base sm:text-lg text-[#183153] leading-relaxed max-w-2xl">
                Sun Run to całkowicie oddolna inicjatywa lubelskiej młodzieży, stworzona z pasji
                do sportu i potrzeby serca. Wszystko organizujemy sami — od logistyki,
                przez promocję, po stronę internetową, którą właśnie oglądasz.
              </p>
            </div>

            {/* Zdjęcie ekipy — prawa strona hero */}
            <div className="hidden lg:block relative aspect-[4/3] rounded-3xl overflow-hidden border border-sr-line shadow-2xl">
              <img
                src="/photos/ekipa.webp"
                alt="Ekipa Sun Run 2025 — organizatorzy i wolontariusze"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Misja */}
        <section className="py-12 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/70 border border-sr-line backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block mb-4">
                Nasza misja
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#183153] mb-6">
                Sport w służbie dobrego celu
              </h2>
              <div className="grid sm:grid-cols-2 gap-8 text-sm text-[#183153] leading-relaxed">
                <p>
                  Sun Run powstało z prostego przekonania: bieganie łączy ludzi,
                  a wspólny wysiłek może dawać realną pomoc tym, którzy jej potrzebują.
                  Każda złotówka zebrana podczas biegu trafia bezpośrednio do{" "}
                  <a
                    href="https://hospicjum.lublin.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sr-red font-semibold hover:underline"
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
        <section className="py-12 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block mb-3">
              Struktura
            </span>
            <h2 className="text-3xl font-black uppercase text-[#183153] mb-10">
              Gałęzie organizacyjne
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {BRANCHES.map((b) => (
                <div
                  key={b.name}
                  className="bg-white/70 border border-sr-line hover:border-sr-line backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 group shadow-sm"
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
                  <p className="text-sm text-[#3D4D65] leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zespół */}
        <section className="py-12 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block mb-3">
              Kluczowe osoby
            </span>
            <h2 className="text-3xl font-black uppercase text-[#183153] mb-10">
              Zespół
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map((t) => (
                <div
                  key={t.name}
                  className="bg-white/70 border border-sr-line backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-3 shadow-sm"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white mb-1"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-[#3D4D65] mb-1">
                      {t.role}
                    </p>
                    <p className="font-black text-[#183153]">{t.name}</p>
                    <p className="text-xs text-[#3D4D65] mt-1">{t.org}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#3D4D65] mt-8 max-w-2xl">
              Za sukcesem Sun Run stoi cała ekipa wolontariuszy i współorganizatorów
              — lista wszystkich zaangażowanych osób zostanie opublikowana po zakończeniu II edycji.
            </p>
          </div>
        </section>

        {/* Droga komunikacji */}
        <section className="py-12 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/70 border border-sr-line backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block mb-4">
                Komunikacja
              </span>
              <h2 className="text-2xl font-black uppercase text-[#183153] mb-6">
                Droga komunikacyjna
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {[
                  { label: "Deweloper (Miłosz)", color: "#183153" },
                  { label: "→" },
                  { label: "Wiktor (Tech Lead)", color: "#CE2F25" },
                  { label: "→" },
                  { label: "Tosia Polkowska (Koord. Program)", color: "#CE2F25" },
                  { label: "→" },
                  { label: "Jakub Delega (Lider)", color: "#183153" },
                ].map((item, i) =>
                  item.label === "→" ? (
                    <span key={i} className="text-[#3D4D65] font-bold text-lg">
                      →
                    </span>
                  ) : (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
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
        <section className="py-16 px-8 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-black uppercase text-[#183153]">
              Dołącz do nas!
            </h2>
            <p className="text-sm text-[#3D4D65]">
              Szukamy wolontariuszy do II edycji. Napisz do nas!
            </p>
            <a
              href="mailto:sunrunlublin@gmail.com"
              className="cursor-target inline-flex items-center justify-center px-8 py-3.5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
            >
              Skontaktuj się →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
