// Jedna wspólna wartość odstępu między sekcjami strony głównej - wysokość
// kafelka „Zapisanych uczestników" w sekcji „O biegu" (166px, niezależnie od
// szerokości okna - sprawdzone od 1920 do 390px). Każda sekcja ma kończyć się
// dokładnie tym odstępem, zamiast osobno wklepanych marginesów - stąd jedna
// stała importowana wszędzie, gdzie potrzebny jest ten odstęp (src/app/page.tsx
// oraz komponenty sekcji renderowane osobno, np. FaqSection.tsx).
export const SECTION_GAP = 166;
