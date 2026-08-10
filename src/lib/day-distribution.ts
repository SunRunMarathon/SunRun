// Rozkład zdarzeń wg dnia (oś czasu w panelu admina - Ankieta/Wizyty/Kliknięcia).
// Poprzednia wersja sortowała po STRINGU z toLocaleDateString("pl-PL")
// (np. "2.08.2026"), ktory pl-PL NIE zero-paduje - dzien "2" jako string jest
// WIEKSZY niz "11" ("2" > "1" leksykograficznie), wiec np. 2 sierpnia ladowal
// na wykresie PO 11 sierpnia. Tutaj sortujemy po prawdziwym Date, etykieta
// tekstowa sluzy tylko do wyswietlenia.
export function dayDistribution<T>(
  items: T[],
  createdAtFn: (item: T) => string
): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  const sortKeys = new Map<string, number>();
  for (const item of items) {
    const d = new Date(createdAtFn(item));
    const key = d.toLocaleDateString("pl-PL");
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!sortKeys.has(key)) {
      sortKeys.set(key, new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
    }
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => sortKeys.get(a.key)! - sortKeys.get(b.key)!);
}
