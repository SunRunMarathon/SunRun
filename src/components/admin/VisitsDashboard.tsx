"use client";

import { useEffect, useState } from "react";

type Visit = {
  id: string;
  created_at: string;
  traffic_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  landing_path: string | null;
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Bezpośrednio / zakładka",
  organic: "Wyszukiwarka",
  social: "Social media",
  referral: "Inna strona (referral)",
  qr: "Kod QR",
};

function countBy(items: Visit[], keyFn: (item: Visit) => string): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function BarList({
  data,
  total,
  labels,
}: {
  data: { key: string; count: number }[];
  total: number;
  labels?: Record<string, string>;
}) {
  if (data.length === 0) return <p className="text-sm text-[#3D4D65]">Brak danych</p>;
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.key}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="font-bold text-[#183153] truncate">
                {labels?.[d.key] ?? d.key}
              </span>
              <span className="text-[#3D4D65] shrink-0">
                {d.count} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#183153]/10 overflow-hidden">
              <div className="h-full bg-sr-orange rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VisitsDashboard({ password }: { password: string }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/visit", {
          headers: { Authorization: `Bearer ${password}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setVisits(data.visits ?? []);
      } catch {
        if (!cancelled) setError("Nie udało się wczytać danych wejść");
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

  const total = visits.length;
  // Wejście przez QR ma traffic_source="qr" TYLKO gdy detectTrafficSource
  // (src/lib/request-meta.ts) rozpozna utm_medium=qr - dokładnie ten parametr
  // dopisuje ShareModal.tsx do linku pod kodem QR (buildUrl("qr")).
  const qrVisits = visits.filter((v) => v.utm_medium === "qr").length;
  const sourceDist = countBy(visits, (v) => v.traffic_source || "direct");
  const deviceDist = countBy(visits, (v) => v.device_type || "nieznane");

  const dayDist = countBy(visits, (v) => new Date(v.created_at).toLocaleDateString("pl-PL")).sort(
    (a, b) => {
      const da = a.key.split(".").reverse().join("-");
      const db = b.key.split(".").reverse().join("-");
      return da.localeCompare(db);
    }
  );
  const maxDay = Math.max(1, ...dayDist.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">Wejść na stronę</p>
          <p className="text-3xl font-black text-[#183153]">{total}</p>
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">Wejść przez kod QR</p>
          <p className="text-3xl font-black text-[#183153]">{qrVisits}</p>
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">Główne źródło</p>
          <p className="text-lg font-black text-[#183153] leading-tight">
            {sourceDist[0] ? SOURCE_LABELS[sourceDist[0].key] ?? sourceDist[0].key : "-"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Źródła ruchu
          </h3>
          <BarList data={sourceDist} total={total} labels={SOURCE_LABELS} />
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Urządzenia
          </h3>
          <BarList data={deviceDist} total={total} />
        </div>
      </div>

      <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
          Oś czasu (wejścia / dzień)
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
                  className="w-full bg-sr-red rounded-t"
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

      <div className="bg-white border border-sr-line rounded-2xl shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] p-6 pb-4">
          Surowe zdarzenia ({total})
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-sr-line text-left text-[#3D4D65] uppercase tracking-wider sticky top-0 bg-white">
                <th className="px-4 py-2.5 whitespace-nowrap">Data</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Źródło</th>
                <th className="px-4 py-2.5 whitespace-nowrap">utm_medium</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Urządzenie</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Strona</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id} className="border-t border-sr-line">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {new Date(v.created_at).toLocaleString("pl-PL")}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-bold text-[#183153]">
                    {SOURCE_LABELS[v.traffic_source || "direct"] ?? v.traffic_source ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {v.utm_medium ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {v.device_type ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {v.landing_path ?? "-"}
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

export default VisitsDashboard;
