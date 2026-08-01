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

// Stałe TEAM i BRANCHES zniknęły razem z sekcjami „Struktura", „Zespół"
// i „Droga komunikacji" — bez nich były już tylko martwym kodem. Gdyby
// któraś z tych sekcji wracała, dane są w historii gita.

export default function ONasPage() {
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
          <div className="relative max-w-5xl mx-auto">
            {/* Słonecznik wystający zza górnej krawędzi ramki.
                Stoi w NORMALNYM PRZEPŁYWIE, tuż nad ramką, a nie na pozycji
                bezwzględnej. Dzięki temu dwie rzeczy załatwiają się same:
                spód grafiki styka się z górną krawędzią ramki co do piksela
                (block usuwa odstęp bazowy, marginesów brak), a kwiat zajmuje
                własne miejsce w sekcji, więc nie trzeba pod niego rezerwować
                górnego paddingu. Przy pozycjonowaniu bezwzględnym padding
                musiałby rosnąć razem z szerokością ramki, bo wysokość kwiatu
                jest jej ułamkiem — jedna wartość nie pokryłaby całego zakresu
                i na części szerokości kwiat wchodziłby w sekcję powyżej.

                Szerokość 70% ramki — liczona od niej, nie od okna, więc kwiat
                skaluje się razem z nią bez progów. */}
            <img
              src="/slonecznik.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none block w-[70%] h-auto mx-auto"
            />
            <div className="relative bg-white/70 border border-sr-line backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-lg">
              {/* w-fit mx-auto zamiast samego text-center — i to nie jest
                  kosmetyka. bg-clip-text przycina do liter TŁO ELEMENTU, a nie
                  sam napis. Nagłówek jako blok zajmował całą szerokość ramki
                  (~930px), podczas gdy tekst ma ~270px i stoi pośrodku — więc
                  litery pokazywały tylko środkowe ~30% gradientu. Kolory
                  krańcowe lądowały daleko poza napisem i przejście wyglądało
                  na blade. Przy w-fit pudełko ma szerokość napisu, więc
                  #CE2F25 jest naprawdę na jego lewej krawędzi, a #F6941D
                  na prawej. */}
              <h2 className="w-fit mx-auto text-3xl sm:text-4xl font-black uppercase text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#CE2F25] to-[#F6941D]">
                Nasza misja
              </h2>
              {/* Akapity jeden pod drugim, nie w dwóch kolumnach jak wcześniej:
                  poprzednia treść miała dwa podobnej długości fragmenty, a te są
                  wyraźnie nierówne i w kolumnach zostawiałyby dziurę po prawej. */}
              <div className="space-y-4 text-base text-[#183153] leading-relaxed">
                <p>
                  Naszą misją jest niesienie pomocy potrzebującym oraz wspieranie{" "}
                  <a
                    href="https://hospicjum-samarytanin.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sr-red font-semibold hover:underline"
                  >
                    Hospicjum Dobrego Samarytanina
                  </a>{" "}
                  w Lublinie. Chcemy tworzyć wydarzenie, które daje okazję do wspólnego
                  spędzania czasu, spotkania z przyjaciółmi, poznawania nowych osób
                  i jednoczesnego pomagania tym, którzy tego potrzebują.
                </p>
                <p>
                  Sun Run powstał z pasji i zaangażowania wielu młodych osób, które
                  chciały stworzyć inicjatywę łączącą ludzi wokół wspólnego celu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-8 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-black uppercase text-[#183153]">
              Dołącz do naszej misji!
            </h2>
            <p className="text-sm text-[#183153]">
              Jeśli Sun Run Cię zainteresował i chciałbyś wesprzeć nasze działania jako
              partner, sponsor, wolontariusz lub po prostu osoba, która chce pomóc,
              będzie nam bardzo miło Cię poznać!
            </p>
            <p className="text-sm text-[#183153]">
              Skontaktuj się z nami pod adresem e-mail:
            </p>
            {/* W miejsce dawnego pomarańczowego przycisku wchodzi sam adres.
                Zostaje odnośnikiem mailto — wygląda jak zwykły tekst, bez
                podkreślenia, ale kliknięcie otwiera program pocztowy.

                ROZMIAR NIE JEST OZDOBNY. Czerwień #CE2F25 na piaskowym tle daje
                3,74:1, czyli za mało na zwykły tekst (próg 4,5:1), ale dość na
                tekst duży (próg 3:1). „Duży" wg WCAG to pogrubiony od 18,66px
                — dlatego text-xl (20px), a nie text-lg (18px), które by tego
                progu nie przekroczyło i adres byłby poniżej normy.

                Bez cursor-target: nad adresem nie ma się pojawiać czerwony
                celownik. Słoneczko i tak zniknie, bo odnośnik ma własny
                kursor systemowy (pointer), a to wyłapuje reguła w TargetCursor.

                <wbr /> przed małpą wyznacza miejsce, w którym adres wolno
                złamać. Bez tego na telefonie łamał się gdzie popadnie i w
                drugim wierszu zostawała sama litera „m". */}
            <a
              href="mailto:hospicjum.samarytanin.bieg@gmail.com"
              className="block text-xl font-bold text-sr-red break-words"
            >
              hospicjum.samarytanin.bieg<wbr />@gmail.com
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
