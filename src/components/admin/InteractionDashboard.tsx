"use client";

import { useEffect, useState } from "react";

type InteractionClick = {
  id: string;
  created_at: string;
  category: "signup" | "social";
  location: string;
  landing_path: string | null;
};

const SIGNUP_LABELS: Record<string, string> = {
  navbar: "Menu (navbar)",
  sticky_bar: "Dolny pasek sticky",
  hero: "Hero (góra strony)",
  footer: "Stopka",
  archiwum: "Strona Archiwum",
  referral: "Strona zaproszenia",
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
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

function BarList({
  data,
  total,
  labels,
}: {
  data: { key: string; count: number }[];
  total: number;
  labels: Record<string, string>;
}) {
  if (data.length === 0) return <p className="text-sm text-[#3D4D65]">Brak danych</p>;
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.key}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="font-bold text-[#183153] truncate">{labels[d.key] ?? d.key}</span>
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

export function InteractionDashboard({ password }: { password: string }) {
  const [clicks, setClicks] = useState<InteractionClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/interaction-click", {
          headers: { Authorization: `Bearer ${password}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setClicks(data.clicks);
      } catch {
        if (!cancelled) setError("Nie udało się wczytać danych kliknięć");
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

  const signupClicks = clicks.filter((c) => c.category === "signup");
  const socialClicks = clicks.filter((c) => c.category === "social");
  const signupDist = countBy(signupClicks, (c) => c.location);
  const socialDist = countBy(socialClicks, (c) => c.location);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">
            Kliknięć „Zapisz się"
          </p>
          <p className="text-3xl font-black text-[#183153]">{signupClicks.length}</p>
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">
            Najpopularniejsze miejsce
          </p>
          <p className="text-lg font-black text-[#183153] leading-tight">
            {signupDist[0] ? SIGNUP_LABELS[signupDist[0].key] ?? signupDist[0].key : "-"}
          </p>
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">
            Kliknięć w social media
          </p>
          <p className="text-3xl font-black text-[#183153]">{socialClicks.length}</p>
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">
            Najpopularniejsza platforma
          </p>
          <p className="text-lg font-black text-[#183153] leading-tight">
            {socialDist[0] ? SOCIAL_LABELS[socialDist[0].key] ?? socialDist[0].key : "-"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            „Zapisz się" wg lokalizacji
          </h3>
          <BarList data={signupDist} total={signupClicks.length} labels={SIGNUP_LABELS} />
        </div>
        <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-4">
            Social media wg platformy
          </h3>
          <BarList data={socialDist} total={socialClicks.length} labels={SOCIAL_LABELS} />
        </div>
      </div>

      <div className="bg-white border border-sr-line rounded-2xl shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] p-6 pb-4">
          Surowe zdarzenia ({clicks.length})
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-sr-line text-left text-[#3D4D65] uppercase tracking-wider sticky top-0 bg-white">
                <th className="px-4 py-2.5 whitespace-nowrap">Data</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Kategoria</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Lokalizacja</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Strona</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((c) => (
                <tr key={c.id} className="border-t border-sr-line">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {new Date(c.created_at).toLocaleString("pl-PL")}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#3D4D65]">
                    {c.category === "signup" ? "Zapisz się" : "Social media"}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-bold text-[#183153]">
                    {(c.category === "signup" ? SIGNUP_LABELS : SOCIAL_LABELS)[c.location] ??
                      c.location}
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

export default InteractionDashboard;
