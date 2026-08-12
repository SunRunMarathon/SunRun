"use client";

import { useEffect, useState } from "react";
import { mergedDayDistribution } from "@/lib/day-distribution";

type InteractionClick = { category: "signup" | "social"; created_at: string };
type Visit = { created_at: string; visitor_id: string | null };

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">{label}</p>
      <p className="text-3xl font-black leading-tight text-[#183153]">{value}</p>
    </div>
  );
}

// Zwraca po jednej dacie na PARE (dzien, visitor_id) - wizyty tej samej
// osoby tego samego dnia znikaja, zeby po podaniu w mergedDayDistribution
// (ktora po prostu liczy wystapienia) wyszla liczba UNIKALNYCH odwiedzajacych
// dnia, a nie surowa liczba wejsc. Wizyty bez visitor_id (starsze wiersze
// sprzed dodania tego pola) sa pomijane - nie da sie ich do nikogo przypisac.
function unikalneWizytyDaty(visits: Visit[]): string[] {
  const widziane = new Set<string>();
  const wynik: string[] = [];
  for (const v of visits) {
    if (!v.visitor_id) continue;
    const dzien = new Date(v.created_at).toLocaleDateString("pl-PL");
    const klucz = `${dzien}|${v.visitor_id}`;
    if (widziane.has(klucz)) continue;
    widziane.add(klucz);
    wynik.push(v.created_at);
  }
  return wynik;
}

// Szesc zrodel, jeden wiersz na dzien - stad wlasny klucz/kolor na kolumne
// zamiast wspolnego BarList (ten zaklada JEDNA serie na wykres, tu potrzeba
// szesciu obok siebie w tym samym wierszu).
const KOLUMNY = [
  { klucz: "wizyty", etykieta: "Wizyty", kolor: "bg-[#183153]" },
  { klucz: "unikalni", etykieta: "Unikalni odwiedzający", kolor: "bg-sr-slate" },
  { klucz: "zapisz_sie", etykieta: "Kliknięcia „Zapisz się”", kolor: "bg-sr-orange" },
  { klucz: "social", etykieta: "Kliknięcia social media", kolor: "bg-sr-brick" },
  { klucz: "ankieta", etykieta: "Ankieta", kolor: "bg-sr-red" },
  { klucz: "zaproszenie", etykieta: "Zaproszenie", kolor: "bg-emerald-600" },
] as const;

export function TimelineDashboard({ password }: { password: string }) {
  const [dni, setDni] = useState<{ key: string; counts: Record<string, number> }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const naglowek = { Authorization: `Bearer ${password}` };
        const [visitTotalRes, visitRes, clicksRes, surveyRes, referralRes] = await Promise.all([
          fetch("/api/visit-total", { headers: naglowek }),
          fetch("/api/visit", { headers: naglowek }),
          fetch("/api/interaction-click", { headers: naglowek }),
          fetch("/api/survey", { headers: naglowek }),
          fetch("/api/referral", { headers: naglowek }),
        ]);
        if (!visitTotalRes.ok || !visitRes.ok || !clicksRes.ok || !surveyRes.ok || !referralRes.ok) {
          throw new Error();
        }
        const [visitTotalData, visitData, clicksData, surveyData, referralData] = await Promise.all([
          visitTotalRes.json(),
          visitRes.json(),
          clicksRes.json(),
          surveyRes.json(),
          referralRes.json(),
        ]);
        if (cancelled) return;

        const clicks = clicksData.clicks as InteractionClick[];
        const signupClicks = clicks.filter((c) => c.category === "signup");
        const socialClicks = clicks.filter((c) => c.category === "social");
        const visits = visitData.visits as Visit[];
        const visitsTotal = visitTotalData.visits as { created_at: string }[];

        const polaczone = mergedDayDistribution([
          // "Wizyty" = kazde wejscie, niezaleznie od zgody (api/visit-total,
          // anonimowy licznik). "Unikalni" nadal tylko od tych, ktorzy
          // zgodzili sie na analityke - tylko wtedy mamy identyfikator
          // pozwalajacy odroznic te sama osobe od nowej (api/visit).
          { name: "wizyty", dates: visitsTotal.map((v) => v.created_at) },
          { name: "unikalni", dates: unikalneWizytyDaty(visits) },
          { name: "zapisz_sie", dates: signupClicks.map((c) => c.created_at) },
          { name: "social", dates: socialClicks.map((c) => c.created_at) },
          { name: "ankieta", dates: surveyData.responses.map((r: { created_at: string }) => r.created_at) },
          { name: "zaproszenie", dates: referralData.referrals.map((r: { created_at: string }) => r.created_at) },
        ]);
        // Najnowszy dzien na gorze - tak samo jak wszystkie inne listy w tym
        // panelu (zaproszenia, surowe odpowiedzi ankiety, wizyty).
        setDni(polaczone.slice().reverse());
      } catch {
        if (!cancelled) setError("Nie udało się wczytać osi czasu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [password]);

  if (loading) {
    return (
      <div className="bg-white border border-sr-line rounded-3xl p-12 text-center text-[#3D4D65] text-sm shadow-sm">
        Wczytywanie…
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white border border-sr-line rounded-3xl p-12 text-center text-sr-red text-sm shadow-sm">
        {error}
      </div>
    );
  }
  if (dni.length === 0) {
    return (
      <div className="bg-white border border-sr-line rounded-3xl p-12 text-center text-[#3D4D65] text-sm shadow-sm">
        Brak danych - oś czasu wypełni się, gdy zbiorą się pierwsze wizyty, kliknięcia lub zgłoszenia.
      </div>
    );
  }

  const sumy = KOLUMNY.reduce(
    (acc, k) => ({ ...acc, [k.klucz]: dni.reduce((s, d) => s + (d.counts[k.klucz] ?? 0), 0) }),
    {} as Record<string, number>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {KOLUMNY.map((k) => (
          <KpiCard key={k.klucz} label={k.etykieta} value={String(sumy[k.klucz])} />
        ))}
      </div>

      <div className="bg-white border border-sr-line rounded-2xl shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] p-6 pb-4">
          Statystyki wg dnia
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-sr-line text-left text-[#3D4D65] uppercase tracking-wider">
                <th className="px-4 py-2.5 whitespace-nowrap">Data</th>
                {KOLUMNY.map((k) => (
                  <th key={k.klucz} className="px-4 py-2.5 whitespace-nowrap">
                    {k.etykieta}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dni.map((d) => {
                const maxDzien = Math.max(1, ...KOLUMNY.map((k) => d.counts[k.klucz] ?? 0));
                return (
                  <tr key={d.key} className="border-t border-sr-line">
                    <td className="px-4 py-2.5 whitespace-nowrap font-bold text-[#183153]">{d.key}</td>
                    {KOLUMNY.map((k) => {
                      const wartosc = d.counts[k.klucz] ?? 0;
                      const pct = Math.max((wartosc / maxDzien) * 100, wartosc > 0 ? 8 : 0);
                      return (
                        <td key={k.klucz} className="px-4 py-2.5 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#183153] font-bold w-5 text-right shrink-0">
                              {wartosc}
                            </span>
                            <div className="h-2 flex-1 rounded-full bg-[#183153]/10 overflow-hidden">
                              <div
                                className={`h-full ${k.kolor} rounded-full`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TimelineDashboard;
