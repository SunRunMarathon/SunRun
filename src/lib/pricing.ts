// Progi MINIMALNEJ wpłaty - to bieg charytatywny, więc wpłata jest darowizną
// z progiem minimalnym, nie sztywną ceną biletu. Kwoty rosną z czasem, żeby
// zachęcić do wcześniejszych zapisów, ale każdy próg dopuszcza wpłatę wyższą
// niż minimum.
//
// JEDNO ŹRÓDŁO PRAWDY dla trzech miejsc, które muszą się zgadzać co do znaku:
// - kompaktowa oś czasu w sekcji „O biegu" (src/app/page.tsx),
// - odpowiedź FAQ „ile kosztuje udział" (src/components/FaqSection.tsx),
// - offers w danych strukturalnych SportsEvent (src/components/StructuredData.tsx).
// Google dostaje dokładnie to, co widzi człowiek na stronie - inaczej to
// cloaking, nie poprawne oznaczenie danych. Zmieniasz próg tutaj -> sprawdź,
// czy FAQ i StructuredData nadal się zgadzają (nie da się tego zaimportować
// do samego JSON-LD, bo to zwykły obiekt, nie komponent).
export type Tier = {
  id: string;
  label: string;
  amount: number;
  deadlineLabel: string;
  // Koniec obowiązywania progu (włącznie, koniec dnia czasu polskiego).
  activeUntil: string;
};

export const TIERS: Tier[] = [
  { id: "t1", label: "I termin", amount: 60, deadlineLabel: "do 9 sierpnia 2026", activeUntil: "2026-08-09T23:59:59+02:00" },
  { id: "t2", label: "II termin", amount: 70, deadlineLabel: "do 9 września 2026", activeUntil: "2026-09-09T23:59:59+02:00" },
  { id: "t3", label: "III termin", amount: 80, deadlineLabel: "w dniu biegu (12 września 2026)", activeUntil: "2026-09-12T23:59:59+02:00" },
];

// Liczone z aktualnej daty, nie zaszyte na sztywno - inaczej strona zaczęłaby
// pokazywać nieaktualny próg dzień po każdym terminie. Po terminie III (czyli
// po samym biegu) zwraca ostatni próg - to i tak już nieaktywny formularz zapisu.
export function getActiveTierIndex(now: Date): number {
  for (let i = 0; i < TIERS.length; i++) {
    if (now.getTime() <= new Date(TIERS[i].activeUntil).getTime()) return i;
  }
  return TIERS.length - 1;
}

export const REJESTRACJA_URL = "https://frslublin.pl/pl/app/races/sign_up_form/295";
