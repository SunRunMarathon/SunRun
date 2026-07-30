"use client";

import React, { useState, useEffect } from "react";

type Submission = {
  id: string;
  date: string;
  company: string;
  name: string;
  phone: string;
  message: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const fetchSubmissions = async (pass: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        headers: { Authorization: `Bearer ${pass}` },
      });
      if (res.status === 401) {
        setError("Nieprawidłowe hasło");
        setAuthed(false);
        sessionStorage.removeItem("admin_pass");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data.submissions);
      setAuthed(true);
      sessionStorage.setItem("admin_pass", pass);
    } catch {
      setError("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  };

  // przywróć sesję po odświeżeniu strony
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pass");
    if (saved) {
      setPassword(saved);
      fetchSubmissions(saved);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions(password);
  };

  const handleLogout = () => {
    setAuthed(false);
    setPassword("");
    setSubmissions([]);
    sessionStorage.removeItem("admin_pass");
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F4D8A2] text-[#183153] flex items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white border border-sr-line rounded-3xl p-8 space-y-5 shadow-lg"
        >
          <div>
            <h1 className="text-2xl font-black uppercase text-sr-red">Panel Admina</h1>
            <p className="text-xs text-[#3D4D65] mt-1">Sun Run · zgłoszenia z formularza</p>
          </div>
          <div>
            <label className="block text-xs text-[#3D4D65] uppercase tracking-widest mb-1.5">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full bg-[#F4D8A2] border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors"
            />
          </div>
          {error && <p className="text-sm text-sr-red">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
          >
            {loading ? "Logowanie..." : "Zaloguj"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4D8A2] text-[#183153] px-6 sm:px-12 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-sr-red">Zgłoszenia partnerów</h1>
            <p className="text-xs text-[#3D4D65] mt-1">
              Formularz kontaktowy · {submissions.length}{" "}
              {submissions.length === 1 ? "zgłoszenie" : "zgłoszeń"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchSubmissions(password)}
              disabled={loading}
              className="px-5 py-2 border border-sr-line hover:border-sr-orange rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Odśwież
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 border border-sr-line hover:border-sr-red/50 text-[#3D4D65] hover:text-sr-red rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white border border-sr-line rounded-3xl p-12 text-center text-[#3D4D65] text-sm shadow-sm">
            Brak zgłoszeń — gdy ktoś wypełni formularz na stronie „Dla Partnerów”, pojawi się tutaj.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-sr-line rounded-2xl p-6 space-y-3 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-black text-[#183153]">{s.company}</span>
                    <span className="text-[#3D4D65] text-sm"> · {s.name}</span>
                  </div>
                  <span className="text-xs text-[#3D4D65]">
                    {new Date(s.date).toLocaleString("pl-PL")}
                  </span>
                </div>
                {s.phone && (
                  <p className="text-sm text-[#3D4D65]">
                    <span className="text-[#3D4D65] uppercase text-xs tracking-widest mr-2">Tel:</span>
                    {s.phone}
                  </p>
                )}
                <p className="text-sm text-[#183153] leading-relaxed whitespace-pre-wrap border-t border-[rgb(24 49 83 / 0.14)] pt-3">
                  {s.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
