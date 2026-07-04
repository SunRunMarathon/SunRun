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
      <div className="min-h-screen bg-[#F5F1E8] text-[#1A1712] flex items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white border border-[#E2DBCC] rounded-3xl p-8 space-y-5 shadow-lg"
        >
          <div>
            <h1 className="text-2xl font-black uppercase text-brand-orange">Panel Admina</h1>
            <p className="text-xs text-[#6B6357] mt-1">Sun Run · zgłoszenia z formularza</p>
          </div>
          <div>
            <label className="block text-xs text-[#6B6357] uppercase tracking-widest mb-1.5">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full bg-[#F5F1E8] border border-[#E2DBCC] focus:border-brand-orange rounded-xl px-4 py-3 text-sm text-[#1A1712] outline-none transition-colors"
            />
          </div>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-brand-orange hover:bg-brand-orange/90 disabled:opacity-50 text-white font-black rounded-full text-sm tracking-widest uppercase transition-all"
          >
            {loading ? "Logowanie..." : "Zaloguj"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#1A1712] px-6 sm:px-12 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-brand-orange">Zgłoszenia partnerów</h1>
            <p className="text-xs text-[#6B6357] mt-1">
              Formularz kontaktowy · {submissions.length}{" "}
              {submissions.length === 1 ? "zgłoszenie" : "zgłoszeń"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchSubmissions(password)}
              disabled={loading}
              className="px-5 py-2 border border-[#D8CFBD] hover:border-brand-orange rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Odśwież
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 border border-[#E2DBCC] hover:border-brand-red/50 text-[#6B6357] hover:text-brand-red rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white border border-[#E2DBCC] rounded-3xl p-12 text-center text-[#6B6357] text-sm shadow-sm">
            Brak zgłoszeń — gdy ktoś wypełni formularz na stronie „Dla Partnerów”, pojawi się tutaj.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-[#E2DBCC] rounded-2xl p-6 space-y-3 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-black text-[#1A1712]">{s.company}</span>
                    <span className="text-[#6B6357] text-sm"> · {s.name}</span>
                  </div>
                  <span className="text-xs text-[#9A9080]">
                    {new Date(s.date).toLocaleString("pl-PL")}
                  </span>
                </div>
                {s.phone && (
                  <p className="text-sm text-[#6B6357]">
                    <span className="text-[#9A9080] uppercase text-xs tracking-widest mr-2">Tel:</span>
                    {s.phone}
                  </p>
                )}
                <p className="text-sm text-[#3A342B] leading-relaxed whitespace-pre-wrap border-t border-[#E5DFD2] pt-3">
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
