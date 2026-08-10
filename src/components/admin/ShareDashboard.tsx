"use client";

import { useEffect, useState } from "react";
import { dayDistribution } from "@/lib/day-distribution";

type ShareClick = {
  id: string;
  created_at: string;
  channel: string;
  landing_path: string | null;
};

const CHANNEL_LABELS: Record<string, string> = {
  modal_open: "Otwarcie modala",
  qr_download: "QR - pobierz PNG",
  qr_copy: "QR - kopiuj obraz",
  twitter: "X / Twitter",
  facebook: "Facebook",
  copy_link: "Kopiuj link",
  native_share: "Udostępnij (system)",
};

function countBy<T>(items: T[], keyFn: (item: T) => string): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function BarList({ data, total }: { data: { key: string; count: number }[]; total: number }) {
  if (data.length === 0) return <p className="text-sm text-[#3D4D65]">Brak danych</p>;
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.key}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="font-bold text-[#183153] truncate">
                {CHANNEL_LABELS[d.key] ?? d.key}
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

export function ShareDashboard({ password }: { password: string }) {
  const [clicks, setClicks] = useState<ShareClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/share-click", {
          headers: { Authorization: `Bearer ${password}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setClicks(data.clicks);
      } catch {
        if (!cancelled) setError("Nie udało się wczytać danych udostępnień");
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

  const total = clicks.length;
  const modalOpens = clicks.filter((c) => c.channel === "modal_open").length;
  const channelClicks = clicks.filter((c) => c.channel !== "modal_open");
  const channelDist = countBy(channelClicks, (c) => c.channel);

  const dayDist = dayDistribution(clicks, (c) => c.created_at);
  const maxDay = Math.max(1, ...dayDist.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">Otwarć modala</p>
          <p className="text-3xl font-black text-[#183153]">{modalOpens}</p>
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">
            Kliknięć w kanały
          </p>
          <p className="text-3xl font-black text-[#183153]">{channelClicks.length}</p>
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">
            Najpopularniejszy kanał
          </p>
          <p className="text-lg font-black text-[#183153] leading-tight">
            {channelDist[0] ? CHANNEL_LABELS[channelDist[0].key] ?? channelDist[0].key : "-"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Rozkład kanałów
          </h3>
          <BarList data={channelDist} total={channelClicks.length} />
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Oś czasu (kliknięcia / dzień)
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
                <th className="px-4 py-2.5 whitespace-nowrap">Kanał</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Strona</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((c) => (
                <tr key={c.id} className="border-t border-sr-line">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {new Date(c.created_at).toLocaleString("pl-PL")}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-bold text-[#183153]">
                    {CHANNEL_LABELS[c.channel] ?? c.channel}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {c.landing_path ?? "-"}
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

export default ShareDashboard;
