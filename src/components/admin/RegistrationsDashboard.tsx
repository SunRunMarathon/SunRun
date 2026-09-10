"use client";

import { useEffect, useState } from "react";

type Registration = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  birth_year: number;
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

export function RegistrationsDashboard({ password }: { password: string }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/registration", { headers: { Authorization: `Bearer ${password}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRegistrations(data.registrations);
    } catch {
      setError("Nie udało się wczytać zgłoszeń");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const toggleVerified = async (r: Registration) => {
    setSavingId(r.id);
    try {
      const res = await fetch("/api/registration", {
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
  if (registrations.length === 0) {
    return (
      <div className="bg-white border border-sr-line rounded-3xl p-12 text-center text-[#3D4D65] text-sm shadow-sm">
        Brak zgłoszeń - gdy ktoś wypełni popup „Zapisz się”, pojawi się tutaj.
      </div>
    );
  }

  const rows = [...registrations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const verifiedCount = registrations.filter((r) => r.verified).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Zgłoszeń" value={String(registrations.length)} />
        <KpiCard label="Zweryfikowanych" value={String(verifiedCount)} />
      </div>

      <div className="bg-white border border-sr-line rounded-2xl shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] p-6 pb-4">
          Rejestracje
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-sr-line text-left text-[#3D4D65] uppercase tracking-wider">
                <th className="px-4 py-2.5 whitespace-nowrap">Imię i nazwisko</th>
                <th className="px-4 py-2.5 whitespace-nowrap">E-mail</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Rok urodzenia</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Zgłoszono</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Weryfikacja</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-sr-line">
                  <td className="px-4 py-2.5 whitespace-nowrap font-bold text-[#183153]">
                    {r.full_name}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">{r.email}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">{r.birth_year}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-[#183153]">
                    {new Date(r.created_at).toLocaleString("pl-PL")}
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

export default RegistrationsDashboard;
