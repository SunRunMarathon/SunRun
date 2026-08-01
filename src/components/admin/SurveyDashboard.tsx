"use client";

import { useEffect, useState } from "react";
import { surveyOptionLabel } from "@/lib/survey-options";

type SurveyResponse = {
  id: string;
  created_at: string;
  answer: string;
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  referrer: string | null;
  traffic_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  user_agent: string | null;
  device_type: string | null;
  landing_path: string | null;
};

function countBy<T>(items: T[], keyFn: (item: T) => string | null): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item) || "nieznane";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function BarList({
  data,
  total,
  colorClass = "bg-sr-orange",
}: {
  data: { key: string; count: number }[];
  total: number;
  colorClass?: string;
}) {
  if (data.length === 0) return <p className="text-sm text-[#3D4D65]">Brak danych</p>;
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.key}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="font-bold text-[#183153] truncate">{d.key}</span>
              <span className="text-[#3D4D65] shrink-0">
                {d.count} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#183153]/10 overflow-hidden">
              <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">{label}</p>
      <p className={`text-3xl font-black leading-tight ${accent ? "text-sr-red" : "text-[#183153]"}`}>
        {value}
      </p>
    </div>
  );
}

export function SurveyDashboard({ password }: { password: string }) {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [surveyRes, visitRes] = await Promise.all([
          fetch("/api/survey", { headers: { Authorization: `Bearer ${password}` } }),
          fetch("/api/visit", { headers: { Authorization: `Bearer ${password}` } }),
        ]);
        if (!surveyRes.ok || !visitRes.ok) throw new Error();
        const surveyData = await surveyRes.json();
        const visitData = await visitRes.json();
        if (!cancelled) {
          setResponses(surveyData.responses);
          setVisitCount(visitData.count);
        }
      } catch {
        if (!cancelled) setError("Nie udało się wczytać danych ankiety");
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

  const total = responses.length;
  const conversionRate =
    visitCount && visitCount > 0 ? ((total / visitCount) * 100).toFixed(1) : null;

  const answerDist = countBy(responses, (r) => surveyOptionLabel(r.answer));
  const sourceDist = countBy(responses, (r) => r.traffic_source);
  const countryDist = countBy(responses, (r) => r.country).slice(0, 10);
  const cityDist = countBy(responses, (r) => r.city).slice(0, 10);
  const deviceDist = countBy(responses, (r) => r.device_type);

  const dayDist = countBy(responses, (r) => new Date(r.created_at).toLocaleDateString("pl-PL")).sort(
    (a, b) => {
      const da = a.key.split(".").reverse().join("-");
      const db = b.key.split(".").reverse().join("-");
      return da.localeCompare(db);
    }
  );
  const maxDay = Math.max(1, ...dayDist.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Wypełnień ankiety" value={String(total)} />
        <KpiCard label="Wejść (zliczonych)" value={visitCount === null ? "—" : String(visitCount)} />
        <KpiCard label="Conversion rate" value={conversionRate ? `${conversionRate}%` : "—"} accent />
        <KpiCard label="Najczęstsza odpowiedź" value={answerDist[0]?.key ?? "—"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Rozkład odpowiedzi
          </h3>
          <BarList data={answerDist} total={total} />
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Źródło ruchu
          </h3>
          <BarList data={sourceDist} total={total} colorClass="bg-sr-red" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">Kraj</h3>
          <BarList data={countryDist} total={total} />
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">Miasto</h3>
          <BarList data={cityDist} total={total} colorClass="bg-sr-red" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Urządzenie
          </h3>
          <BarList data={deviceDist} total={total} />
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Oś czasu (odpowiedzi / dzień)
          </h3>
          {dayDist.length === 0 ? (
            <p className="text-sm text-[#3D4D65]">Brak danych</p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {dayDist.map((d) => (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0"
                  title={`${d.key}: ${d.count}`}
                >
                  <div
                    className="w-full bg-sr-orange rounded-t"
                    style={{ height: `${Math.max((d.count / maxDay) * 100, 4)}%` }}
                  />
                  <span className="text-[9px] text-[#3D4D65] whitespace-nowrap truncate w-full text-center">
                    {d.key.slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-sr-line rounded-2xl shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] p-6 pb-4">
          Surowe odpowiedzi ({total})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-sr-line text-left text-[#3D4D65] uppercase tracking-wider">
                <th className="px-4 py-2.5 whitespace-nowrap">Data</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Odpowiedź</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Źródło</th>
                <th className="px-4 py-2.5 whitespace-nowrap">UTM</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Lokalizacja</th>
                <th className="px-4 py-2.5 whitespace-nowrap">IP</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Urządzenie</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Wejście</th>
                <th className="px-4 py-2.5">User agent</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id} className="border-t border-sr-line">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {new Date(r.created_at).toLocaleString("pl-PL")}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-bold text-[#183153]">
                    {surveyOptionLabel(r.answer)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {r.traffic_source ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {[r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {[r.city, r.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65] font-mono">
                    {r.ip ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {r.device_type ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {r.landing_path ?? "—"}
                  </td>
                  <td
                    className="px-4 py-2.5 text-[#3D4D65] max-w-[220px] truncate"
                    title={r.user_agent ?? undefined}
                  >
                    {r.user_agent ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SurveyDashboard;
