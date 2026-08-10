"use client";

import { useEffect, useState } from "react";

// Licznik "Zapisanych uczestników" na stronie głównej - FRS nie ma
// publicznego API, więc wartość wpisuje ręcznie admin po sprawdzeniu w FRS.
export function RegisteredCountEditor({ token }: { token: string }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setValue(data.registeredCount ?? ""))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ registeredCount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Błąd zapisu");
        return;
      }
      setMessage("Zapisano");
    } catch {
      setMessage("Błąd połączenia z serwerem");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-sr-line bg-white px-5 py-4 text-xs text-[#3D4D65] flex flex-wrap items-center gap-3">
      <span className="font-bold uppercase tracking-widest text-sr-red shrink-0">
        Zapisanych uczestników (licznik na stronie)
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 bg-sr-sand/30 border border-sr-line focus:border-sr-orange rounded-lg px-3 py-1.5 text-sm text-[#183153] outline-none transition-colors"
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="px-4 py-1.5 border border-sr-line hover:border-sr-orange rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
      >
        {saving ? "Zapisywanie…" : "Zapisz"}
      </button>
      {message && <span>{message}</span>}
    </div>
  );
}

export default RegisteredCountEditor;
