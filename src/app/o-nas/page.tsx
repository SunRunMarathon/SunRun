"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import TargetCursor from "@/components/TargetCursor";

// Stałe TEAM i BRANCHES zniknęły razem z sekcjami „Struktura", „Zespół"
// i „Droga komunikacji" — bez nich były już tylko martwym kodem. Gdyby
// któraś z tych sekcji wracała, dane są w historii gita.

export default function ONasPage() {
  return (
    <div className="relative min-h-screen bg-sr-sand text-sr-navy overflow-x-hidden">

      <Navbar />
      <TargetCursor
        spinDuration={3}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#183153"
        cursorColorOnTarget="#CE2F25"
        targetSelector=".cursor-target"
      />

      <main className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex items-center px-8 sm:px-16 md:px-28 pt-24 pb-16">
          <div className="w-full grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
            <div className="max-w-3xl space-y-6">
              {/* Czerwona plakietka — ten sam wariant co na górze /archiwum */}
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-sr-red px-3 py-1.5 bg-sr-red/10 rounded-full border border-sr-red/30">
                Kim jesteśmy
              </span>
              {/* w-fit z tego samego powodu co przy „Nasza misja": bg-clip-text
                  bierze tło CAŁEGO pudełka. Tu gradient jest pionowy, więc
                  o krańce dba wysokość, ale bez w-fit nagłówek rozciągałby się
                  na całą kolumnę i gradient miałby zbędny zapas na boki. */}
              <h1 className="w-fit text-5xl sm:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#183153] to-[#FE8004] leading-none">
                O Nas
              </h1>
              <p className="text-base sm:text-lg text-[#183153] leading-relaxed max-w-2xl">
                Jesteśmy zespołem około 60 młodych osób – uczniów szkół średnich i studentów
                – których połączyła wspólna idea stworzenia wydarzenia z realnym wpływem
                na innych. Sun Run powstał z pasji, zaangażowania i przekonania, że nawet
                niewielkie działania mogą zmieniać czyjeś życie.
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
                    href="https://hospicjum-samarytanin.pl"
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
