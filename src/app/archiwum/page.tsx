"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// gsap w TargetCursor jest bezuzyteczny na dotyku — dynamic + ssr:false, zeby
// jego JS w ogole nie trafial do bundle'a mobile (patrz src/app/page.tsx).
const TargetCursor = dynamic(() => import("@/components/TargetCursor"), { ssr: false });


const ARTICLES = [
  {
    title: "Pobiegli i pomogli. Wyjątkowy bieg dla Hospicjum Dobrego Samarytanina w Lublinie",
    source: "Kurier Lubelski",
    date: "8 września 2025",
    excerpt: "Relacja z pierwszej edycji biegu w Parku Ludowym, w którym wzięło udział ponad 350 osób.",
    url: "https://kurierlubelski.pl/pobiegli-i-pomogli-wyjatkowy-bieg-dla-hospicjum-dobrego-samarytanina-w-lublinie/ar/c2p2-27946763",
    // color = kolor PLAMY po lewej krawędzi kafelka, nie tekstu
    color: "#FED46D",
  },
  {
    title: "Bieg charytatywny dla Hospicjum Dobrego Samarytanina. Trwają zapisy na Sun Run",
    source: "Lublin24.pl",
    date: "31 lipca 2025",
    excerpt: "Zapowiedź biegu na 5 km w Parku Ludowym - zebrane środki miały trafić na materace przeciwodleżynowe dla hospicjum.",
    url: "https://lublin24.pl/zapowiedzi-imprez-w-lublinie/bieg-charytatywny-dla-hospicjum-dobrego-samarytanina-trwaja-zapisy-na-sun-run/shZf9LfjNIkGP8rtrwGg",
    color: "#F6941D",
  },
  {
    title: "Sun Run 2025 - Bieg Charytatywny",
    source: "Radio Lublin",
    date: "6 września 2025",
    excerpt: "Zapowiedź wydarzenia w Parku Ludowym - biegowi towarzyszyły festyn, koncert i animacje dla najmłodszych.",
    url: "https://radio.lublin.pl/events/sun-run-2025-bieg-charytatywny/",
    color: "#F94C1F",
  },
  {
    title: "Sun Run dla Hospicjum Dobrego Samarytanina",
    source: "running.life",
    date: "6 września 2025",
    excerpt: "Karta wydarzenia w serwisie biegowym - trasa, zapisy i cel charytatywny biegu w Lublinie.",
    url: "https://running.life/pl/wydarzenie/sun-run-dla-hospicjum-dobrego-samarytanina",
    color: "#183153",
  },
];

// UWAGA: odstęp w „~13800 zł" to TWARDA SPACJA (U+00A0), w edytorze nie do
// odróżnienia od zwykłej. Trzyma kwotę w jednej linii — przy zwykłej spacji
// „zł" spadało pod spód i kafelek był o wiersz wyższy od pozostałych.
const STATS_2025 = [
  { val: "363", label: "uczestników" },
  { val: "5 km", label: "dystans" },
  { val: "6.09.2025", label: "data biegu" },
  { val: "~13800 zł", label: "zebrane środki" },
];

// Zdjęcia z I edycji, przekazane przez sztab. Oryginały mają po ~6000px
// i 5–14 MB; tutaj są przeskalowane do 640px i przepuszczone przez WebP,
// bo kafelek w siatce ma najwyżej ~280px. Nazwy plików odpowiadają
// oryginałom z aparatów, żeby dało się do nich wrócić.
const GALLERY_IMAGES = [
  "/photos/2025/dsc05311.webp",
  "/photos/2025/dsc05316.webp",
  "/photos/2025/dsc05350.webp",
  "/photos/2025/dsc05352.webp",
  "/photos/2025/dsc05359.webp",
  "/photos/2025/dsc05371.webp",
  "/photos/2025/dsc05407.webp",
  "/photos/2025/dsc05435.webp",
  "/photos/2025/dsc05442.webp",
  "/photos/2025/dsc05476.webp",
  "/photos/2025/dsc05504.webp",
  "/photos/2025/dsc05531.webp",
  "/photos/2025/dsc_0588.webp",
  "/photos/2025/dsc_0593.webp",
  "/photos/2025/dsc_0602.webp",
  "/photos/2025/dsc_0605.webp",
  "/photos/2025/dsc_0607.webp",
  "/photos/2025/dsc_0639.webp",
  "/photos/2025/dsc_0677.webp",
  "/photos/2025/dsc_0758.webp",
  "/photos/2025/dsc_0863.webp",
  "/photos/2025/dsc_0922.webp",
  "/photos/2025/dsc_0956.webp",
  "/photos/2025/dsc_1132.webp",
  "/photos/2025/dsc_1181.webp",
  "/photos/2025/dsc_1226.webp",
  "/photos/2025/dsc_4508.webp",
  "/photos/2025/dsc_4655.webp",
  "/photos/2025/dsc_4728.webp",
  "/photos/2025/dsc_4738.webp",
  "/photos/2025/dsc_4764.webp",
  "/photos/2025/dsc_4804.webp",
  "/photos/2025/img_7583.webp",
  "/photos/2025/img_7585.webp",
  "/photos/2025/img_7607.webp",
  "/photos/2025/img_7622.webp",
  "/photos/2025/img_7645.webp",
  "/photos/2025/img_7666.webp",
  "/photos/2025/img_7693.webp",
];

export default function ArchiwumPage() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative min-h-screen bg-sr-sand text-sr-navy overflow-x-hidden">

      <Navbar />
      {!isMobile && !prefersReducedMotion && (
        <TargetCursor
          spinDuration={3}
          hideDefaultCursor={true}
          parallaxOn={true}
          cursorColor="#183153"
          cursorColorOnTarget="#CE2F25"
          targetSelector=".cursor-target"
        />
      )}

      <main className="relative z-10">
        {/* Hero. Wcześniej sekcja miała min-h-screen i wyśrodkowanie w pionie,
            przez co plakietka i tytuł wisiały w połowie ekranu, a nad nimi
            zostawał pas pustego tła. Teraz treść zaczyna się od góry. */}
        <section className="px-8 sm:px-16 md:px-28 pt-32 pb-16">
          <div className="max-w-[88rem] mx-auto">
            {/* Tytuł — wyśrodkowany względem strony */}
            <div className="text-center space-y-6">
              <h1 className="text-5xl sm:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-sr-red via-sr-navy to-sr-navy leading-none">
                Archiwum<br />2025
              </h1>
            </div>

            {/* Tekst po lewej, zdjęcie po prawej. Poniżej lg kolumny zwijają się
                do jednej i zdjęcie ląduje pod tekstem.
                Bez items-start — kolumny mają się rozciągać do wspólnej
                wysokości, bo od tego zależy pozycja przycisku (patrz niżej). */}
            <div className="mt-16 grid lg:grid-cols-2 gap-12">
              <div className="space-y-4 text-base sm:text-lg text-[#183153] leading-relaxed">
                <p>
                  Rok temu, 6 września 2025 roku, odbyła się pierwsza edycja Sun Run - biegu
                  charytatywnego z elementami festiwalowymi, którego celem było niesienie pomocy
                  podopiecznym Hospicjum Dobrego Samarytanina w Lublinie.
                </p>
                <p>
                  Wydarzenie zostało zorganizowane przez około 50 młodych osób - uczniów szkół
                  średnich oraz studentów, którzy wspólnymi siłami stworzyli inicjatywę łączącą
                  sport, integrację i dobroczynność.
                </p>
                <p>
                  Pierwsza edycja okazała się ogromnym sukcesem. Na Sun Run zapisały się 363
                  osoby, a dzięki zaangażowaniu uczestników, partnerów i wolontariuszy udało się
                  zebrać około 13 800 zł, które zostały przekazane na wsparcie osób
                  potrzebujących z Hospicjum Dobrego Samarytanina.
                </p>
                <p>
                  Hasłem przewodnim pierwszej edycji było: „Biegnij dla tych, którzy już nie
                  mogą”. To właśnie ono najlepiej oddawało ideę wydarzenia - każdy przebiegnięty
                  kilometr miał realne znaczenie i był wyrazem solidarności z tymi, którzy nie
                  mogą już stanąć na starcie.
                </p>
                <p>
                  W tym roku chcemy pójść o krok dalej i przebić liczbę 363 uczestników.
                  Wierzymy, że razem możemy stworzyć jeszcze większe wydarzenie i wspólnie
                  zrobić jeszcze więcej dobra.
                </p>
              </div>

              {/* Prawa kolumna: zdjęcie, a pod nim przycisk do galerii.
                  Przycisk ma stać przy DOLE słupka tekstu, ale gdy zdjęcie jest
                  wysokie i miejsca zabraknie — tuż pod zdjęciem, oddzielony samym
                  polem ochronnym. Załatwia to rozpórka: rośnie (flex-1), gdy jest
                  co wypełniać, a nigdy nie schodzi poniżej pola ochronnego
                  (min-h-10). Gdy kolumna z tekstem jest niższa niż zdjęcie razem
                  z przyciskiem, to ona rozciąga się do tej wysokości i rozpórka
                  zostaje na minimum — czyli dokładnie w opisanym wyjątku. */}
              <div className="flex flex-col items-center">
                {/* Zdjęcie ma natywnie 3:2 (6000×4000), więc aspect-[3/2]
                    nie kadruje niczego — object-cover jest tylko zabezpieczeniem
                    na wypadek podmiany na inną proporcję.
                    eager + fetchPriority: to grafika w pierwszym ekranie,
                    leniwe ładowanie tylko opóźniłoby jej pojawienie się. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/2025/start-biegu.webp"
                  alt="Start I edycji Sun Run 2025 pod bramą w Parku Ludowym w Lublinie"
                  width={1600}
                  height={1067}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full aspect-[3/2] object-cover rounded-2xl border border-sr-line"
                />

                <div className="flex-1 min-h-10" />

                <a
                  href="#galeria"
                  className="cursor-target inline-flex items-center justify-center px-12 py-5 bg-sr-orange hover:bg-sr-orange/90 text-[#183153] font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Galeria
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Statystyki 2025 */}
        <section className="py-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block mb-8">
              I edycja w liczbach
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {STATS_2025.map((s) => (
                <div
                  key={s.label}
                  className="@container bg-white/70 border border-sr-line backdrop-blur-sm rounded-2xl p-6 text-center shadow-sm"
                >
                  {/* Wielkość liczby liczona od szerokości KAFELKA (cqw), nie okna.
                      Na sztywnym text-4xl dłuższe wartości („6.09.2025",
                      „~13800 zł") wychodziły poza kafelek na telefonach i przy
                      ~1024px, gdzie kolumn jest już cztery, ale jeszcze wąskie.
                      Próg oparty na breakpointach musiałby to zgadywać, bo
                      szerokość kafelka nie rośnie liniowo z oknem — siatka
                      przeskakuje z 2 kolumn na 4 przy lg.
                      17.5cqw dobrane pomiarem tak, by najszersza wartość
                      („6.09.2025") mieściła się w kafelku od 320 do 1600px.
                      Górna granica 2.25rem to dawne text-4xl — od ~768px
                      w górę nic się nie zmienia. */}
                  <p className="text-[clamp(0.7rem,17.5cqw,2.25rem)] font-black text-transparent bg-clip-text bg-gradient-to-br from-sr-red to-sr-navy">
                    {s.val}
                  </p>
                  <p className="text-xs text-[#183153] mt-2 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Artykuły */}
        <section className="py-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block mb-3">
              Media
            </span>
            <h2 className="text-3xl font-black uppercase text-[#183153] mb-8">
              Artykuły o Sun Run 2025
            </h2>
            <div className="space-y-4">
              {ARTICLES.map((a) => (
                <a
                  key={a.title}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target flex flex-col sm:flex-row gap-4 sm:items-center bg-white/70 border border-sr-line hover:border-sr-line backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 group shadow-sm"
                >
                  <div
                    className="w-1 h-full min-h-[3rem] rounded-full flex-shrink-0 hidden sm:block"
                    style={{ backgroundColor: a.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Nazwa źródła jest jednakowo czerwona we wszystkich
                          kafelkach. Kolor przewodni kafelka niesie plama po
                          lewej — jako tekst byłby nieczytelny na jasnej karcie
                          (żółć #FED46D dawała ok. 1,4:1). */}
                      <span className="text-xs font-bold uppercase tracking-widest text-sr-red">
                        {a.source}
                      </span>
                      <span className="text-xs text-[#183153]">{a.date}</span>
                    </div>
                    <h3 className="font-black text-[#183153] group-hover:text-sr-red transition-colors mb-1">
                      {a.title}
                    </h3>
                    <p className="text-sm text-[#183153]">{a.excerpt}</p>
                  </div>
                  <span className="text-[#183153] group-hover:text-sr-red transition-colors flex-shrink-0">
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Galeria zdjęć. id="galeria" — cel przycisku „Galeria" z góry strony.
            Po skoku sekcja ma stanąć górną krawędzią równo z górą okna, więc bez
            scroll-mt. Zapas na logo w rogu robi WŁASNY górny padding sekcji
            (pt-24): dzięki temu nad nagłówkiem „Fotografie" jest puste tło tej
            sekcji, a nie urwany kawałek sekcji z artykułami — tak by wyszło
            przy scroll-mt, bo ono odsuwa punkt docelowy w głąb poprzedniej
            sekcji. Na telefonie logo sięga 76px, nagłówek ląduje na 96px. */}
        <section id="galeria" className="pt-24 pb-10 px-8 sm:px-16 md:px-28">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block mb-3">
              Fotografie
            </span>
            <h2 className="text-3xl font-black uppercase text-[#183153] mb-3">
              Galeria zdjęć
            </h2>
            <p className="text-sm text-[#183153] mb-8">
              Kadry z I edycji - 6 września 2025, Park Ludowy w Lublinie.
            </p>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {/* Bez cursor-zoom-in: lupa z plusem obiecywała powiększenie,
                  którego nie ma, i wyświetlała się razem ze słoneczkiem.
                  Brak własnego kursora = kafelek dziedziczy cursor:none z body,
                  czyli zostaje samo słoneczko. */}
              {GALLERY_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className="break-inside-avoid rounded-xl overflow-hidden border border-sr-line hover:border-sr-line transition-all duration-300"
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
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sr-red block">
              Co dalej?
            </span>
            <h2 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-sr-navy to-sr-red">
              Dołącz do II edycji!
            </h2>
            <p className="text-sm text-[#183153]">
              II edycja Sun Run 2026 już w drodze. Zapisz się i biegnij z nami!
            </p>
            <a
              href="https://frslublin.pl/pl/app/races/sign_up_form/295"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target inline-flex items-center justify-center px-10 py-4 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all shadow-xl"
            >
              Zapisz się na 2026 →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
