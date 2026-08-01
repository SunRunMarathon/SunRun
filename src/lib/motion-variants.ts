import type { Variants } from "framer-motion";

// Wspólne warianty animacji wejścia/wyjścia dla popupów i modali (ankieta,
// "Udostępnij", baner cookies). Tylko transform + opacity — żadnych
// właściwości layoutu, żeby nie tracić płynności na słabszych telefonach.
//
// Gdy reducedMotion=true, transition ma duration:0 — użytkownik dostaje
// natychmiastowe pokazanie/schowanie zamiast animacji, zgodnie z
// prefers-reduced-motion.

export function getBackdropVariants(reducedMotion: boolean): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reducedMotion ? 0 : 0.22, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: reducedMotion ? 0 : 0.18, ease: "easeIn" } },
  };
}

// Modal na środku/dole ekranu (ankieta, "Udostępnij") — delikatny scale +
// przesunięcie w górę przy wejściu, tak samo przy wyjściu w dół.
export function getModalPanelVariants(reducedMotion: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 16, scale: reducedMotion ? 1 : 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reducedMotion ? 0 : 0.24, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: reducedMotion ? 0 : 12,
      scale: reducedMotion ? 1 : 0.98,
      transition: { duration: reducedMotion ? 0 : 0.18, ease: "easeIn" },
    },
  };
}

// Przejście między krokami wewnątrz jednego popupu (np. pytanie główne →
// pytanie doprecyzowujące w ankiecie) — delikatny poziomy slide + fade,
// krótszy niż wejście/wyjście całego modala, bo to tylko zmiana treści w
// środku, nie pojawienie się nowego okna.
export function getStepVariants(reducedMotion: boolean): Variants {
  return {
    hidden: { opacity: 0, x: reducedMotion ? 0 : 10 },
    visible: { opacity: 1, x: 0, transition: { duration: reducedMotion ? 0 : 0.18, ease: "easeOut" } },
    exit: { opacity: 0, x: reducedMotion ? 0 : -10, transition: { duration: reducedMotion ? 0 : 0.14, ease: "easeIn" } },
  };
}

// Pasek przyklejony do dołu ekranu (baner cookies) — wjeżdża z dołu.
export function getBottomBarVariants(reducedMotion: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0 : 0.26, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: reducedMotion ? 0 : 20,
      transition: { duration: reducedMotion ? 0 : 0.2, ease: "easeIn" },
    },
  };
}
