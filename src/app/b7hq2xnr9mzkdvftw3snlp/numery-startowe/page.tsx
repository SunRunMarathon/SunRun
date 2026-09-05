"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { browserSupportsWebAuthn, loginWithPasskey } from "@/lib/webauthn-client";
import type { BibColorRule, BibFont } from "@/lib/bib-types";

// Ten sam klucz co w panelu admina - jesli operator jest juz zalogowany tam
// w tej samej karcie przegladarki, to narzedzie odczyta token bez ponownego
// logowania (sesja jest wspolna, bo podpisuje ja ten sam ADMIN_SESSION_SECRET).
const TOKEN_KEY = "admin_session_token";

const PAGE_PRESETS: Record<string, { w: number; h: number; label: string }> = {
  a5: { w: 595.44, h: 419.76, label: "A5 poziomo (wymiary numer_startowy.pdf)" },
  a4: { w: 841.89, h: 595.28, label: "A4 poziomo" },
};

const FONTS: { value: BibFont; label: string }[] = [
  { value: "Helvetica-Bold", label: "Helvetica Bold" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times-Bold", label: "Times Bold" },
  { value: "Courier-Bold", label: "Courier Bold" },
];

const DISPLAY_WIDTH = 720;

type TemplateKind = "pdf" | "image";

export default function NumeryStartowePage() {
  // ── Logowanie (identyczny mechanizm co w panelu admina) ──
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [webauthnSupported, setWebauthnSupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [secrets, setSecrets] = useState({ red: "", green: "", yellow: "" });
  const [legacyPassword, setLegacyPassword] = useState("");
  const [loginConfig, setLoginConfig] = useState<{
    tripleConfigured: boolean;
    legacyConfigured: boolean;
    sessionSigningConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    setWebauthnSupported(browserSupportsWebAuthn());
    fetch("/api/admin/login-secrets")
      .then((res) => res.json())
      .then(setLoginConfig)
      .catch(() =>
        setLoginConfig({ tripleConfigured: false, legacyConfigured: false, sessionSigningConfigured: false })
      );
  }, []);

  const verifyAndLoad = useCallback(async (tok: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login-secrets", { headers: { Authorization: `Bearer ${tok}` } });
      // login-secrets GET nie wymaga autoryzacji, wiec uzywamy go tylko do
      // sprawdzenia, ze serwer odpowiada - realna weryfikacja tokenu nastapi
      // przy pierwszym wywolaniu /api/admin/bib-numbers/generate.
      if (!res.ok) throw new Error();
      setAuthed(true);
      setToken(tok);
      sessionStorage.setItem(TOKEN_KEY, tok);
    } catch {
      setAuthError("Błąd połączenia z serwerem");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) verifyAndLoad(saved);
  }, [verifyAndLoad]);

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setAuthError("");
    try {
      const tok = await loginWithPasskey();
      await verifyAndLoad(tok);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Logowanie kluczem nie powiodło się");
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSecretsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login-secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginConfig?.tripleConfigured ? secrets : { legacyPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setAuthError(data.error || "Nieprawidłowe dane logowania");
        setAuthLoading(false);
        return;
      }
      await verifyAndLoad(data.token);
    } catch {
      setAuthError("Błąd połączenia z serwerem");
      setAuthLoading(false);
    }
  };

  // ── Narzedzie generowania numerow ──
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateKind, setTemplateKind] = useState<TemplateKind | null>(null);
  const [pagePreset, setPagePreset] = useState<keyof typeof PAGE_PRESETS>("a5");
  const [pageW, setPageW] = useState(PAGE_PRESETS.a5.w);
  const [pageH, setPageH] = useState(PAGE_PRESETS.a5.h);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [fontSize, setFontSize] = useState(150);
  const [font, setFont] = useState<BibFont>("Helvetica-Bold");
  const [defaultColor, setDefaultColor] = useState("#183153");
  const [colorRules, setColorRules] = useState<BibColorRule[]>([]);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(400);
  const [previewNumber, setPreviewNumber] = useState(1);
  const [generating, setGenerating] = useState<"single" | "zip" | null>(null);
  const [genError, setGenError] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);

  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rozmiar strony dla obrazu (PNG/JPG) jest wybierany recznie, bo obraz nie
  // niesie ze soba jednostek PDF - dla PDF bierzemy rozmiar wprost ze strony.
  useEffect(() => {
    if (templateKind === "image") {
      setPageW(PAGE_PRESETS[pagePreset].w);
      setPageH(PAGE_PRESETS[pagePreset].h);
    }
  }, [pagePreset, templateKind]);

  const handleTemplateUpload = async (file: File) => {
    setGenError("");
    setPosition(null);
    setTemplateFile(file);
    setTemplateLoading(true);
    try {
      if (file.type === "application/pdf") {
        setTemplateKind("pdf");
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const buf = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await doc.getPage(1);
        const naturalViewport = page.getViewport({ scale: 1 });
        setPageW(naturalViewport.width);
        setPageH(naturalViewport.height);

        const scale = DISPLAY_WIDTH / naturalViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        baseCanvasRef.current = canvas;
      } else {
        setTemplateKind("image");
        const w = PAGE_PRESETS[pagePreset].w;
        const h = PAGE_PRESETS[pagePreset].h;
        setPageW(w);
        setPageH(h);
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Nie udało się wczytać obrazu"));
          img.src = url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = DISPLAY_WIDTH;
        canvas.height = Math.round((DISPLAY_WIDTH * h) / w);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        baseCanvasRef.current = canvas;
      }
      redraw();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Nie udało się wczytać szablonu");
      setTemplateFile(null);
      setTemplateKind(null);
    } finally {
      setTemplateLoading(false);
    }
  };

  const colorForPreview = useMemo(() => {
    const rule = colorRules.find((r) => previewNumber >= r.from && previewNumber <= r.to);
    return rule ? rule.color : defaultColor;
  }, [colorRules, previewNumber, defaultColor]);

  const redraw = useCallback(() => {
    const base = baseCanvasRef.current;
    const visible = visibleCanvasRef.current;
    if (!base || !visible) return;
    visible.width = base.width;
    visible.height = base.height;
    const ctx = visible.getContext("2d")!;
    ctx.drawImage(base, 0, 0);
    if (!position) return;

    const px = position.x * base.width;
    const py = position.y * base.height;
    const displayFontSize = (fontSize / pageH) * base.height;

    ctx.font = `bold ${displayFontSize}px sans-serif`;
    ctx.fillStyle = colorForPreview;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(previewNumber), px, py);

    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(228, 87, 46, 0.9)";
    ctx.fill();
  }, [position, fontSize, pageH, colorForPreview, previewNumber]);

  useEffect(() => {
    redraw();
  }, [redraw, templateFile]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = visibleCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPosition({ x, y });
  };

  const addColorRule = (from: number, to: number, color: string) => {
    setColorRules((rules) => [...rules, { from, to, color }]);
  };
  const removeColorRule = (idx: number) => {
    setColorRules((rules) => rules.filter((_, i) => i !== idx));
  };
  const updateColorRule = (idx: number, patch: Partial<BibColorRule>) => {
    setColorRules((rules) => rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const canGenerate = !!templateFile && !!position && end >= start;

  const handleGenerate = async (mode: "single" | "zip") => {
    if (!templateFile || !position) return;
    setGenerating(mode);
    setGenError("");
    try {
      const formData = new FormData();
      formData.append("template", templateFile);
      formData.append(
        "config",
        JSON.stringify({
          xFraction: position.x,
          yFraction: position.y,
          fontSize,
          font,
          defaultColor,
          colorRules,
          start,
          end,
          mode,
          pageWidthPt: templateKind === "image" ? pageW : undefined,
          pageHeightPt: templateKind === "image" ? pageH : undefined,
        })
      );

      const res = await fetch("/api/admin/bib-numbers/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Błąd generowania plików");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mode === "zip" ? `numery-startowe-${start}-${end}.zip` : `numery-startowe-${start}-${end}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Błąd generowania plików");
    } finally {
      setGenerating(null);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F4D8A2] text-[#183153] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white border border-sr-line rounded-3xl p-8 space-y-6 shadow-lg">
          <div>
            <h1 className="text-xl font-black uppercase text-sr-red">Numery startowe</h1>
            <p className="text-xs text-[#3D4D65] mt-1">Sun Run — narzędzie wewnętrzne</p>
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

          {authError && <p className="text-sm text-sr-red">{authError}</p>}

          {loginConfig && !loginConfig.sessionSigningConfigured && (
            <p className="text-xs text-sr-red bg-sr-red/10 border border-sr-red/30 rounded-xl p-3">
              Logowanie zapasowe jest wyłączone: serwer nie ma ustawionej zmiennej ADMIN_SESSION_SECRET ani
              ADMIN_PASSWORD.
            </p>
          )}

          {loginConfig?.tripleConfigured && (
            <form onSubmit={handleSecretsLogin} className="space-y-3 pt-2 border-t border-sr-line">
              {(["red", "green", "yellow"] as const).map((color) => (
                <input
                  key={color}
                  type="password"
                  placeholder={`Sekret (${color})`}
                  value={secrets[color]}
                  onChange={(e) => setSecrets((s) => ({ ...s, [color]: e.target.value }))}
                  className="w-full bg-[#F4D8A2] border border-sr-line focus:border-sr-orange rounded-xl px-4 py-2.5 text-sm text-[#183153] outline-none transition-colors"
                />
              ))}
              <button
                type="submit"
                disabled={authLoading || !secrets.red || !secrets.green || !secrets.yellow}
                className="w-full py-3 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
              >
                {authLoading ? "Logowanie..." : "Zaloguj"}
              </button>
            </form>
          )}

          {loginConfig?.legacyConfigured && !loginConfig.tripleConfigured && (
            <form onSubmit={handleSecretsLogin} className="space-y-3 pt-2 border-t border-sr-line">
              <input
                type="password"
                placeholder="Hasło"
                value={legacyPassword}
                onChange={(e) => setLegacyPassword(e.target.value)}
                className="w-full bg-[#F4D8A2] border border-sr-line focus:border-sr-orange rounded-xl px-4 py-2.5 text-sm text-[#183153] outline-none transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={authLoading || !legacyPassword}
                className="w-full py-3 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
              >
                {authLoading ? "Logowanie..." : "Zaloguj"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4D8A2] text-[#183153] px-6 sm:px-12 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black uppercase text-sr-red">Numery startowe</h1>
          <p className="text-xs text-[#3D4D65] mt-1">
            Wgraj szablon numeru (PDF lub PNG/JPG), kliknij miejsce na numer i wygeneruj pliki dla biegaczy.
          </p>
        </div>

        <div className="grid md:grid-cols-[720px_1fr] gap-8 items-start">
          <div className="bg-white border border-sr-line rounded-3xl p-6 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#3D4D65]">
              Szablon (PDF / PNG / JPG)
            </label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleTemplateUpload(f);
              }}
              className="block w-full text-sm"
            />

            {templateKind === "image" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#3D4D65] mb-1">
                  Rozmiar strony
                </label>
                <select
                  value={pagePreset}
                  onChange={(e) => setPagePreset(e.target.value as keyof typeof PAGE_PRESETS)}
                  className="w-full border border-sr-line rounded-xl px-3 py-2 text-sm"
                >
                  {Object.entries(PAGE_PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {templateLoading && <p className="text-sm text-[#3D4D65]">Wczytywanie szablonu…</p>}

            {templateFile && (
              <div
                className="border border-sr-line rounded-2xl overflow-hidden"
                style={{ display: templateLoading ? "none" : "block" }}
              >
                <canvas
                  ref={visibleCanvasRef}
                  onClick={handleCanvasClick}
                  className="w-full h-auto cursor-crosshair block"
                />
              </div>
            )}
            {templateFile && (
              <p className="text-[11px] text-[#3D4D65]">
                {position
                  ? `Pozycja numeru: ${(position.x * 100).toFixed(1)}% / ${(position.y * 100).toFixed(1)}%`
                  : "Kliknij na podglądzie, aby ustawić miejsce numeru."}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-sr-line rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black uppercase text-[#183153]">Wygląd numeru</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#3D4D65] mb-1">
                    Rozmiar (pt)
                  </label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full border border-sr-line rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#3D4D65] mb-1">
                    Czcionka
                  </label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value as BibFont)}
                    className="w-full border border-sr-line rounded-xl px-3 py-2 text-sm"
                  >
                    {FONTS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#3D4D65] mb-1">
                  Kolor domyślny
                </label>
                <input
                  type="color"
                  value={defaultColor}
                  onChange={(e) => setDefaultColor(e.target.value)}
                  className="h-10 w-16 border border-sr-line rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#3D4D65]">
                  Kolory dla zakresów numerów (nadpisują domyślny)
                </label>
                {colorRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={rule.from}
                      onChange={(e) => updateColorRule(idx, { from: Number(e.target.value) })}
                      className="w-16 border border-sr-line rounded-lg px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-[#3D4D65]">–</span>
                    <input
                      type="number"
                      value={rule.to}
                      onChange={(e) => updateColorRule(idx, { to: Number(e.target.value) })}
                      className="w-16 border border-sr-line rounded-lg px-2 py-1 text-sm"
                    />
                    <input
                      type="color"
                      value={rule.color}
                      onChange={(e) => updateColorRule(idx, { color: e.target.value })}
                      className="h-8 w-12 border border-sr-line rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeColorRule(idx)}
                      className="text-xs text-sr-red underline"
                    >
                      usuń
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => addColorRule(1, 50, "#E4572E")}
                    className="text-xs px-3 py-1.5 border border-sr-line rounded-full hover:border-sr-orange"
                  >
                    + zakres pomarańczowy
                  </button>
                  <button
                    type="button"
                    onClick={() => addColorRule(51, 100, "#C1272D")}
                    className="text-xs px-3 py-1.5 border border-sr-line rounded-full hover:border-sr-red"
                  >
                    + zakres czerwony
                  </button>
                  <button
                    type="button"
                    onClick={() => addColorRule(1, 1, "#000000")}
                    className="text-xs px-3 py-1.5 border border-sr-line rounded-full hover:border-sr-orange"
                  >
                    + własny zakres
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#3D4D65] mb-1">
                  Numer w podglądzie
                </label>
                <input
                  type="number"
                  value={previewNumber}
                  onChange={(e) => setPreviewNumber(Number(e.target.value))}
                  className="w-24 border border-sr-line rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="bg-white border border-sr-line rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black uppercase text-[#183153]">Zakres numerów startowych</h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  className="w-24 border border-sr-line rounded-xl px-3 py-2 text-sm"
                />
                <span className="text-sm text-[#3D4D65]">do</span>
                <input
                  type="number"
                  value={end}
                  onChange={(e) => setEnd(Number(e.target.value))}
                  className="w-24 border border-sr-line rounded-xl px-3 py-2 text-sm"
                />
              </div>

              {genError && <p className="text-sm text-sr-red">{genError}</p>}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={!canGenerate || generating !== null}
                  onClick={() => handleGenerate("single")}
                  className="w-full py-3 bg-sr-navy hover:bg-sr-navy/90 disabled:opacity-40 text-sr-orange font-black rounded-full text-sm tracking-widest uppercase transition-all"
                >
                  {generating === "single" ? "Generowanie…" : "Jeden PDF (wiele stron)"}
                </button>
                <button
                  type="button"
                  disabled={!canGenerate || generating !== null}
                  onClick={() => handleGenerate("zip")}
                  className="w-full py-3 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-40 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
                >
                  {generating === "zip" ? "Generowanie…" : "Osobne pliki PDF (ZIP)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
