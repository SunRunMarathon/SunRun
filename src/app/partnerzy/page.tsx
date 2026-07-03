"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import TargetCursor from "@/components/TargetCursor";

const Grainient = dynamic(() => import("@/components/Grainient"), { ssr: false });

const PARTNERS = [
  {
    id: "dkms",
    name: "DKMS",
    category: "Partner Strategiczny",
    desc: "DKMS prowadził podczas I edycji Sun Run mobilny punkt rejestracji potencjalnych dawców szpiku kostnego. Dzięki tej współpracy wielu uczestników dołączyło do bazy dawców.",
    impact: "Rejestracja dawców szpiku",
    url: "https://dkms.pl",
    color: "#ED3939",
  },
  {
    id: "vivo",
    name: "VIVO! Lublin",
    category: "Partner Medialny",
    desc: "VIVO! Lublin wspierało promocję I edycji Sun Run, zapewniając widoczność wśród klientów centrum handlowego i wzmacniając zasięg naszego przekazu w aglomeracji lubelskiej.",
    impact: "Promocja w centrum handlowym",
    url: "https://vivolublin.pl",
    color: "#0B4282",
  },
  {
    id: "as-babuni",
    name: "AS Babuni",
    category: "Partner Gastronomiczny",
    desc: "AS Babuni zapewniało catering i stoisko gastronomiczne dla uczestników biegu w strefie miasteczka biegowego. Pycha!",
    impact: "Catering i strefa food",
    url: "#",
    color: "#EB8714",
  },
  {
    id: "datasport",
    name: "Datasport",
    category: "Partner Techniczny",
    desc: "Datasport obsługiwał profesjonalny pomiar czasu i prowadził klasyfikacje biegu: kategorię OPEN (brutto) oraz kategorie wiekowe 14+, 30+, 50+ (netto).",
    impact: "Elektroniczny pomiar czasu",
    url: "https://datasport.pl",
    color: "#E8EBF7",
  },
  {
    id: "up-lublin",
    name: "UP Lublin",
    category: "Patronat Honorowy",
    desc: "Uniwersytet Przyrodniczy w Lublinie objął I edycję Sun Run honorowym patronatem, podkreślając wagę inicjatywy dla lokalnej społeczności.",
    impact: "Patronat honorowy",
    url: "https://up.lublin.pl",
    color: "#FFEC8E",
  },
];

const PACKAGES = [
  {
    name: "Partner Złoty",
    price: "Indywidualny",
    features: [
      "Logo na koszulkach uczestników",
      "Stoisko 6×3m w miasteczku biegowym",
      "Baner start/meta",
      "Dedykowany post w social media",
      "Logo na stronie internetowej",
      "5 darmowych pakietów startowych",
    ],
    color: "#FFEC8E",
    highlighted: true,
  },
  {
    name: "Partner Srebrny",
    price: "Indywidualny",
    features: [
      "Logo na stronie internetowej",
      "Stoisko 3×3m w miasteczku",
      "Wzmianki w komunikatach prasowych",
      "3 darmowe pakiety startowe",
    ],
    color: "#E8EBF7",
    highlighted: false,
  },
  {
    name: "Partner Brązowy",
    price: "Indywidualny",
    features: [
      "Logo na stronie internetowej",
      "Materiały reklamowe na bieg",
      "1 darmowy pakiet startowy",
    ],
    color: "#EB8714",
    highlighted: false,
  },
];

export default function PartnerzyPage() {
  const [contactSent, setContactSent] = useState(false);

  const handleContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const mailto =
      `mailto:sunrunlublin@gmail.com` +
      `?subject=${encodeURIComponent(`Zapytanie o partnerstwo - ${data.get("company")}`)}&body=${encodeURIComponent(
        `Firma/Organizacja: ${data.get("company")}\nOsoba kontaktowa: ${data.get("name")}\nTelefon: ${data.get("phone")}\n\nWiadomość:\n${data.get("message")}`
      )}`;
    window.location.href = mailto;
    setContactSent(true);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#EB8714"
          color2="#3d1a00"
          color3="#1a0e00"
          timeSpeed={0.18}
          warpStrength={0.7}
          warpFrequency={4.5}
          contrast={1.4}
          grainAmount={0.08}
          zoom={0.9}
        />
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
            <Link href="/" className="cursor-target text-xs text-zinc-500 hover:text-brand-yellow tracking-widest uppercase transition-colors">
              ← Strona główna
            </Link>
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-brand-orange px-3 py-1.5 bg-brand-orange/10 rounded-full border border-brand-orange/30 mt-4">
              Współpraca biznesowa
            </span>
            <h1 className="text-5xl sm:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-red leading-none">
              Dla<br />Partnerów
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              Sun Run to wyjątkowa okazja, by Twoja marka pojawiła się w centrum aktywnej,
              zaangażowanej społeczności Lublina. W I edycji wzięło udział ponad{" "}
              <strong className="text-brand-white">350 uczestników</strong> — w 2026 chcemy przekroczyć{" "}
              <strong className="text-brand-white">500 osób</strong>.
            </p>
          </div>
        </section>

        {/* Statystyki z I edycji */}
        <section className="py-16 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow block mb-3">
              I edycja 2025 — wyniki
            </span>
            <h2 className="text-3xl font-black uppercase text-brand-white mb-10">
              Dlaczego warto?
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { val: "350+", label: "uczestników biegu", color: "#FFEC8E" },
                { val: "5 km", label: "trasa przez Park Ludowy", color: "#EB8714" },
                { val: "4+", label: "mediów i patronatów", color: "#ED3939" },
                { val: "100%", label: "środki dla hospicjum", color: "#0B4282" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-zinc-950/60 border border-zinc-800/60 backdrop-blur-sm rounded-2xl p-6 text-center"
                >
                  <p className="text-4xl font-black" style={{ color: s.color }}>
                    {s.val}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pakiety sponsorskie */}
        <section className="py-16 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange block mb-3">
              Oferta
            </span>
            <h2 className="text-3xl font-black uppercase text-brand-white mb-10">
              Pakiety partnerskie
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`rounded-3xl p-7 flex flex-col gap-4 border backdrop-blur-sm ${
                    pkg.highlighted
                      ? "bg-zinc-900/80 border-brand-yellow/40 shadow-2xl shadow-brand-yellow/10 scale-105 z-10"
                      : "bg-zinc-950/60 border-zinc-800/60"
                  }`}
                >
                  <div
                    className="w-10 h-1.5 rounded-full mb-1"
                    style={{ backgroundColor: pkg.color }}
                  />
                  <h3 className="font-black text-xl text-brand-white">{pkg.name}</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">
                    Wycena: {pkg.price}
                  </p>
                  <ul className="space-y-2 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: pkg.color }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              * Wszystkie pakiety są negocjowalne. Skontaktuj się z nami, by omówić indywidualne warunki.
            </p>
          </div>
        </section>

        {/* Partnerzy z I edycji */}
        <section className="py-16 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red block mb-3">
              Zaufali nam
            </span>
            <h2 className="text-3xl font-black uppercase text-brand-white mb-10">
              Partnerzy I edycji
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {PARTNERS.map((p) => (
                <div
                  key={p.id}
                  id={p.id}
                  className="bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-zinc-950"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-black text-brand-white">{p.name}</h3>
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: p.color }}
                      >
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600">{p.impact}</span>
                    {p.url !== "#" && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-brand-yellow transition-colors"
                      >
                        Odwiedź stronę →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formularz kontaktowy */}
        <section className="py-20 px-8 sm:px-16 md:px-28">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow block mb-3">
              Kontakt
            </span>
            <h2 className="text-3xl font-black uppercase text-brand-white mb-3">
              Zainteresowany partnerstwem?
            </h2>
            <p className="text-sm text-zinc-400 mb-8">
              Napisz do nas lub wypełnij formularz — skontaktujemy się najszybciej jak to możliwe.
            </p>

            {contactSent ? (
              <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl p-8 text-center">
                <p className="text-brand-yellow font-bold text-lg">Dziękujemy!</p>
                <p className="text-sm text-zinc-400 mt-2">
                  Otworzyliśmy Twój klient pocztowy. Jeśli to nie zadziałało, napisz bezpośrednio na{" "}
                  <a href="mailto:sunrunlublin@gmail.com" className="text-brand-yellow underline">
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
                    <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      required={f.required}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-brand-yellow/50 rounded-xl px-4 py-3 text-sm text-brand-white placeholder-zinc-600 outline-none transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
                    Wiadomość
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder="Opisz swoje oczekiwania, rodzaj działalności i pakiet, który Cię interesuje..."
                    className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-brand-yellow/50 rounded-xl px-4 py-3 text-sm text-brand-white placeholder-zinc-600 outline-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="cursor-target w-full py-3.5 bg-brand-yellow hover:bg-brand-yellow/90 text-zinc-950 font-black rounded-full text-sm tracking-widest uppercase transition-all"
                >
                  Wyślij zapytanie →
                </button>
              </form>
            )}

            <div className="mt-8 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Email bezpośredni</p>
                <a
                  href="mailto:sunrunlublin@gmail.com"
                  className="text-brand-yellow hover:underline text-sm font-bold"
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
