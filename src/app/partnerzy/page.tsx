// @ts-nocheck
"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Roboto_Flex } from "next/font/google";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/navbar";
import TargetCursor from "@/components/TargetCursor";
import RotatingText from "@/components/RotatingText";
import VariableProximity from "@/components/VariableProximity";
import ScrollFloat from "@/components/ScrollFloat";

const Grainient = dynamic(() => import("@/components/Grainient"), { ssr: false });
const FallingText = dynamic(() => import("@/components/FallingText"), { ssr: false });

// Czcionka variable dla efektu VariableProximity — oś wagi (wght) jest
// zmienna domyślnie, oś rozmiaru optycznego (opsz) dodajemy jawnie.
const robotoFlex = Roboto_Flex({ subsets: ["latin", "latin-ext"], axes: ["opsz"] });

// Pula 10 słów — przy każdym wejściu na stronę losujemy z niej 3,
// które przewijają się w sekcji "Bo bieganie to...".
const WORD_POOL = [
  "zdrowie",
  "radość",
  "wspólnota",
  "energia",
  "pomoc",
  "przyszłość",
  "wolność",
  "spełnienie",
  "siła",
  "nadzieja",
];

const PROXIMITY_LINES = [
  "W 2025 zaufało nam 350+ biegaczy.",
  "100% środków trafiło do hospicjum.",
  "Same dobre opinie i zero żalu.",
  "W 2026 celujemy w 500+ osób.",
  "Zero ukrytych kosztów.",
  "Realny wpływ, nie puste obietnice.",
  "Widzimy się na starcie.",
];

// Zachowane kotwice (#dkms itd.) — linki z kafelków na stronie głównej
const PARTNERS = [
  { id: "dkms", name: "DKMS", category: "Partner Strategiczny", impact: "Rejestracja dawców szpiku", color: "#ED3939" },
  { id: "vivo", name: "VIVO! Lublin", category: "Partner Medialny", impact: "Promocja w centrum handlowym", color: "#0B4282" },
  { id: "as-babuni", name: "AS Babuni", category: "Partner Gastronomiczny", impact: "Catering i strefa food", color: "#EB8714" },
  { id: "datasport", name: "Datasport", category: "Partner Techniczny", impact: "Elektroniczny pomiar czasu", color: "#0B4282" },
  { id: "up-lublin", name: "UP Lublin", category: "Patronat Honorowy", impact: "Patronat honorowy", color: "#EB8714" },
];

const PACKAGES = [
  { name: "Złoty", color: "#E0B34A", perks: "Logo na koszulkach · stoisko 6×3m · baner start/meta · dedykowany post · 5 pakietów startowych" },
  { name: "Srebrny", color: "#9AA3AE", perks: "Logo na stronie · stoisko 3×3m · komunikaty prasowe · 3 pakiety startowe" },
  { name: "Brązowy", color: "#EB8714", perks: "Logo na stronie · materiały reklamowe · 1 pakiet startowy" },
];

export default function PartnerzyPage() {
  const [contactSent, setContactSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const proximityContainerRef = useRef(null);
  const rotatingSectionRef = useRef(null);
  const rotatingTextRef = useRef(null);
  const scrollFloatSectionRef = useRef(null);

  // Losujemy 3 słowa z puli 10 przy każdym wejściu na stronę.
  const [rotatingWords, setRotatingWords] = useState<string[]>([]);
  React.useEffect(() => {
    const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);
    setRotatingWords(shuffled.slice(0, 3));
  }, []);

  // Sekcja "Bo bieganie to..." przypina się na czas scrollowania (pin),
  // a 3 wylosowane słowa zmieniają się w rytm scrolla zamiast timera.
  // Pin obejmuje tylko tyle scrolla, ile trzeba na 3 słowa — dłuższy dystans
  // na słowo = płynniej, bez zacinania.
  React.useEffect(() => {
    if (rotatingWords.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: rotatingSectionRef.current,
      start: "top top",
      end: "+=1500",
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const idx = Math.min(
          rotatingWords.length - 1,
          Math.floor(self.progress * rotatingWords.length)
        );
        rotatingTextRef.current?.jumpTo(idx);
      },
    });
    // po zamontowaniu tekstu odśwież pozycje pinu
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [rotatingWords]);

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: data.get("company"),
          name: data.get("name"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error();
      setContactSent(true);
    } catch {
      setSendError("Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub napisz bezpośrednio na sunrunlublin@gmail.com");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F5F1E8] text-[#1A1712] overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#F7DFA8"
          color2="#F1E7D6"
          color3="#EAD6B0"
          timeSpeed={0.35}
          warpStrength={0.7}
          warpFrequency={4.5}
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
        {/* ═══════════════════════════════════════
            HERO — Dla Partnerów
        ═══════════════════════════════════════ */}
        <section className="min-h-screen flex items-center px-8 sm:px-16 md:px-28 pt-24 pb-16">
          <div className="w-full grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
            <div className="max-w-2xl space-y-8">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-brand-orange via-brand-orange to-brand-red leading-none">
                Dla<br />Partnerów
              </h1>
              <p className="text-lg sm:text-2xl text-[#3A342B] leading-relaxed max-w-xl font-semibold">
                Zjedź niżej. Mamy Ci coś do pokazania.
              </p>
              <div className="pt-4 text-brand-orange animate-bounce text-5xl select-none">↓</div>
            </div>

            {/* Zdjęcie partnera — Uniwersytet Jazdy */}
            <div className="hidden lg:block relative w-full max-w-md mx-auto aspect-[4/5] rounded-3xl overflow-hidden border border-[#E2DBCC] shadow-2xl">
              <img
                src="/photos/uniwersytet-jazdy.webp"
                alt="Ekipa Uniwersytetu Jazdy — partner Sun Run"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            AKT I — HEJT (FallingText)
            Tekst hejtujący bieganie rozsypuje się przy scrollu
        ═══════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12">
          <div className="max-w-4xl mx-auto w-full text-center mb-6">
            <span className="text-2xl sm:text-4xl font-black uppercase tracking-[0.15em] text-[#3A342B]">
              Niektórzy mówią...
            </span>
          </div>
          <div className="max-w-4xl mx-auto w-full h-[60vh] font-bold text-[#3A342B]">
            <FallingText
              text="Przecież bieganie to nuda. Nikt nie przyjdzie. Bieg charytatywny? Strata czasu i pieniędzy. To się nie uda. Nikogo to nie obchodzi. Bez sensu. Szkoda zachodu. Kompletna porażka."
              highlightWords={["nuda.", "Nikt", "Strata", "nie", "Nikogo", "Bez", "sensu.", "porażka."]}
              highlightClass="falling-hate"
              trigger="scroll"
              gravity={0.6}
              fontSize="clamp(1.3rem, 3vw, 2.4rem)"
              mouseConstraintStiffness={0.55}
            />
          </div>
          <p className="text-center text-base sm:text-xl font-bold text-[#6B6357] uppercase tracking-widest mt-2 select-none">
            ...i cały ten hejt właśnie się rozsypał
          </p>
        </section>

        {/* ═══════════════════════════════════════
            AKT II — PRAWDA (RotatingText)
            "Bieganie to" + rotujące słowa
        ═══════════════════════════════════════ */}
        <section
          ref={rotatingSectionRef}
          className="h-screen flex items-center justify-center px-6 sm:px-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-4xl sm:text-6xl font-black uppercase">
            <span className="text-[#1A1712]">Bo bieganie to</span>
            {rotatingWords.length > 0 && (
            <RotatingText
              ref={rotatingTextRef}
              texts={rotatingWords}
              auto={false}
              mainClassName="px-4 sm:px-6 py-1 sm:py-2 bg-brand-orange text-white rounded-2xl overflow-hidden justify-center"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            />
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            AKT III — DOWODY (VariableProximity)
            Interaktywny tekst reagujący na kursor
        ═══════════════════════════════════════ */}
        <section className="min-h-[90vh] flex items-center px-8 sm:px-16 md:px-28">
          <div
            ref={proximityContainerRef}
            style={{ position: "relative" }}
            className="w-full mx-auto text-center space-y-10"
          >
            <span className="text-sm sm:text-base font-bold uppercase tracking-[0.3em] text-brand-orange block">
              Liczby nie kłamią
            </span>
            <div className={`${robotoFlex.className} space-y-6 sm:space-y-8 text-3xl sm:text-5xl md:text-7xl leading-tight text-[#1A1712]`}>
              {PROXIMITY_LINES.map((line) => (
                <p key={line} className="whitespace-nowrap">
                  <VariableProximity
                    label={line}
                    fromFontVariationSettings="'wght' 400, 'opsz' 9"
                    toFontVariationSettings="'wght' 1000, 'opsz' 40"
                    containerRef={proximityContainerRef}
                    radius={100}
                    falloff="linear"
                  />
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            AKT IV — DECYZJA (ScrollFloat)
            "Wybierz Sun Run" na cały ekran
        ═══════════════════════════════════════ */}
        <section ref={scrollFloatSectionRef} className="min-h-screen flex items-center justify-center px-6">
          <ScrollFloat
            triggerRef={scrollFloatSectionRef}
            pin
            scrub
            animationDuration={1.1}
            ease="back.inOut(2)"
            scrollStart="top top"
            scrollEnd="+=700"
            stagger={0.06}
            containerClassName="text-center"
            textClassName="text-5xl sm:text-7xl md:text-8xl font-black uppercase text-brand-orange"
          >
            Wybierz Sun Run
          </ScrollFloat>
        </section>

        {/* ═══════════════════════════════════════
            AKT V — WSPÓŁPRACA (minimalistyczne info + forms)
        ═══════════════════════════════════════ */}
        <section className="py-24 px-8 sm:px-16 md:px-28">
          <div className="max-w-2xl mx-auto space-y-16">
            {/* Pakiety — minimalistycznie */}
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block">
                Pakiety partnerskie
              </span>
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className="group flex items-start gap-4 border-b border-[#E2DBCC] pb-5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: pkg.color }}
                  />
                  <div>
                    <p className="font-black text-lg text-[#1A1712] uppercase tracking-wide">
                      Partner {pkg.name}
                    </p>
                    <p className="text-sm text-[#6B6357] mt-1 leading-relaxed">{pkg.perks}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-[#9A9080]">
                Wycena indywidualna — każdy pakiet negocjowalny.
              </p>
            </div>

            {/* Partnerzy I edycji — minimalna lista z kotwicami */}
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red block">
                Zaufali nam w 2025
              </span>
              <div className="flex flex-wrap gap-3">
                {PARTNERS.map((p) => (
                  <div
                    key={p.id}
                    id={p.id}
                    className="flex items-center gap-2.5 px-4 py-2 bg-white/70 border border-[#E2DBCC] rounded-full scroll-mt-32"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-bold text-[#3A342B]">{p.name}</span>
                    <span className="text-xs text-[#9A9080] hidden sm:inline">· {p.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formularz */}
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block mb-3">
                Kontakt
              </span>
              <h2 className="text-3xl font-black uppercase text-[#1A1712] mb-3">
                Porozmawiajmy
              </h2>
              <p className="text-sm text-[#6B6357] mb-8">
                Wypełnij formularz — odezwiemy się najszybciej jak to możliwe.
              </p>

              {contactSent ? (
                <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-8 text-center">
                  <p className="text-brand-orange font-bold text-lg">Dziękujemy!</p>
                  <p className="text-sm text-[#6B6357] mt-2">
                    Twoje zgłoszenie zostało zapisane — odezwiemy się najszybciej jak to możliwe.
                    W pilnych sprawach napisz bezpośrednio na{" "}
                    <a href="mailto:sunrunlublin@gmail.com" className="text-brand-orange underline">
                      sunrunlublin@gmail.com
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-4">
                  {[
                    { name: "company", label: "Firma / Organizacja", type: "text", required: true },
                    { name: "name", label: "Osoba kontaktowa", type: "text", required: true },
                    { name: "phone", label: "Telefon (opcjonalnie)", type: "tel", required: false },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="block text-xs text-[#6B6357] uppercase tracking-widest mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        name={f.name}
                        required={f.required}
                        className="w-full bg-white/80 border border-[#E2DBCC] focus:border-brand-orange rounded-xl px-4 py-3 text-sm text-[#1A1712] placeholder-[#9A9080] outline-none transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-[#6B6357] uppercase tracking-widest mb-1.5">
                      Wiadomość
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      placeholder="Opisz swoje oczekiwania, rodzaj działalności i pakiet, który Cię interesuje..."
                      className="w-full bg-white/80 border border-[#E2DBCC] focus:border-brand-orange rounded-xl px-4 py-3 text-sm text-[#1A1712] placeholder-[#9A9080] outline-none transition-colors resize-none"
                    />
                  </div>
                  {sendError && <p className="text-sm text-brand-red">{sendError}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="cursor-target w-full py-3.5 bg-brand-orange hover:bg-brand-orange/90 disabled:opacity-60 text-white font-black rounded-full text-sm tracking-widest uppercase transition-all"
                  >
                    {sending ? "Wysyłanie..." : "Wyślij zapytanie →"}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-8 border-t border-[#E2DBCC]">
                <p className="text-xs text-[#6B6357] uppercase tracking-widest mb-1">Email bezpośredni</p>
                <a
                  href="mailto:sunrunlublin@gmail.com"
                  className="text-brand-orange hover:underline text-sm font-bold"
                >
                  sunrunlublin@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
