// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { POKAZ_PARTNEROW } from "@/flagi";
import SurveyPopup, { OPEN_SURVEY_EVENT } from "@/components/SurveyPopup";
import VisitTracker from "@/components/VisitTracker";
import { FaqSection } from "@/components/FaqSection";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SECTION_GAP } from "@/lib/layout";
import { TIERS, getActiveTierIndex } from "@/lib/pricing";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });
// gsap i cala logika sledzenia myszy w TargetCursor sa bezuzyteczne na dotyku —
// dynamic + ssr:false, zeby ten kod w ogole nie trafial do bundle'a mobile
// (komponent i tak renderuje null na mobile, ale bez tego jego JS nadal by
// sie pobieral i parsowal).
const TargetCursor = dynamic(() => import("@/components/TargetCursor"), { ssr: false });
// Stack (przeciagalna talia zdjec) uzywa Framer Motion do fizyki przeciagania
// i tak dobrze nie widac tego efektu na waskim ekranie - na mobile w ogole
// nie ladujemy tego komponentu (patrz rendering nizej: prosta siatka zamiast).
const Stack = dynamic(() => import("@/components/Stack"), { ssr: false });

// Zdjęcia-wspomnienia z I edycji do komponentu Stack (sekcja „Wspomnienia").
// Karty 1 i 3 były zastępnikami i poszły do kosza: pierwsza to generyczna
// grafika stockowa z angielskimi numerami startowymi („RUN FOR HOPE"),
// trzecia — zdjęcie z Adobe Stock z widocznym znakiem wodnym, czyli coś,
// co nie miało prawa stać na publicznej stronie. W ich miejsce prawdziwe
// kadry z I edycji, przycięte do kwadratu pod karty komponentu.
const STACK_CARDS = [
  { id: 1, img: "/photos/2025/stos-start.webp", alt: "Start I edycji Sun Run 2025" },
  { id: 2, img: "/photos/ekipa.webp", alt: "Ekipa Sun Run 2025" },
  { id: 3, img: "/photos/2025/stos-trasa.webp", alt: "Uczestnicy na trasie w Parku Ludowym" },
  { id: 4, img: "/photos/uniwersytet-jazdy.webp", alt: "Partner Uniwersytet Jazdy" },
];

// Szerokość głównego logo w sekcji startowej. Używa jej też kontener daty pod
// spodem, żeby napis był wyśrodkowany względem znaku — dlatego wartość stoi
// w jednym miejscu, a nie w dwóch, gdzie mogłaby się rozjechać.
const SZEROKOSC_LOGO = "min(720px, 88vw, 62vh)";

// Pole `anchor` usunięte razem z podstroną /partnerzy — wskazywało kotwice
// na niej, a bez niej nie miało już czego adresować.
const PARTNERS = [
  { name: "DKMS", desc: "Rejestracja dawców szpiku", color: "#CE2F25" },
  { name: "VIVO! Lublin", desc: "Partner strategiczny", color: "#183153" },
  { name: "AS Babuni", desc: "Partner gastronomiczny", color: "#CE2F25" },
  { name: "Datasport", desc: "Pomiar czasu i klasyfikacje", color: "#183153" },
  { name: "UP Lublin", desc: "Patronat honorowy", color: "#CE2F25" },
];

export default function Home() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  // Gimmick strzalki ("kliknij tutaj!") i TargetCursor to czysta dekoracja
  // bez sensu na dotyku (i tak jest "hidden sm:flex" na waskich ekranach) —
  // na mobile/reduced-motion pomijamy ich obliczenia scrolla w ogole, zamiast
  // tylko chowac gotowy wynik.
  const disableDecorativeMotion = isMobile || prefersReducedMotion;

  // Steruje wyłącznie dolnym paskiem zapisów: true, gdy przycisk „Zapisz się"
  // spod logo wyjedzie poza górną krawędź ekranu.
  const [scrolled, setScrolled] = useState(false);
  const przyciskZapiszRef = useRef(null);
  const [ctaDismissed, setCtaDismissed] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);

  // "Magnes" — strzałkę można próbować odciągnąć, ale jest przyklejona: rusza się
  // tylko odrobinę (rubber-band z nasyceniem), a po puszczeniu sprężyście wraca.
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const [pulling, setPulling] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startY: 0 });

  const rubberBand = (v) => {
    const max = 28; // maks. wychylenie w px — magnes prawie nie puszcza
    return max * Math.tanh(v / (max * 2.4));
  };
  const onArrowPointerDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY };
    setPulling(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onArrowPointerMove = (e) => {
    if (!dragRef.current.active) return;
    setPull({
      x: rubberBand(e.clientX - dragRef.current.startX),
      y: rubberBand(e.clientY - dragRef.current.startY),
    });
  };
  const endArrowDrag = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setPulling(false);
    setPull({ x: 0, y: 0 }); // sprężysty powrót (transition na warstwie pull)
  };

  const wspomnieniaRef = useRef(null);
  const [returnProgress, setReturnProgress] = useState(0);

  // Rozmiar kart w stosie „Wspomnienia". Stack dostaje szerokość w pikselach,
  // a sztywne 380px nie mieściło się w kolumnie: na telefonie rozpychało ścieżkę
  // siatki ponad ekran (przy 320px stos był ucinany o 60px, a razem z nim
  // wyjeżdżał nagłówek, bo dziedziczył szerokość po tej samej ścieżce),
  // a przy ~820px, gdzie siatka ma już dwie kolumny, stos wychodził w prawo.
  const siatkaWspomnienRef = useRef(null);
  const [rozmiarKarty, setRozmiarKarty] = useState(380);

  useEffect(() => {
    const dopasuj = () => {
      const siatka = siatkaWspomnienRef.current;
      if (!siatka) return;
      // clientWidth siatki jest bezpieczne: kontener ma w-full + max-width, więc
      // jego pudełko wyznacza rodzic, nawet gdy ścieżki wewnątrz się rozpychają.
      // Liczby ścieżek NIE bierzemy z ich rozmiarów (te bywają już rozepchane),
      // tylko z liczby wartości w gridTemplateColumns.
      const cs = getComputedStyle(siatka);
      const ile = cs.gridTemplateColumns.split(/\s+/).filter(Boolean).length || 1;
      const odstep = parseFloat(cs.columnGap) || 0;
      const kolumna = (siatka.clientWidth - odstep * (ile - 1)) / ile;
      setRozmiarKarty(Math.max(220, Math.min(380, Math.floor(kolumna))));
    };
    dopasuj();
    const ro = new ResizeObserver(dopasuj);
    if (siatkaWspomnienRef.current) ro.observe(siatkaWspomnienRef.current);
    window.addEventListener("resize", dopasuj);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", dopasuj);
    };
  }, []);

  // ── Odstępy między sekcjami ──────────────────────────────────────────────
  // Jedna wartość na całą stronę: wysokość kafelka „Zapisanych uczestników"
  // z sekcji „O biegu". Kafelek ma 166px niezależnie od szerokości okna
  // (sprawdzone od 1920 do 390px), więc nadaje się na miarę odniesienia.
  // Sama liczba mieszka w src/lib/layout.ts (SECTION_GAP) - żeby komponenty
  // sekcji renderowane osobno (np. FaqSection.tsx) używały dokładnie tej
  // samej wartości, a nie własnych, ręcznie dobranych marginesów.
  const LUKA = SECTION_GAP;

  // Aktualny próg minimalnej wpłaty (oś czasu w sekcji „O biegu") - liczony z
  // biezacej daty w efekcie, nie przy pierwszym renderze: serwer i klient
  // mogłyby przy odrobinie pecha wylosować inny dzień w okolicach północy i
  // React zgłosiłby niezgodność hydracji. Pierwsza klatka po obu stronach jest
  // identyczna (bez podświetleń), właściwy stan doskakuje chwilę później.
  const [aktualnyProg, setAktualnyProg] = useState(null);
  useEffect(() => {
    setAktualnyProg(getActiveTierIndex(new Date()));
  }, []);

  const heroSekcjaRef = useRef(null);
  const [wysokoscHero, setWysokoscHero] = useState(0);

  // Dolny odstęp sekcji „Wspomnienia". Liczony od przycisku „Odwiedź Archiwum",
  // a nie od dołu sekcji: stos zdjęć obok sięga niżej niż przycisk, więc zwykły
  // padding dałby lukę mierzoną od zdjęć. Sztab chce ją mierzyć od przycisku
  // i zignorować, że zdjęcia podejdą bliżej stopki.
  const przyciskArchiwumRef = useRef(null);
  const [dolWspomnien, setDolWspomnien] = useState(LUKA);

  useEffect(() => {
    const policz = () => {
      const sekcja = wspomnieniaRef.current;
      const przycisk = przyciskArchiwumRef.current;
      const siatka = siatkaWspomnienRef.current;
      if (!sekcja || !przycisk || !siatka) return;

      // Gdy siatka zwinie się do jednej kolumny, zdjęcia nie stoją już OBOK
      // przycisku, tylko POD nim — i to one są ostatnim elementem sekcji.
      // Mierzenie luki od przycisku znaczyłoby wtedy, że stopka wchodzi na
      // zdjęcia, więc w tym układzie wracamy do zwykłego odstępu od dołu.
      const kolumn = getComputedStyle(siatka).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
      if (kolumn < 2) {
        setDolWspomnien(LUKA);
        return;
      }

      const cs = getComputedStyle(sekcja);
      const dolTresci = sekcja.getBoundingClientRect().bottom - parseFloat(cs.paddingBottom);
      const nadmiar = dolTresci - przycisk.getBoundingClientRect().bottom;
      setDolWspomnien(Math.max(0, Math.round(LUKA - nadmiar)));
    };
    policz();
    const ro = new ResizeObserver(policz);
    if (wspomnieniaRef.current) ro.observe(wspomnieniaRef.current);
    window.addEventListener("resize", policz);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", policz);
    };
  }, []);

  // ── Sekcja „O Festiwalu": obok logo czy pod nim? ─────────────────────────
  // Warunek ze sztabu: lewa krawędź ramki ma sięgać środka ekranu. Nie da się
  // tego rozstrzygnąć samym progiem szerokości, bo logo ma szerokość
  // min(720px, 88vw, 62vh) — przy niskim oknie jest wąskie i ramka się zmieści,
  // przy wysokim szerokie i nie. Mierzymy więc realną prawą krawędź kolumny
  // z logo i przyciskami, i porównujemy ze środkiem okna. Gdy się nie mieści,
  // cała sekcja z nagłówkiem spada pod spód.
  const heroTrescRef = useRef(null);
  const kotwicaObsluzona = useRef(false);
  const [festiwalObok, setFestiwalObok] = useState(false);
  const [festiwalPrawy, setFestiwalPrawy] = useState(32);

  useEffect(() => {
    const ODSTEP = 56; // minimalny prześwit między kolumną logo a ramką
    const MARGINES = 24; // zapas nad ramką i pod nią
    const POLE_MENU = 32; // pole ochronne między ramką a linią przycisku Menu

    const zmierz = () => {
      const el = heroTrescRef.current;
      if (!el) return;

      // (1) WARUNEK POZIOMY — czy kolumna z logo kończy się przed środkiem okna.
      // UWAGA: mierzymy konkretne elementy treści, a NIE bezpośrednich potomków
      // kontenera. Te są blokowe i zawsze mają szerokość całego kontenera
      // (max-w-4xl = 896px) niezależnie od tego, jak szerokie jest logo — przez
      // co warunek nigdy by się nie spełnił.
      const logo = el.querySelector("#hero-logo img");
      const cta = el.querySelector("[data-hero-cta]");
      const prawa = Math.max(
        logo ? logo.getBoundingClientRect().right : 0,
        cta ? cta.getBoundingClientRect().right : 0
      );
      if (!prawa) return;

      // Wysokość sekcji startowej liczymy zawsze — także w wariancie POD, gdzie
      // funkcja kończy się wcześniej. Wcześniej stała za tym wczesnym `return`
      // i w tym wariancie w ogóle się nie ustawiała, przez co luka nad sekcją
      // „O Festiwalu" wynosiła zero zamiast LUKA.
      const sekcjaHero = heroSekcjaRef.current;
      const dolPrzycisku = sekcjaHero
        ? cta.getBoundingClientRect().bottom - sekcjaHero.getBoundingClientRect().top
        : 0;

      if (prawa + ODSTEP > window.innerWidth / 2) {
        setFestiwalObok(false);
        setWysokoscHero(Math.round(dolPrzycisku + LUKA));
        return;
      }

      // (2) PRAWA KRAWĘDŹ. Ramka nie może wejść pod przycisk Menu — zatrzymuje
      // się na pionowej linii poprowadzonej od jego LEWEJ krawędzi, minus pole
      // ochronne. Szerokość przycisku zależy od wyrenderowanego napisu „Menu",
      // więc bierzemy ją z pomiaru, a nie z zapisanej na sztywno wartości.
      const menu = document.querySelector(".sm-toggle");
      const prawyOdstep = menu
        ? window.innerWidth - menu.getBoundingClientRect().left + POLE_MENU
        : 32;

      // (3) WARUNEK PIONOWY — ramka ma się zmieścić w oknie, żeby nie wjeżdżała
      // w kolejną sekcję. Wysokość mierzymy na KOPII poza ekranem, ustawionej na
      // docelową szerokość: oryginał ma zawsze szerokość tego wariantu, w którym
      // akurat stoi, więc decyzja zaczęłaby się zapętlać (pod → mieści się →
      // obok → nie mieści się → pod → …).
      const zrodlo = document.getElementById("o-festiwalu");
      if (!zrodlo) return;
      const kopia = zrodlo.cloneNode(true);
      kopia.removeAttribute("id");
      kopia.setAttribute("aria-hidden", "true");
      kopia.style.cssText =
        "position:fixed;top:0;left:-99999px;visibility:hidden;pointer-events:none;" +
        `width:${window.innerWidth / 2 - prawyOdstep}px`;
      document.body.appendChild(kopia);
      const wysokosc = kopia.getBoundingClientRect().height;
      kopia.remove();

      const miesciSie = wysokosc <= window.innerHeight - 2 * MARGINES;
      setFestiwalPrawy(prawyOdstep);
      setFestiwalObok(miesciSie);

      // WYSOKOŚĆ SEKCJI STARTOWEJ. Pod najniższym elementem ma zostać dokładnie
      // jedna LUKA. Najniższy element to przycisk ankiety albo — w wariancie
      // OBOK — ramka „O Festiwalu", zależnie od tego, co sięga dalej.
      //
      // Ramki nie mierzymy z jej pozycji na stronie, tylko z wysokości kopii:
      // jest wyśrodkowana w sekcji, więc jej dolna krawędź zależy od wysokości
      // sekcji, a ta od niej — pomiar na żywo zapętliłby się. Przy wyśrodkowaniu
      // w sekcji o wysokości H ramka o wysokości B kończy się na H/2 + B/2,
      // więc warunek „LUKA pod ramką" daje H = B + 2·LUKA.
      const zPrzycisku = dolPrzycisku + LUKA;
      setWysokoscHero(
        Math.round(miesciSie ? Math.max(zPrzycisku, wysokosc + 2 * LUKA) : zPrzycisku)
      );

      // Wejście z podstrony przez „/#o-festiwalu": przeglądarka sama skoczyła do
      // kotwicy, ale w wariancie OBOK ta kotwica jest na górze strony, więc skok
      // tylko zsunął widok o kilkaset pikseli w dół, w puste miejsce. Cofamy to
      // raz, zaraz po pierwszym pomiarze — tak samo jak robi to pozycja menu
      // klikana już na stronie głównej.
      if (!kotwicaObsluzona.current) {
        kotwicaObsluzona.current = true;
        if (miesciSie && window.location.hash === "#o-festiwalu") {
          window.scrollTo({ top: 0 });
        }
      }
    };

    zmierz();
    // ResizeObserver łapie też moment, w którym logo SVG dostanie swoje wymiary
    // po wczytaniu — sam listener na resize by tego nie wychwycił.
    const ro = new ResizeObserver(zmierz);
    if (heroTrescRef.current) ro.observe(heroTrescRef.current);
    window.addEventListener("resize", zmierz);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", zmierz);
    };
  }, []);

  // Wspólna treść sekcji — renderowana w jednym z dwóch miejsc, nigdy w obu.
  const festiwal = (
    // scroll-mt-28 działa tylko w wariancie POD SPODEM: odsuwa nagłówek spod
    // logo w rogu, żeby po skoku z menu logo było nad nim, a nie na nim.
    // W wariancie OBOK menu w ogóle tu nie przewija — wraca na górę strony.
    <div id="o-festiwalu" className="scroll-mt-28">
      <h2 className="text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-5">
        O Festiwalu
      </h2>
      {/* Nie ma tu już żadnego kontenera — treść leży wprost na tle strony.
          Prostokąt, który wyznaczała biała karta, istnieje nadal, tylko stał się
          niewidzialny: to on jest granicą, której tekst może dotknąć, ale jej
          nie przekroczyć, i to względem niego liczy się, czy sekcja mieści się
          obok logo. Zniknięcie paddingu p-8 samo zrównało lewą krawędź tekstu
          z lewą krawędzią nagłówka. */}
      {/* Godzina 16:00 to OTWARCIE FESTIWALU, nie start biegu (18:30) —
          patrz AGENTS.md. Sam bieg ma własną godzinę w sekcji „O biegu". */}
      <div className="flex flex-wrap items-center gap-3 pb-5 mb-5 border-b border-sr-line text-sm sm:text-base font-extrabold uppercase tracking-[0.18em] text-[#183153]">
        <span>16:00</span>
        <span aria-hidden="true" className="text-sr-red">|</span>
        <span>Park Ludowy w Lublinie</span>
      </div>

      {/* Łamy. Blok bywa bardzo szeroki (pod spodem to całe 88rem), a wiersz
          po 140 znaków źle się czyta. Zadajemy więc SZEROKOŚĆ łamu, nie ich
          liczbę: przeglądarka sama zmieści tyle kolumn, ile wejdzie. Dzięki
          temu ta sama klasa działa w obu wariantach — reguła patrzy na
          szerokość bloku, a nie na szerokość okna. */}
      <div className="columns-[27rem] gap-10 text-sm sm:text-base text-[#183153] leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&>p]:break-inside-avoid">
        <p>
          Wyobraź sobie wrześniowe popołudnie pełne muzyki, uśmiechu i dobrej energii. Miejsce,
          gdzie możesz spotkać się z przyjaciółmi, poznać nowych ludzi i wspólnie zrobić coś
          dobrego. Tak właśnie wyglądać będzie Sun Run 2026 - wydarzenie charytatywne, którego
          celem jest wsparcie podopiecznych Hospicjum Dobrego Samarytanina w Lublinie.
        </p>
        <p>
          Na uczestników czekać będzie wyjątkowa atmosfera, muzyka, wiele atrakcji dla dzieci,
          młodzieży i dorosłych, strefa jedzenia oraz przestrzeń do wspólnego spędzenia czasu.
          Chcemy stworzyć miejsce, w którym radość, spotkania z innymi i pomaganie połączą się
          w jedno niezapomniane wydarzenie.
        </p>
        <p>
          Głównym punktem Sun Run będzie charytatywny bieg na 5 km. To wydarzenie dla każdego -
          niezależnie od kondycji i doświadczenia. Możesz pobiec, ale możesz również przejść
          całą trasę własnym tempem. Najważniejsze nie jest miejsce na mecie, ale wspólny cel
          i pomoc tym, którzy jej potrzebują.
        </p>
        <p>
          Ubierz się na żółto i razem z nami sprawmy, aby Park Ludowy rozbłysnął kolorem słońca,
          nadziei i solidarności. Zabierz ze sobą rodzinę, przyjaciół i znajomych - spotkajmy
          się, poznajmy nowych ludzi i spędźmy ten dzień razem.
        </p>
        <p className="font-extrabold text-sr-red">
          Spotkajmy się dla Hospicjum! Razem możemy rozświetlić czyjś świat.
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    let rafId = 0;

    const measure = () => {
      rafId = 0;
      const vh = window.innerHeight;

      // Dolny pasek zapisów wchodzi dokładnie wtedy, gdy przycisk „Zapisz się"
      // spod logo wyjedzie górą poza ekran. Wcześniej był to próg ułamkowy
      // (38% wysokości okna), przez co pasek potrafił się pojawić, gdy przycisk
      // był jeszcze widoczny — dublował wtedy sam siebie.
      const przycisk = przyciskZapiszRef.current;
      setScrolled(przycisk ? przycisk.getBoundingClientRect().bottom < 0 : false);

      // Gimmick strzalki jest "hidden sm:flex" i bezuzyteczny na dotyku — na
      // mobile/reduced-motion w ogole nie liczymy jej postepu, zeby nie
      // wywolywac dodatkowych rerenderow przy kazdym scrollu na telefonie.
      if (disableDecorativeMotion) return;

      // Postęp 0→1 w obrębie sekcji HERO — steruje animacją "łapiącej" strzałki
      setHeroProgress(Math.min(1, window.scrollY / (vh * 0.9)));

      // Postęp powrotu strzałki: rośnie, gdy sekcja "Wspomnienia" wjeżdża w ekran.
      // 0 gdy jej góra jest jeszcze poniżej dołu okna, 1 gdy dojdzie do ~40% wysokości.
      const el = wspomnieniaRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top;
        setReturnProgress(Math.max(0, Math.min(1, (vh - top) / (vh * 0.6))));
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [disableDecorativeMotion]);

  // FAZA 1 — Strzałka (fixed, przy hamburgerze) próbuje go "złapać": najpierw sięga
  // w górę i w prawo (reach), a pod koniec sekcji startowej poddaje się i całkowicie
  // znika (giveUp).
  const reach = Math.min(1, heroProgress / 0.72);
  const giveUp = Math.max(0, (heroProgress - 0.72) / 0.28);
  const heroTx = reach * 70 - giveUp * 24;
  const heroTy = -reach * 66 + giveUp * 170;
  const heroRot = reach * 8 + giveUp * 55;
  const heroScale = 1 + reach * 0.15 - giveUp * 0.3;
  const heroOpacity = Math.max(0, 1 - giveUp * 1.3); // pełne zniknięcie

  // FAZA 2 — Powrót przy "Wspomnieniach": strzałka zabawnie wpada z góry z obrotem
  // i znów zachęca do kliknięcia ("obejrzane? to teraz tutaj"). Ląduje w pozycji
  // BAZOWEJ (0,0) — czyli wskazuje hamburgera z dystansu, dokładnie jak górna poza,
  // a NIE wsuwa się pod niego. Tylko mniejsza.
  const ret = returnProgress;
  const retTx = (1 - ret) * 48;
  const retTy = (1 - ret) * -120;
  const retRot = (1 - ret) * 210; // pełen obrót do 0°
  const retScale = 0.5 + ret * 0.42; // ląduje na ~0.92 — mniejsza niż górna
  const retOpacity = Math.min(1, ret * 1.6);

  // Wybór aktywnej fazy — powrót ma priorytet, gdy tylko się zaczyna.
  const inReturn = ret > 0.01;
  const arrowTx = inReturn ? retTx : heroTx;
  const arrowTy = inReturn ? retTy : heroTy;
  const arrowRot = inReturn ? retRot : heroRot;
  const arrowScale = inReturn ? retScale : heroScale;
  const arrowOpacity = inReturn ? retOpacity : heroOpacity;
  const arrowText = pulling
    ? "zostaw!"
    : inReturn
    ? "obejrzane? to teraz tutaj!"
    : giveUp > 0.32
    ? "no dobra..."
    : reach > 0.5
    ? "prawie!"
    : "kliknij tutaj!";

  // Drganie: przy "wysilaniu się" (mocno sięga, jeszcze się nie poddała) LUB gdy
  // ktoś próbuje ją odciągnąć — wtedy magnes nerwowo drga.
  const isStraining = (!inReturn && reach > 0.7 && giveUp < 0.35) || pulling;

  return (
    <div className="relative bg-sr-sand text-sr-navy overflow-x-hidden">
      {/* Na stronie głównej małe logo w rogu pojawia się dopiero, gdy duże
          logo hero zniknie z ekranu. Podstrony używają <Navbar /> bez tej flagi,
          więc mają logo widoczne od razu. */}
      <Navbar revealOnScroll />

      {!disableDecorativeMotion && (
        <TargetCursor
          spinDuration={3}
          hideDefaultCursor={true}
          parallaxOn={true}
          cursorColor="#183153"
          cursorColorOnTarget="#CE2F25"
          targetSelector=".cursor-target"
        />
      )}

      {/* ═══════════════════════════════════════════
          STICKY CTA — "Zapisz się" (pojawia się po scrollowaniu)
      ═══════════════════════════════════════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
          scrolled && !ctaDismissed ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Pasek jest o połowę wyższy niż był (65 → 97px). Każdy wymiar, który
            składa się na tę wysokość, przemnożony przez 1,5 — dlatego wartości
            są nietypowe (18px zamiast 12, 21px zamiast 14): to nie skala
            Tailwinda, tylko dokładne 1,5× poprzednich liczb. Przy foncie podanym
            wprost trzeba też podać interlinię, bo arbitralny rozmiar jej nie
            ustawia, a to ona współtworzy wysokość przycisku. */}
        <div className="relative bg-sr-white border-t border-sr-line py-[1.125rem] pl-6 pr-14 sm:px-12 flex justify-center items-center gap-[1.875rem] shadow-2xl">
          <span className="text-[1.3125rem] text-[#3D4D65] hidden sm:block tracking-wide">
            Zapisz się na <span className="text-sr-red font-extrabold">II edycję Sun Run 2026!</span>
          </span>
          {/* px-6 poniżej sm: przy pełnym px-12 powiększony przycisk wchodził
              na krzyżyk zamykania na telefonach węższych niż 390px (przy 320px
              aż o 30px). Wysokość paska zostaje 1,5×, zwężamy tylko boki. */}
          <a
            href="https://frslublin.pl/pl/app/races/sign_up_form/295"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-target inline-flex items-center justify-center px-6 sm:px-12 py-[0.9375rem] bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-[1.3125rem]/[1.875rem] tracking-widest uppercase transition-all duration-200 shadow-lg hover:shadow-sr-orange/30"
          >
            Zapisz się →
          </a>
          <button
            type="button"
            onClick={() => setCtaDismissed(true)}
            aria-label="Zamknij pasek zapisów"
            className="cursor-target absolute right-3 top-1/2 -translate-y-1/2 w-[2.625rem] h-[2.625rem] flex items-center justify-center rounded-full text-[#3D4D65] hover:text-[#183153] hover:bg-black/5 transition-colors text-[1.875rem] leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <main>
      {/* ═══════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════ */}
      {/* Sekcja startowa NIE ma już min-h-screen. Wcześniej była zawsze wysoka
          na całe okno niezależnie od treści, przez co pod przyciskami zostawał
          pas pustki rosnący razem z ekranem. Teraz jej wysokość liczy się
          z treści (patrz wysokoscHero w efekcie pomiarowym) tak, żeby pod
          najniższym elementem została dokładnie jedna LUKA. */}
      <section
        ref={heroSekcjaRef}
        style={{ minHeight: wysokoscHero || undefined }}
        className="relative z-10 w-full flex flex-col px-8 sm:px-16 md:px-28 text-left select-none"
      >
        {/* "kliknij tutaj!" — zakrzywiona strzałka, która przy scrollu sięga w stronę
            hamburgera, próbując go "złapać", a pod koniec sekcji startowej poddaje się.
            POZYCJA FIXED — zostaje na ekranie zamiast odjeżdżać z sekcją hero. */}
        <div
          className="fixed top-24 right-28 hidden sm:flex flex-row items-end pointer-events-none"
          style={{
            zIndex: 40,
            transform: `translate(${arrowTx}px, ${arrowTy}px) rotate(${arrowRot}deg) scale(${arrowScale})`,
            transformOrigin: "bottom right",
            opacity: arrowOpacity,
            transition: "transform 0.12s ease-out, opacity 0.12s ease-out",
          }}
        >
          {/* Warstwa "pull" — łapie wskaźnik i pozwala próbować odciągnąć strzałkę.
              Rusza się minimalnie (rubber-band), a po puszczeniu sprężyście wraca. */}
          <div
            onPointerDown={onArrowPointerDown}
            onPointerMove={onArrowPointerMove}
            onPointerUp={endArrowDrag}
            onPointerCancel={endArrowDrag}
            style={{
              pointerEvents: arrowOpacity > 0.05 ? "auto" : "none",
              cursor: pulling ? "grabbing" : "grab",
              touchAction: "none",
              transform: `translate(${pull.x}px, ${pull.y}px)`,
              transition: pulling
                ? "none"
                : "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div className={`flex flex-row items-end ${isStraining ? "arrow-shake" : ""}`}>
              <span style={{ fontFamily: "cursive", color: "#CE2F25", fontSize: "1.7rem", fontWeight: 700, transform: "rotate(-8deg)", textShadow: "0 2px 8px rgba(245,241,232,0.8)", whiteSpace: "nowrap" }}>
                {arrowText}
              </span>
              <svg viewBox="0 0 110 100" width={110} height={100} style={{ marginLeft: "-10px", marginBottom: "14px", overflow: "visible" }}>
                {/* łuk startuje przy wykrzykniku i zakręca w górę, w stronę hamburgera */}
                <path d="M4,86 C 42,88 76,64 94,16" fill="none" stroke="#CE2F25" strokeWidth="3.2" strokeLinecap="round" opacity="0.95" />
                <path d="M82,22 L95,13 L96,29" fill="none" stroke="#CE2F25" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              </svg>
            </div>
          </div>
        </div>

        <div ref={heroTrescRef} className="max-w-4xl space-y-6 pt-24">
          {/* Główne logo (pozycja nr 2) — nigdy nie znika ze strony głównej i nie
              przesuwa się. Docelowa szerokość 720px, ale ograniczona też wysokością
              okna, żeby przyciski CTA zostały widoczne bez scrollowania.
              id="hero-logo" — Navbar obserwuje ten element, by wiedzieć, kiedy
              pokazać małe logo w rogu. */}
          <h1 id="hero-logo" className="m-0">
            <img
              src="/logo/sunrun-pelne.svg"
              alt=""
              width={870}
              height={634}
              className="h-auto"
              style={{ width: SZEROKOSC_LOGO }}
              draggable={false}
            />
            {/* Logo samo w sobie nie niesie tekstu, a H1 to najważniejszy sygnał
                tekstowy na stronie dla wyszukiwarek - bez tego jedyny "tekst" H1
                to alt obrazka. sr-only: niewidoczne wizualnie (branding logo bez
                zmian), ale czytane przez czytniki ekranu i indeksowane. */}
            <span className="sr-only">
              Sun Run Lublin - charytatywny bieg na 5 km w Parku Ludowym, 12 września 2026, na rzecz Hospicjum Dobrego Samarytanina
            </span>
          </h1>

          {/* Data odsunięta od logo — wcześniej pt-1, przez co przyklejała się
              do dolnej krawędzi znaku.
              Wyśrodkowana względem SAMEGO LOGA, nie kolumny hero: kontener daty
              dostaje tę samą szerokość co znak (SZEROKOSC_LOGO), więc środek
              napisu leży dokładnie pod środkiem logo, niezależnie od tego, którą
              wartość z min() akurat wybiera przeglądarka. */}
          <div className="pt-6 max-w-full" style={{ width: SZEROKOSC_LOGO }}>
            <p className="text-center text-2xl sm:text-3xl font-extrabold tracking-widest text-[#183153] uppercase">
              12 września 2026
            </p>
          </div>

          {/* Przyciski. Zewnętrzny kontener ma szerokość dopasowaną do treści
              (w-fit), więc trzeci przycisk rozciągnięty na w-full ma dokładnie
              taką samą szerokość jak para nad nim — od lewej krawędzi
              „Zapisz się" do prawej „Dowiedz się więcej". */}
          {/* Przyciski nie znikają już przy przewijaniu — wcześniej gasły po
              minięciu 38% wysokości okna, więc odjeżdżały z ekranu wygaszone,
              a użytkownik wracający w górę widział je dopiero po chwili. */}
          <div data-hero-cta className="flex flex-col gap-4 pt-2 w-fit pointer-events-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <a ref={przyciskZapiszRef} href="https://frslublin.pl/pl/app/races/sign_up_form/295" target="_blank" rel="noopener noreferrer"
                className="cursor-target inline-flex items-center justify-center px-12 py-5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                Zapisz się
              </a>
              <button onClick={() => document.getElementById("o-biegu")?.scrollIntoView({ behavior: "smooth" })}
                className="cursor-target cursor-pointer inline-flex items-center justify-center px-12 py-5 border border-sr-line hover:border-sr-orange/60 bg-sr-white text-[#183153] font-black rounded-full text-lg tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5">
                Dowiedz się więcej ↓
              </button>
            </div>

            {/* Ankieta „Skąd o nas usłyszałeś?" — na razie przycisk nic nie robi.
                Docelowo otworzy okienko z ankietą, gdy ją przygotujemy.
                Granat #183153 z pomarańczowym tekstem #FE8004 daje 5,2:1, czyli
                spełnia AA — to jedno z niewielu zestawień, w których pomarańcz
                wolno użyć jako koloru tekstu (patrz tabela w globals.css). */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_SURVEY_EVENT))}
              className="cursor-target cursor-pointer inline-flex w-full items-center justify-center px-12 py-5 bg-sr-navy text-sr-orange font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Ankieta - skąd o nas usłyszałeś?
            </button>
          </div>

          {/* Wariant OBOK: ramka zajmuje prawą połowę ekranu. Pozycjonowana
              bezwzględnie, bo musi wyjść poza padding sekcji — lewa krawędź
              w połowie okna, prawa zatrzymana na linii LEWEJ krawędzi przycisku
              Menu (patrz pomiar wyżej), żeby ramka pod niego nie wchodziła. */}
          {festiwalObok && (
            <div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{ left: "50%", right: festiwalPrawy }}
            >
              {festiwal}
            </div>
          )}
        </div>
      </section>

      {/* Wariant POD SPODEM: gdy kolumna z logo jest za szeroka, żeby ramka
          zmieściła się obok, cała sekcja razem z nagłówkiem spada tutaj. */}
      {!festiwalObok && (
        <section className="relative z-10 w-full px-6 sm:px-12" style={{ paddingBottom: LUKA }}>
          <div className="max-w-[88rem] mx-auto">{festiwal}</div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          2. STATS DASHBOARD — Mapa + Dane + Licznik
          (wszystkie widoczne naraz na ekranie)
      ═══════════════════════════════════════════ */}
      <section
        id="o-biegu"
        className="relative z-10 w-full px-6 sm:px-12 scroll-mt-28" style={{ paddingBottom: LUKA }}
      >
        <div className="max-w-[88rem] mx-auto w-full">
          {/* text-[1.75rem] = dokładnie dwukrotność poprzedniego text-sm (14px). */}
          <h2 className="text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-8">
            O biegu
          </h2>
          {/* Na desktopie mapa zajmuje dokładnie połowę szerokości (wcześniej 3/5),
              a kolumna z kartami drugą połowę — karty rozszerzyły się ku środkowi,
              więc odstęp między nimi a mapą został bez zmian. Na telefonie układ
              pozostaje jednokolumnowy, bo podział wchodzi dopiero od breakpointu lg. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* MAPA — połowa szerokości na desktopie */}
            <div className="h-96 sm:h-[440px] lg:h-[620px] rounded-3xl overflow-hidden border border-sr-line bg-sr-white shadow-xl relative">
              <RouteMap />
              <div className="absolute bottom-4 left-4 bg-sr-white border border-sr-line rounded-xl z-[1000] px-4 py-2 text-xs text-[#3D4D65] pointer-events-none">
                Trasa · Park Ludowy, al. J. Piłsudskiego
              </div>
            </div>

            {/* DANE + LICZNIK — druga połowa szerokości */}
            <div className="flex flex-col gap-5">
              {/* Karta: Dane */}
              <div className="flex-1 rounded-3xl bg-sr-white border border-sr-line p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-4 block">
                  Dane
                </span>
                <div className="space-y-3">
                  {[
                    { label: "Godzina startu", value: "18:30" },
                    { label: "Dystans", value: "5 km (2 pętle)" },
                    { label: "Minimalny wiek", value: "14 lat" },
                    { label: "Limit czasu", value: "80 minut" },
                    { label: "Atest", value: "PZLA" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center border-b border-[rgb(24 49 83 / 0.14)] pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-[#3D4D65] uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-bold text-[#183153]">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Akapit uzupełniający tabelę — w tej samej karcie, oddzielony
                    linią, żeby było widać, że to osobna część. */}
                <div className="mt-5 pt-5 border-t border-[rgb(24 49 83 / 0.14)] text-sm text-[#3D4D65] leading-relaxed space-y-2">
                  <p>Czas biegu będzie mierzony specjalnymi opaskami.</p>
                  <p>
                    Uczestnicy będą rywalizować ze sobą w ośmiu kategoriach: generalnej kobiet
                    i mężczyzn oraz wiekowych kobiet i mężczyzn (14+, 30+, 50+).
                  </p>
                  <p>Biegacze będą mieli zapewnioną wodę pitną.</p>
                </div>
              </div>

              {/* Karta: Minimalna wpłata - kompaktowa oś czasu, nie osobna
                  sekcja na pół ekranu (poprzednia wersja była za duża - sztab
                  poprosił o przeniesienie tutaj, obok reszty danych o biegu).
                  Wartości progów trzymane w src/lib/pricing.ts (TIERS) - to
                  samo źródło zasila FAQ i offers w JSON-LD, więc kwoty i daty
                  w tych trzech miejscach zawsze się zgadzają. */}
              <div className="rounded-3xl bg-sr-white border border-sr-line p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-1 block">
                  Minimalna wpłata
                </span>
                <p className="text-xs text-[#3D4D65] leading-relaxed mb-4">
                  To darowizna z progiem minimalnym, nie cena biletu - możesz wpłacić więcej.
                </p>

                {/* Oś czasu: cienki pasek pod trzema progami, wypełniony do
                    aktywnego kroku. Czysto dekoracyjny (aria-hidden) - stan
                    każdego progu jest już jednoznacznie opisany słownie
                    (etykieta "Teraz" / "Zakończony"), nie samym kolorem. */}
                <div aria-hidden="true" className="h-1 rounded-full bg-sr-line mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sr-orange transition-[width] duration-700 ease-out"
                    style={{ width: aktualnyProg === null ? 0 : `${((aktualnyProg + 1) / TIERS.length) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {TIERS.map((tier, i) => {
                    const isActive = aktualnyProg === i;
                    const isPast = aktualnyProg !== null && i < aktualnyProg;
                    return (
                      <div
                        key={tier.id}
                        className={`rounded-xl border p-2.5 text-center ${
                          isActive
                            ? "bg-sr-white border-sr-orange"
                            : isPast
                              ? "bg-sr-sand/40 border-sr-line"
                              : "bg-sr-white border-sr-line"
                        }`}
                      >
                        <p className="text-lg font-black text-[#183153] leading-none">
                          {tier.amount}<span className="text-xs font-bold text-[#3D4D65]"> zł</span>
                        </p>
                        <p className="text-[10px] text-[#3D4D65] leading-tight mt-1">{tier.deadlineLabel}</p>
                        {isActive && (
                          <p className="text-[9px] font-black uppercase tracking-wider text-sr-orange mt-1">Teraz</p>
                        )}
                        {isPast && (
                          <p className="text-[9px] font-black uppercase tracking-wider text-sr-navy mt-1">Zakończony</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Karta: Licznik zapisanych */}
              <div className="rounded-3xl bg-sr-white border border-sr-orange/25 p-6 shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-sr-red mb-3 block">
                  Zapisanych uczestników
                </span>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sr-navy to-sr-red leading-none">
                    14
                  </span>
                  <span className="text-[#3D4D65] text-sm pb-2">i rośnie!</span>
                </div>
                <p className="text-xs text-[#3D4D65] mt-3">
                  Aktualizowane codziennie
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. CEL CHARYTATYWNY — zwykła ramka

          Wcześniej była to sekcja z trzema kafelkami nasuwającymi się na siebie
          przy przewijaniu (ScrollStack). Efekt usunięty zgodnie z listą sztabu,
          a wraz z nim dwa kafelki: „Dołącz do ekipy" i „Współpraca". Został sam
          cel charytatywny, już jako zwykła ramka bez animacji.
      ═══════════════════════════════════════════ */}
      {/* Kontener celowo taki sam jak w sekcji „O biegu" powyżej
          (max-w-[88rem] + px-6 sm:px-12), żeby lewa krawędź ramki pokrywała się
          z lewą krawędzią mapy, a prawa z prawą krawędzią karty „Zapisanych
          uczestników". Wcześniej sekcja miała własny, węższy kontener
          (max-w-[1200px] + px-8 sm:px-16) i ramka była wciśnięta o 136px z każdej
          strony przy 1440px. */}
      <section className="relative z-10 w-full px-6 sm:px-12">
        <div className="max-w-[88rem] mx-auto pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#3D4D65]">Dowiedz się więcej</span>
            <div className="h-px flex-1 bg-sr-line" />
          </div>
        </div>

        <div className="max-w-[88rem] mx-auto" style={{ paddingBottom: LUKA }}>
          <div className="rounded-3xl bg-[#FFFFFF] border border-sr-line text-[#183153] p-8 sm:p-10 shadow-lg">
            {/* Dwie równe kolumny: tekst po lewej, zdjęcie po prawej — każda po
                połowie szerokości ramki.

                Szerokość jest PROPORCJONALNA (grid-cols-2), nie podana w pikselach.
                Wcześniejsza wersja miała sztywne 720px na kolumnę zdjęcia i przez to
                wychodziła poza ramkę na wszystkim węższym niż ~1300px. Układ pionowy,
                który to naprawiał, dawał z kolei ramkę wysoką na ~970px, czyli
                niemieszczącą się na typowym ekranie. Ten wariant łączy jedno z drugim.

                Poniżej breakpointu md kolumny zwijają się do jednej i zdjęcie ląduje
                pod tekstem na pełną szerokość. */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div>
                  <span className="text-base sm:text-lg font-bold uppercase tracking-[0.18em] text-sr-red mb-2 block">Cel Charytatywny</span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sr-red to-sr-navy">
                    Hospicjum Dobrego Samarytanina
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[#183153] leading-relaxed">
                  Hospicjum Dobrego Samarytanina w Lublinie (ul. Bernardyńska 11A) otacza opieką
                  paliatywną
                  ok. <strong className="text-[#183153]">800 rodzin</strong> pacjentów z chorobami terminalnymi rocznie.
                  Środki zebrane podczas Sun Run przeznaczamy na specjalistyczny sprzęt medyczny
                  oraz doskonalenie warunków opieki.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-[#FFFFFF] border border-sr-line rounded-lg text-xs text-[#3D4D65]">
                    KRS: 0000 026 380
                  </div>
                  <div className="px-3 py-1.5 bg-[#FFFFFF] border border-sr-line rounded-lg text-xs text-[#3D4D65]">
                    ul. Bernardyńska 11A, Lublin
                  </div>
                </div>
                <a
                  href="https://hospicjum-samarytanin.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 border border-sr-red/40 hover:border-sr-red text-sr-red hover:text-sr-red font-semibold rounded-full text-sm tracking-wide transition-all duration-200 w-fit"
                >
                  Odwiedź stronę hospicjum →
                </a>
              </div>

              {/* Wysokość zdjęcia wynika z proporcji 3:2, a nie ze sztywnej wartości —
                  dzięki temu skaluje się razem z kolumną i nie ma jak wystawać. */}
              <div className="w-full aspect-[3/2] rounded-2xl overflow-hidden border border-sr-line">
                <img
                  src="/photos/hospicujm.webp"
                  alt="Hospicjum Dobrego Samarytanina w Lublinie"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      {/* ═══════════════════════════════════════════
          4. PARTNERZY — UKRYTA

          Sekcja czeka na potwierdzenie kolejnych partnerów; na razie mamy
          jednego, więc pokazywanie pięciu kafelków wprowadzałoby w błąd.
          Kod zostaje nietknięty — wystarczy przestawić POKAZ_PARTNEROW
          w src/flagi.ts na true i wraca razem z pozycją w menu bocznym.
      ═══════════════════════════════════════════ */}
      {POKAZ_PARTNEROW && (
      <section id="partnerzy" className="relative z-10 w-full min-h-screen flex items-center py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red">Wsparcie</span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase text-[#183153]">
              Partnerzy i Sponsorzy
            </h2>
          </div>
          {/* Kafelki nie są już odnośnikami — prowadziły na podstronę
              /partnerzy, której nie ma. Zniknęły razem z nimi: zachęta
              „kliknij na logo", klasa cursor-target i efekty najechania.
              Wszystkie trzy obiecywały kliknięcie, które nic by nie robiło.
              Sama zawartość kafelków czeka na decyzję sztabu. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center justify-center gap-3 p-8 bg-white border border-sr-line rounded-3xl text-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm sm:text-base font-bold text-[#183153]">
                  {p.name}
                </span>
                <span className="text-xs text-[#3D4D65] leading-snug">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══════════════════════════════════════════
          5. WSPOMNIENIA — zajawka archiwum + Stack zdjęć
      ═══════════════════════════════════════════ */}
      {/* Bez min-h-screen: sekcja miała wcześniej wymuszoną wysokość całego okna
          przy 428px treści, więc przy 1920×1080 zostawało w niej 652px pustki.
          Dolny odstęp liczy się od PRZYCISKU, nie od dołu sekcji — stos zdjęć
          sięga niżej niż przycisk, a sztab chce mierzyć lukę od przycisku
          i zignorować zdjęcia. */}
      <section
        ref={wspomnieniaRef}
        style={{ paddingBottom: dolWspomnien }}
        className="relative z-10 w-full flex items-center px-6 sm:px-12"
      >
        <div ref={siatkaWspomnienRef} className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Tekst + CTA */}
          <div className="@container space-y-6">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-sr-red block">
              Archiwum · I Edycja 2025
            </span>
            {/* Wielkość nagłówka liczona od szerokości KOLUMNY (cqw), nie okna.
                Na progach text-6xl/7xl/8xl „WSPOMNIENIA" nie mieściło się:
                na telefonie wyjeżdżało poza ekran, a od breakpointu md kolumna
                jest WĘŻSZA niż na telefonie (siatka dzieli się na dwie),
                więc napis wchodził na stos zdjęć obok. Próg oparty na
                szerokości okna nie mógł tego złapać, bo kolumna nie rośnie
                z oknem monotonicznie. */}
            <h2 className="text-[clamp(2rem,12cqw,6rem)] font-black uppercase text-[#183153] leading-none">
              Wspomnienia
            </h2>
            <p className="text-base sm:text-lg text-[#183153] leading-relaxed max-w-md">
              Ponad 350 uczestników, świetna atmosfera i realna pomoc dla hospicjum. Przeciągnij
              zdjęcia obok, a po podsumowanie edycji i galerię zajrzyj do archiwum.
            </p>
            <Link
              ref={przyciskArchiwumRef}
              href="/archiwum"
              className="cursor-target inline-flex items-center gap-2 px-9 py-4 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-base tracking-widest uppercase transition-all duration-300 shadow-lg hover:-translate-y-0.5"
            >
              Odwiedź Archiwum →
            </Link>
          </div>

          {/* Stack zdjęć — przeciągalny stos wspomnień. Na telefonie i tak nie
              widać dobrze efektu przekładania kart (Framer Motion drag), więc
              tam pokazujemy zamiast tego prostą, czytelną siatkę 2x2 tych
              samych zdjęć — bez ładowania biblioteki animacji w ogóle. */}
          {isMobile ? (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto py-6">
              {STACK_CARDS.map((card) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={card.id}
                  src={card.img}
                  alt={card.alt}
                  className="w-full aspect-square object-cover rounded-2xl border border-sr-line shadow-md"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center md:justify-end py-6">
              <Stack
                randomRotation
                sensitivity={150}
                sendToBackOnClick
                cardDimensions={{ width: rozmiarKarty, height: rozmiarKarty }}
                cardsData={STACK_CARDS}
              />
            </div>
          )}
        </div>
      </section>
      </main>

      {/* ═══════════════════════════════════════════
          6. FOOTER
      ═══════════════════════════════════════════ */}
      <Footer />

      <VisitTracker />
      <SurveyPopup />
    </div>
  );
}
