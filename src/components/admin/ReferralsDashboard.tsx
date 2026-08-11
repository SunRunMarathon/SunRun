"use client";

import { useEffect, useState } from "react";

type Referral = {
  id: string;
  created_at: string;
  inviter_name: string;
  inviter_email: string;
  invited_email: string;
  verified: boolean;
};

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-sr-line rounded-2xl p-5 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-[#3D4D65] mb-1">{label}</p>
      <p className="text-3xl font-black leading-tight text-[#183153]">{value}</p>
    </div>
  );
}

export function ReferralsDashboard({ password }: { password: string }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/referral", { headers: { Authorization: `Bearer ${password}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReferrals(data.referrals);
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
        Brak wypełnionych formularzy - gdy ktoś wyśle formularz na stronie głównej, pojawi się tutaj.
      </div>
    );
  }

  const rows = [...referrals].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Wypełnionych formularzy" value={String(referrals.length)} />
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
                <th className="px-4 py-2.5 whitespace-nowrap">Zaproszono</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Weryfikacja</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-sr-line">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="font-bold text-[#183153]">{r.inviter_name}</span>
                    <span className="block text-[10px] text-[#3D4D65]">{r.inviter_email}</span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {r.invited_email}
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReferralsDashboard;
