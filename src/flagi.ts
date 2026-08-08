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
 * Sekcja „Wsparcie — Partnerzy i Patroni" na stronie głównej (tuż nad stopką)
 * wraz z pozycją „Partnerzy" w menu bocznym i stopce. Włączona po
 * potwierdzeniu przez sztab kompletu partnerów 2026 (arkusz "Nasi
 * potwierdzeni sponsorzy"): patronat medialny (TVP3 Lublin, Radio Lublin,
 * Radio Free, Dziennik Wschodni, Kurier Lubelski) + sponsor (Lubella).
 */
export const POKAZ_PARTNEROW = true;
