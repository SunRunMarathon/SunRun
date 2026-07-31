/**
 * Przełączniki widoczności fragmentów strony, które chwilowo nie mają treści,
 * ale mają wrócić. Kod zostaje na miejscu — zmiana wartości na `true` przywraca
 * element w komplecie, bez odtwarzania czegokolwiek z historii gita.
 *
 * Flaga siedzi w osobnym pliku, bo każdy taki fragment dotyka zwykle więcej niż
 * jednego miejsca (sekcja + pozycja w menu). Gdyby stałe leżały osobno w każdym
 * pliku, prędzej czy później ktoś przestawiłby jedną i zostawił drugą — czyli
 * sekcję bez odnośnika albo odnośnik prowadzący donikąd.
 */

/**
 * Sekcja „Wsparcie — Partnerzy i Sponsorzy" na stronie głównej wraz z pozycją
 * „Partnerzy" w menu bocznym. Ukryta do czasu, aż sztab potwierdzi więcej niż
 * jednego partnera.
 */
export const POKAZ_PARTNEROW = false;
