"use client";

import { useEffect, useState } from "react";
import { surveyOptionLabel, socialMediaOptionLabel } from "@/lib/survey-options";

type SurveyResponse = {
  id: string;
  created_at: string;
  answer: string;
  answer_detail: string | null;
  other_text: string | null;
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
  visitor_id: string | null;
};

type InteractionClick = {
  category: "signup" | "social";
  visitor_id: string | null;
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
  const [signupClicks, setSignupClicks] = useState<InteractionClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);
  const [exportError, setExportError] = useState("");

  // Pobiera plik przez fetch (nie zwykly <a href>) - endpoint wymaga naglowka
  // Authorization, ktorego przegladarka nie doda przy zwyklej nawigacji.
  // Nazwe pliku bierzemy z Content-Disposition ustawionego przez serwer
  // (znacznik czasu), zamiast zgadywac ja po stronie klienta.
  const handleExport = async (format: "json" | "csv") => {
    setExporting(format);
    setExportError("");
    try {
      const res = await fetch(`/api/admin/survey-export?format=${format}`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `ankieta.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Nie udało się pobrać eksportu");
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [surveyRes, visitRes, clicksRes] = await Promise.all([
          fetch("/api/survey", { headers: { Authorization: `Bearer ${password}` } }),
          fetch("/api/visit", { headers: { Authorization: `Bearer ${password}` } }),
          fetch("/api/interaction-click", { headers: { Authorization: `Bearer ${password}` } }),
        ]);
        if (!surveyRes.ok || !visitRes.ok || !clicksRes.ok) throw new Error();
        const surveyData = await surveyRes.json();
        const visitData = await visitRes.json();
        const clicksData = await clicksRes.json();
        if (!cancelled) {
          setResponses(surveyData.responses);
          setVisitCount(visitData.count);
          setSignupClicks(
            (clicksData.clicks as InteractionClick[]).filter((c) => c.category === "signup")
          );
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

  // Łączy odpowiedź w ankiecie z późniejszym kliknięciem "Zapisz się" tej
  // samej osoby po visitor_id (lib/visitor-id.ts, trwały UUID w
  // localStorage - INNY niż client_token, patrz komentarz w api/survey).
  // Pokazuje, które źródło NIE TYLKO odpowiada w ankiecie najczęściej, ale
  // faktycznie kończy się kliknięciem "Zapisz się".
  const signupVisitorIds = new Set(
    signupClicks.map((c) => c.visitor_id).filter((id): id is string => Boolean(id))
  );
  const respondentsWithId = responses.filter((r) => r.visitor_id);
  const conversionByAnswer = Array.from(
    respondentsWithId.reduce((map, r) => {
      const label = surveyOptionLabel(r.answer);
      const entry = map.get(label) ?? { label, ankiety: 0, zapisy: 0 };
      entry.ankiety += 1;
      if (signupVisitorIds.has(r.visitor_id as string)) entry.zapisy += 1;
      map.set(label, entry);
      return map;
    }, new Map<string, { label: string; ankiety: number; zapisy: number }>())
  )
    .map(([, v]) => v)
    .sort((a, b) => b.zapisy - a.zapisy);
  const zapisyRazem = conversionByAnswer.reduce((sum, r) => sum + r.zapisy, 0);
  const socialResponses = responses.filter((r) => r.answer === "social_media");
  const socialDetailDist = countBy(socialResponses, (r) =>
    r.answer_detail ? socialMediaOptionLabel(r.answer_detail) : "nie doprecyzowano"
  );
  const otherTexts = responses
    .filter((r) => r.other_text)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
        <KpiCard label="Wejść (zliczonych)" value={visitCount === null ? "-" : String(visitCount)} />
        <KpiCard label="Conversion rate" value={conversionRate ? `${conversionRate}%` : "-"} accent />
        <KpiCard label="Najczęstsza odpowiedź" value={answerDist[0]?.key ?? "-"} />
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

      {/* Łączy odpowiedź w ankiecie z kliknięciem "Zapisz się" tej samej osoby
          (visitor_id) - odpowiada na pytanie "które źródło daje najwięcej
          odpowiedzi w ankiecie, a które najwięcej realnych zapisów", bo to
          nie zawsze to samo źródło. */}
      <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-1.5">
          Ankieta → „Zapisz się" wg źródła
        </h3>
        <p className="text-[11px] text-[#3D4D65] mb-4 leading-relaxed">
          Ile osób, które odpowiedziały w ankiecie z danego źródła, później kliknęło „Zapisz się"
          (ta sama przeglądarka). Zapisów razem: {zapisyRazem}.
        </p>
        {conversionByAnswer.length === 0 ? (
          <p className="text-sm text-[#3D4D65]">Brak danych</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[#3D4D65] uppercase tracking-wider">
                  <th className="py-2 pr-4">Źródło</th>
                  <th className="py-2 pr-4">Ankiet</th>
                  <th className="py-2 pr-4">Zapisów</th>
                  <th className="py-2">Konwersja</th>
                </tr>
              </thead>
              <tbody>
                {conversionByAnswer.map((r) => {
                  const pct = r.ankiety > 0 ? Math.round((r.zapisy / r.ankiety) * 100) : 0;
                  return (
                    <tr key={r.label} className="border-t border-sr-line">
                      <td className="py-2 pr-4 font-bold text-[#183153]">{r.label}</td>
                      <td className="py-2 pr-4 text-[#183153]">{r.ankiety}</td>
                      <td className="py-2 pr-4 text-[#183153]">{r.zapisy}</td>
                      <td className="py-2 text-sr-red font-bold">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Media społecznościowe — szczegóły ({socialResponses.length})
          </h3>
          <BarList data={socialDetailDist} total={socialResponses.length} colorClass="bg-sr-orange" />
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Wpisane „Inne" ({otherTexts.length})
          </h3>
          {otherTexts.length === 0 ? (
            <p className="text-sm text-[#3D4D65]">Brak danych</p>
          ) : (
            <ul className="space-y-2.5 max-h-64 overflow-y-auto">
              {otherTexts.map((r) => (
                <li key={r.id} className="text-sm border-b border-sr-line pb-2 last:border-0">
                  <span className="text-[#183153]">{r.other_text}</span>
                  <span className="block text-[10px] text-[#3D4D65] mt-0.5">
                    {surveyOptionLabel(r.answer)}
                    {r.answer_detail ? ` → ${socialMediaOptionLabel(r.answer_detail)}` : ""} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("pl-PL")}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
        <div className="p-6 pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-1.5">
              Surowe odpowiedzi ({total})
            </h3>
            <p className="text-[11px] text-[#3D4D65] max-w-md leading-relaxed">
              Plik zawiera dane osobowe (adresy IP, przybliżoną lokalizację) — traktuj go jak
              dane wrażliwe, nie przesyłaj dalej bez potrzeby.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleExport("json")}
              disabled={exporting !== null}
              className="px-4 py-2 border border-sr-line hover:border-sr-orange rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {exporting === "json" ? "Pobieranie…" : "Eksport JSON"}
            </button>
            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={exporting !== null}
              className="px-4 py-2 border border-sr-line hover:border-sr-orange rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {exporting === "csv" ? "Pobieranie…" : "Eksport CSV"}
            </button>
          </div>
        </div>
        {exportError && (
          <p className="text-xs text-sr-red px-6 pb-4">{exportError}</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-sr-line text-left text-[#3D4D65] uppercase tracking-wider">
                <th className="px-4 py-2.5 whitespace-nowrap">Data</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Odpowiedź</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Dopisano</th>
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
                    {r.answer_detail ? ` → ${socialMediaOptionLabel(r.answer_detail)}` : ""}
                  </td>
                  <td className="px-4 py-2.5 text-[#3D4D65] max-w-[200px] truncate" title={r.other_text ?? undefined}>
                    {r.other_text ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {r.traffic_source ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {[r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" / ") || "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {[r.city, r.country].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65] font-mono">
                    {r.ip ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {r.device_type ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {r.landing_path ?? "-"}
                  </td>
                  <td
                    className="px-4 py-2.5 text-[#3D4D65] max-w-[220px] truncate"
                    title={r.user_agent ?? undefined}
                  >
                    {r.user_agent ?? "-"}
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
