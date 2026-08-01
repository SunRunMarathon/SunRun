"use client";

import { useEffect, useState } from "react";
import { registerPasskey } from "@/lib/webauthn-client";

type Credential = {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

export function SecurityDashboard({ token }: { token: string }) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerMsg, setRegisterMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/webauthn/credentials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCredentials(data.credentials);
    } catch {
      setError("Nie udało się wczytać listy kluczy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegister = async () => {
    if (!deviceName.trim()) {
      setRegisterMsg("Podaj nazwę urządzenia, np. „Telefon” albo „Laptop”.");
      return;
    }
    setRegistering(true);
    setRegisterMsg("");
    try {
      await registerPasskey(token, deviceName.trim());
      setDeviceName("");
      setRegisterMsg("Klucz dodany ✓");
      await load();
    } catch (err) {
      setRegisterMsg(err instanceof Error ? err.message : "Nie udało się dodać klucza");
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/admin/webauthn/credentials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      await load();
    } catch {
      setError("Nie udało się usunąć klucza");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-sr-line rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] mb-2">
          Dodaj klucz bezpieczeństwa
        </h3>
        <p className="text-xs text-[#3D4D65] mb-4">
          Windows Hello, Face ID / Touch ID albo fizyczny klucz sprzętowy — jedno dotknięcie zamiast
          haseł. Możesz dodać kilka (telefon, laptop).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Nazwa urządzenia, np. Telefon Miłosza"
            className="flex-1 bg-[#F4D8A2] border border-sr-line focus:border-sr-orange rounded-xl px-4 py-2.5 text-sm text-[#183153] outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleRegister}
            disabled={registering}
            className="px-6 py-2.5 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-xs tracking-widest uppercase transition-all whitespace-nowrap"
          >
            {registering ? "Rejestrowanie…" : "Dodaj klucz bezpieczeństwa"}
          </button>
        </div>
        {registerMsg && <p className="text-xs text-[#3D4D65] mt-3">{registerMsg}</p>}
      </div>

      <div className="bg-white border border-sr-line rounded-2xl shadow-sm overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#183153] p-6 pb-4">
          Zarejestrowane klucze ({credentials.length})
        </h3>
        {loading ? (
          <p className="px-6 pb-6 text-sm text-[#3D4D65]">Wczytywanie…</p>
        ) : error ? (
          <p className="px-6 pb-6 text-sm text-sr-red">{error}</p>
        ) : credentials.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-[#3D4D65]">
            Brak kluczy — logowanie działa na razie tylko przez trzy sekrety.
          </p>
        ) : (
          <div className="divide-y divide-sr-line">
            {credentials.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-[#183153]">
                    {c.deviceName || "Klucz bezpieczeństwa"}
                  </p>
                  <p className="text-xs text-[#3D4D65]">
                    Dodano {new Date(c.createdAt).toLocaleDateString("pl-PL")}
                    {c.lastUsedAt &&
                      ` · ostatnio użyty ${new Date(c.lastUsedAt).toLocaleDateString("pl-PL")}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="px-4 py-2 border border-sr-line hover:border-sr-red/50 text-[#3D4D65] hover:text-sr-red rounded-full text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
                >
                  Usuń
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SecurityDashboard;
