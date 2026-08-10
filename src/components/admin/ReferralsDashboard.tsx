"use client";

import { useEffect, useState } from "react";

type Referral = {
  id: string;
  created_at: string;
  code: string;
  inviter_name: string;
  inviter_email: string;
  inviter_start_number: string;
  verified: boolean;
};

type Hit = {
  code: string;
  visitor_id: string | null;
};

type Click = {
  category: "signup" | "social";
  visitor_id: string | null;
};

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

export function ReferralsDashboard({ password }: { password: string }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [hits, setHits] = useState<Hit[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [referralsRes, hitsRes, clicksRes] = await Promise.all([
        fetch("/api/referral", { headers: { Authorization: `Bearer ${password}` } }),
        fetch("/api/referral/visit", { headers: { Authorization: `Bearer ${password}` } }),
        fetch("/api/interaction-click", { headers: { Authorization: `Bearer ${password}` } }),
      ]);
      if (!referralsRes.ok || !hitsRes.ok || !clicksRes.ok) throw new Error();
      const referralsData = await referralsRes.json();
      const hitsData = await hitsRes.json();
      const clicksData = await clicksRes.json();
      setReferrals(referralsData.referrals);
      setHits(hitsData.hits);
      setClicks(clicksData.clicks);
    } catch {
      setError("Nie udało się wczytać danych poleceń");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const toggleVerified = async (r: Referral) => {
    setSavingId(r.id);
    try {
      const res = await fetch("/api/referral", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${password}` },
        body: JSON.stringify({ id: r.id, verified: !r.verified }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Nie udało się zapisać zmiany");
    } finally {
      setSavingId(null);
    }
  };

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
  if (referrals.length === 0) {
    return (
      <div className="bg-white border border-sr-line rounded-3xl p-12 text-center text-[#3D4D65] text-sm shadow-sm">
        Brak linków poleceń - gdy ktoś wygeneruje swój link na stronie głównej, pojawi się tutaj.
      </div>
    );
  }

  // Konwersja liczona po visitor_id (lib/visitor-id.ts, ten sam mechanizm co
  // korelacja ankieta -> zapis w SurveyDashboard.tsx): dla kazdego kodu
  // patrzymy, ile UNIKALNYCH przegladarek wejsc na jego link potem kliknelo
  // "Zapisz sie" gdziekolwiek na stronie.
  const signupVisitorIds = new Set(
    clicks.filter((c) => c.category === "signup" && c.visitor_id).map((c) => c.visitor_id as string)
  );
  const visitorsByCode = new Map<string, Set<string>>();
  for (const h of hits) {
    if (!h.visitor_id) continue;
    const set = visitorsByCode.get(h.code) ?? new Set<string>();
    set.add(h.visitor_id);
    visitorsByCode.set(h.code, set);
  }

  const rows = referrals
    .map((r) => {
      const visitorSet = visitorsByCode.get(r.code) ?? new Set<string>();
      const wejscia = visitorSet.size;
      const zapisy = Array.from(visitorSet).filter((id) => signupVisitorIds.has(id)).length;
      return { ...r, wejscia, zapisy };
    })
    .sort((a, b) => b.zapisy - a.zapisy || b.wejscia - a.wejscia);

  const verifiedCount = referrals.filter((r) => r.verified).length;
  const wejsciaRazem = rows.reduce((sum, r) => sum + r.wejscia, 0);
  const zapisyRazem = rows.reduce((sum, r) => sum + r.zapisy, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Wygenerowanych linków" value={String(referrals.length)} />
        <KpiCard label="Zweryfikowanych" value={String(verifiedCount)} />
        <KpiCard label="Wejść przez linki" value={String(wejsciaRazem)} />
        <KpiCard label="Zapisów z poleceń" value={String(zapisyRazem)} accent />
      </div>

      <div className="bg-white border border-sr-line rounded-2xl shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] p-6 pb-4">
          Ranking poleceń
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-sr-line text-left text-[#3D4D65] uppercase tracking-wider">
                <th className="px-4 py-2.5 whitespace-nowrap">Zaprosił(a)</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Nr startowy</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Wejść</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Zapisów</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Konwersja</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Weryfikacja</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = r.wejscia > 0 ? Math.round((r.zapisy / r.wejscia) * 100) : 0;
                return (
                  <tr key={r.id} className="border-t border-sr-line">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-bold text-[#183153]">{r.inviter_name}</span>
                      <span className="block text-[10px] text-[#3D4D65]">{r.inviter_email}</span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                      {r.inviter_start_number}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">{r.wejscia}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">{r.zapisy}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sr-red font-bold">{pct}%</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={savingId === r.id}
                        onClick={() => toggleVerified(r)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
                          r.verified
                            ? "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20"
                            : "bg-sr-line/40 text-[#3D4D65] hover:bg-sr-line/70"
                        }`}
                      >
                        {savingId === r.id ? "…" : r.verified ? "Zweryfikowany" : "Niezweryfikowany"}
                      </button>
                    </td>
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

export default ReferralsDashboard;
