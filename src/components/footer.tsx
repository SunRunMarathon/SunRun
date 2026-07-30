import React from "react";
import SocialIcon from "./social-icon";

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

const STRONY = [
  { label: "O nas", href: "/o-nas" },
  { label: "Dla partnerów", href: "/partnerzy" },
  { label: "Archiwum I edycji", href: "/archiwum" },
  { label: "Zapisz się", href: "https://frslublin.pl" },
];

const MEDIA = [
  { name: "Instagram", url: "https://instagram.com/sunrunlublin", icon: "instagram" },
  { name: "Facebook", url: "https://facebook.com/sunrunlublin", icon: "facebook" },
  { name: "TikTok", url: "https://tiktok.com/@sunrunlublin", icon: "tiktok" },
];

export function Footer() {
  return (
    <footer className="relative z-10 w-full bg-sr-navy text-sr-sand">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Znak i opis */}
          <div className="space-y-4">
            <img
              src="/logo/sunrun-skrocone-biale.svg"
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
          </div>

          {/* Nawigacja */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest">Strony</h4>
            {STRONY.map((l) => (
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
            <h4 className="text-xs font-bold uppercase tracking-widest">Kontakt</h4>
            <a
              href="mailto:sunrunlublin@gmail.com"
              className="block text-sm text-sr-sand/80 hover:text-sr-orange transition-colors"
            >
              sunrunlublin@gmail.com
            </a>
            <p className="text-xs text-sr-sand/80">
              W sprawie partnerstw skontaktuj się z nami mailowo lub przez formularz
              w zakładce Dla Partnerów.
            </p>
          </div>

          {/* Media społecznościowe */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest">Media</h4>
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
          <p className="text-xs text-sr-sand/70">
            Hospicjum Dobrego Samarytanina · KRS 0000026380
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
