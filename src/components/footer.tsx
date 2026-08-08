"use client";

import React from "react";
import SocialIcon from "./social-icon";
import ShareModal from "./ShareModal";
import { resetConsent } from "@/lib/consent";
import { POKAZ_PARTNEROW } from "@/flagi";

/**
 * Wspólna stopka serwisu.
 *
 * Kolorystyka jest odwróceniem reszty strony: granatowe tło #183153 z piaskowym
 * tekstem #F4D8A2 (kontrast 9,48:1 — ten sam co odwrotnie na jasnych sekcjach).
 * Odwrócenie wyraźnie oddziela stopkę od treści bez dokładania nowych barw.
 *
 * Logo w wariancie białym — zgodnie z księgą znaku na ciemnych powierzchniach
 * znak pozostaje biały, nie kolorowy.
 *
 * Pomarańcz służy tu wyłącznie jako kolor najechania: na granacie ma 5,2:1,
 * więc jest czytelny (na jasnym tle byłby niedopuszczalny — patrz tabela
 * dozwolonych zestawień w globals.css).
 */

// Bez „Dla partnerów" — podstrona /partnerzy została usunięta. Sekcja
// z partnerami żyje dalej na stronie głównej pod kotwicą #partnerzy (patrz
// POKAZ_PARTNEROW w src/flagi.ts) - stąd link do niej dopisywany warunkowo
// niżej, nie na sztywno w tej tablicy.
const STRONY = [
  { label: "O nas", href: "/o-nas" },
  { label: "Archiwum I edycji", href: "/archiwum" },
  { label: "Zapisz się", href: "https://frslublin.pl/pl/app/races/sign_up_form/295" },
  { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
];

const MEDIA = [
  { name: "Instagram", url: "https://www.instagram.com/sunrun.lublin/", icon: "instagram" },
  { name: "Facebook", url: "https://www.facebook.com/sun.run.charytatywny/", icon: "facebook" },
  { name: "TikTok", url: "https://www.tiktok.com/@sun.run_", icon: "tiktok" },
];

export function Footer() {
  return (
    <footer className="relative z-10 w-full bg-sr-navy text-sr-sand">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Kolumny nie są równe: KONTAKT dostaje więcej miejsca, bo adres
            e-mail ma 36 znaków i w równym podziale na cztery nie mieścił się
            w swojej kolumnie — wylewał się na znak Instagrama w kolumnie MEDIA.
            Ujawniło się to dopiero po zmianie czcionki na Montserrat, szerszą
            od wcześniejszej zastępczej. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1.45fr_0.85fr] gap-10">
          {/* Znak i opis */}
          <div className="space-y-4">
            <img
              src="/logo/sunrun-skrocone-piaskowe.svg"
              alt="Sun Run"
              width={94}
              height={56}
              style={{ height: 56, width: "auto", display: "block" }}
              draggable={false}
            />
            <p className="text-xs leading-relaxed text-sr-sand/80">
              Bieg charytatywny dla Hospicjum Dobrego Samarytanina w Lublinie.
              Inicjatywa lubelskiej młodzieży.
            </p>
            <ShareModal />
          </div>

          {/* Nawigacja */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-widest">Strony</h4>
            {(POKAZ_PARTNEROW ? [...STRONY, { label: "Partnerzy", href: "/#partnerzy" }] : STRONY).map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block text-sm text-sr-sand/80 hover:text-sr-orange transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Kontakt */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-widest">Kontakt</h4>
            <a
              href="mailto:hospicjum.samarytanin.bieg@gmail.com"
              className="block text-sm text-sr-sand/80 hover:text-sr-orange transition-colors break-words"
            >
              hospicjum.samarytanin.bieg@gmail.com
            </a>
            <p className="text-xs text-sr-sand/80">
              W sprawie partnerstw skontaktuj się z nami mailowo.
            </p>
          </div>

          {/* Media społecznościowe */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-widest">Media</h4>
            <div className="flex flex-col gap-2">
              {MEDIA.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-sr-sand/80 hover:text-sr-orange transition-colors"
                >
                  {/* Ramka zostaje — daje równy rytm i większy cel kliknięcia.
                      Znak w wersji BIAŁEJ, bo tło stopki jest ciemne. Meta
                      i TikTok dopuszczają tylko biel albo czerń. */}
                  <span className="w-7 h-7 rounded-lg bg-sr-sand/10 border border-sr-sand/25 group-hover:border-sr-orange/60 flex items-center justify-center transition-colors">
                    <SocialIcon name={s.icon} size={16} tone="white" />
                  </span>
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sr-sand/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-sr-sand/70">
            © 2026 Sun Run Lublin · Wszelkie prawa zastrzeżone
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <p className="text-xs text-sr-sand/70">
              Hospicjum Dobrego Samarytanina · KRS 0000026380
            </p>
            {/* Wycofanie zgody na analitykę ma być tak samo łatwe jak jej
                udzielenie (jedno kliknięcie w banerze) - ten link czyści
                zapisany wybór i przywraca baner od razu, bez grzebania w
                ustawieniach przeglądarki. Patrz src/lib/consent.ts. */}
            <button
              type="button"
              onClick={resetConsent}
              className="text-xs text-sr-sand/70 underline hover:text-sr-orange transition-colors"
            >
              Zarządzaj zgodą
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
