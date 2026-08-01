"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SurveyDashboard } from "@/components/admin/SurveyDashboard";
import { ShareDashboard } from "@/components/admin/ShareDashboard";
import { SecurityDashboard } from "@/components/admin/SecurityDashboard";
import { RetentionStatus } from "@/components/admin/RetentionStatus";
import { browserSupportsWebAuthn, loginWithPasskey } from "@/lib/webauthn-client";

type Submission = {
  id: string;
  date: string;
  company: string;
  name: string;
  phone: string;
  message: string;
};

const TOKEN_KEY = "admin_session_token";

const COLOR_STYLES: Record<"red" | "green" | "yellow", { label: string; className: string }> = {
  red: { label: "Czerwony", className: "text-sr-red border-sr-red/40" },
  green: { label: "Zielony", className: "text-emerald-600 border-emerald-600/40" },
  yellow: { label: "Żółty", className: "text-amber-600 border-amber-600/40" },
};

function shuffledColors(): ("red" | "green" | "yellow")[] {
  const colors: ("red" | "green" | "yellow")[] = ["red", "green", "yellow"];
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  return colors;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tab, setTab] = useState<"ankieta" | "udostepnienia" | "partnerzy" | "bezpieczenstwo">(
    "ankieta"
  );

  const [showSecretsForm, setShowSecretsForm] = useState(false);
  const [secrets, setSecrets] = useState({ red: "", green: "", yellow: "" });
  const fieldOrder = useMemo(() => shuffledColors(), [showSecretsForm]);
  const [webauthnSupported, setWebauthnSupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Formularz zapasowy (bez klucza) ma dwa mozliwe warianty w zaleznosci od
  // tego, co jest naprawde skonfigurowane w Railway: docelowy - trzy kolorowe
  // sekrety, albo dotychczasowy - jedno haslo ADMIN_PASSWORD (na wypadek, gdy
  // nowe zmienne jeszcze nie zostaly dodane). null = jeszcze nie sprawdzono.
  const [loginConfig, setLoginConfig] = useState<{
    tripleConfigured: boolean;
    legacyConfigured: boolean;
    sessionSigningConfigured: boolean;
  } | null>(null);
  const [legacyPassword, setLegacyPassword] = useState("");

  useEffect(() => {
    setWebauthnSupported(browserSupportsWebAuthn());
    fetch("/api/admin/login-secrets")
      .then((res) => res.json())
      .then(setLoginConfig)
      .catch(() =>
        setLoginConfig({ tripleConfigured: false, legacyConfigured: false, sessionSigningConfigured: false })
      );
  }, []);

  const verifyAndLoad = async (tok: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.status === 401) {
        setError("Sesja wygasła, zaloguj się ponownie");
        setAuthed(false);
        sessionStorage.removeItem(TOKEN_KEY);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data.submissions);
      setAuthed(true);
      setToken(tok);
      sessionStorage.setItem(TOKEN_KEY, tok);
    } catch {
      setError("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  };

  // przywróć sesję po odświeżeniu strony
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) verifyAndLoad(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setError("");
    try {
      const tok = await loginWithPasskey();
      await verifyAndLoad(tok);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logowanie kluczem nie powiodło się");
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSecretsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login-secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secrets),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.error || "Nieprawidłowe dane logowania");
        setLoading(false);
        return;
      }
      await verifyAndLoad(data.token);
    } catch {
      setError("Błąd połączenia z serwerem");
      setLoading(false);
    }
  };

  // Wariant zapasowy na dotychczasowym ADMIN_PASSWORD - dziala bez zadnych
  // nowych zmiennych w Railway, dopoki docelowe trzy sekrety nie sa ustawione.
  const handleLegacyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login-secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legacyPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.error || "Nieprawidłowe dane logowania");
        setLoading(false);
        return;
      }
      await verifyAndLoad(data.token);
    } catch {
      setError("Błąd połączenia z serwerem");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    setToken("");
    setSubmissions([]);
    sessionStorage.removeItem(TOKEN_KEY);
  };

  const fetchSubmissions = () => verifyAndLoad(token);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F4D8A2] text-[#183153] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white border border-sr-line rounded-3xl p-8 space-y-6 shadow-lg">
          <div>
            <h1 className="text-2xl font-black uppercase text-sr-red">Panel Admina</h1>
            <p className="text-xs text-[#3D4D65] mt-1">Sun Run</p>
          </div>

          {webauthnSupported && (
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
              className="w-full py-3.5 bg-sr-navy hover:bg-sr-navy/90 disabled:opacity-50 text-sr-orange font-black rounded-full text-sm tracking-widest uppercase transition-all"
            >
              {passkeyLoading ? "Łączenie…" : "Zaloguj kluczem bezpieczeństwa"}
            </button>
          )}

          {error && <p className="text-sm text-sr-red">{error}</p>}

          {loginConfig && !loginConfig.sessionSigningConfigured && (
            <p className="text-xs text-sr-red bg-sr-red/10 border border-sr-red/30 rounded-xl p-3">
              Logowanie zapasowe jest wyłączone: serwer nie ma ustawionej zmiennej
              ADMIN_SESSION_SECRET ani ADMIN_PASSWORD. Dodaj jedną z nich w Railway.
            </p>
          )}

          {loginConfig?.tripleConfigured &&
            (!showSecretsForm ? (
              <button
                type="button"
                onClick={() => setShowSecretsForm(true)}
                className="w-full text-center text-xs text-[#3D4D65] underline hover:text-[#183153]"
              >
                Nie masz klucza? Zaloguj się trzema hasłami
              </button>
            ) : (
              <form onSubmit={handleSecretsLogin} className="space-y-4 pt-2 border-t border-sr-line">
                <p className="text-[11px] text-[#3D4D65] pt-4">
                  Kolejność pól jest losowa przy każdym wejściu — wpisz hasło przypisane do koloru,
                  nie do pozycji.
                </p>
                {fieldOrder.map((color) => (
                  <div key={color}>
                    <label
                      className={`block text-xs font-bold uppercase tracking-widest mb-1.5 border-l-4 pl-2 ${COLOR_STYLES[color].className}`}
                    >
                      {COLOR_STYLES[color].label}
                    </label>
                    <input
                      type="password"
                      value={secrets[color]}
                      onChange={(e) => setSecrets((s) => ({ ...s, [color]: e.target.value }))}
                      className="w-full bg-[#F4D8A2] border border-sr-line focus:border-sr-orange rounded-xl px-4 py-2.5 text-sm text-[#183153] outline-none transition-colors"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading || !secrets.red || !secrets.green || !secrets.yellow}
                  className="w-full py-3 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
                >
                  {loading ? "Logowanie..." : "Zaloguj"}
                </button>
              </form>
            ))}

          {/* Haslo ADMIN_PASSWORD dziala tylko dopoki docelowe trzy sekrety nie
              sa jeszcze skonfigurowane - gdy oba warianty sa ustawione, wygrywa
              silniejszy (trojka) i to pole znika. */}
          {loginConfig?.legacyConfigured &&
            !loginConfig.tripleConfigured &&
            (!showSecretsForm ? (
              <button
                type="button"
                onClick={() => setShowSecretsForm(true)}
                className="w-full text-center text-xs text-[#3D4D65] underline hover:text-[#183153]"
              >
                Nie masz klucza? Zaloguj się hasłem
              </button>
            ) : (
              <form onSubmit={handleLegacyLogin} className="space-y-4 pt-2 border-t border-sr-line">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-[#3D4D65]">
                    Hasło
                  </label>
                  <input
                    type="password"
                    value={legacyPassword}
                    onChange={(e) => setLegacyPassword(e.target.value)}
                    className="w-full bg-[#F4D8A2] border border-sr-line focus:border-sr-orange rounded-xl px-4 py-2.5 text-sm text-[#183153] outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !legacyPassword}
                  className="w-full py-3 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
                >
                  {loading ? "Logowanie..." : "Zaloguj"}
                </button>
              </form>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4D8A2] text-[#183153] px-6 sm:px-12 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-sr-red">Panel Admina</h1>
            <p className="text-xs text-[#3D4D65] mt-1">Sun Run</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => (tab === "partnerzy" ? fetchSubmissions() : window.location.reload())}
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

        <RetentionStatus token={token} />

        <div className="flex gap-2 mb-8 border-b border-sr-line flex-wrap">
          <button
            onClick={() => setTab("ankieta")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              tab === "ankieta"
                ? "border-sr-orange text-[#183153]"
                : "border-transparent text-[#3D4D65] hover:text-[#183153]"
            }`}
          >
            Ankieta „skąd o nas wiesz"
          </button>
          <button
            onClick={() => setTab("udostepnienia")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              tab === "udostepnienia"
                ? "border-sr-orange text-[#183153]"
                : "border-transparent text-[#3D4D65] hover:text-[#183153]"
            }`}
          >
            Udostępnienia
          </button>
          <button
            onClick={() => setTab("partnerzy")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              tab === "partnerzy"
                ? "border-sr-orange text-[#183153]"
                : "border-transparent text-[#3D4D65] hover:text-[#183153]"
            }`}
          >
            Zgłoszenia partnerów ({submissions.length})
          </button>
          <button
            onClick={() => setTab("bezpieczenstwo")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              tab === "bezpieczenstwo"
                ? "border-sr-orange text-[#183153]"
                : "border-transparent text-[#3D4D65] hover:text-[#183153]"
            }`}
          >
            Bezpieczeństwo
          </button>
        </div>

        {tab === "ankieta" && <SurveyDashboard password={token} />}

        {tab === "udostepnienia" && <ShareDashboard password={token} />}

        {tab === "bezpieczenstwo" && <SecurityDashboard token={token} />}

        {tab === "partnerzy" &&
          (submissions.length === 0 ? (
            <div className="bg-white border border-sr-line rounded-3xl p-12 text-center text-[#3D4D65] text-sm shadow-sm">
              Brak zgłoszeń - gdy ktoś wypełni formularz na stronie „Dla Partnerów”, pojawi się tutaj.
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
                      <span className="text-[#3D4D65] uppercase text-xs tracking-widest mr-2">
                        Tel:
                      </span>
                      {s.phone}
                    </p>
                  )}
                  <p className="text-sm text-[#183153] leading-relaxed whitespace-pre-wrap border-t border-[rgb(24 49 83 / 0.14)] pt-3">
                    {s.message}
                  </p>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
