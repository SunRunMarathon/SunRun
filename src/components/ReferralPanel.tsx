"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getBackdropVariants, getModalPanelVariants } from "@/lib/motion-variants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";

const EMPTY_FORM = { name: "", email: "", startNumber: "" };

// Kompaktowe CTA na stronie glownej + modal generujacy link polecajacy.
// Swiadomie NIE jest to duzy formularz "na cala sekcje" (tak wygladal
// poprzedni wariant z zaproszeniem mailowym) - jedno kliknieice otwiera
// modal, reszta dzieje sie tam. Weryfikacja numeru startowego (patrz
// /admin, zakladka "Zaproszenia") jest asynchroniczna i NIE blokuje
// wygenerowania linku - link dziala od razu po wyslaniu formularza.
export function ReferralPanel() {
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const close = () => {
    setOpen(false);
    setForm(EMPTY_FORM);
    setError("");
    setCode(null);
    setCopied(false);
  };

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const link = code ? `${SITE_URL}/zaproszenie/${code}` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        setError(data.error || "Nie udało się wygenerować linku");
        return;
      }
      setCode(data.code);
    } catch {
      setError("Błąd połączenia z serwerem");
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // brak dostepu do schowka - link i tak jest widoczny na ekranie
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: "Sun Run 2026",
        text: "Dołącz do mnie na Sun Run 2026 - charytatywnym biegu w Lublinie na rzecz Hospicjum Dobrego Samarytanina!",
        url: link,
      });
    } catch {
      // uzytkownik anulowal system share
    }
  };

  return (
    <div className="rounded-3xl bg-sr-white border border-sr-line p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-sr-red mb-1.5 block">
          Masz numer startowy?
        </span>
        <p className="text-sm sm:text-base text-[#183153] font-bold">
          Wygeneruj swój link i zaproś znajomych na Sun Run
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-target shrink-0 px-8 py-3.5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all shadow-lg hover:-translate-y-0.5"
      >
        Wygeneruj link
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Wygeneruj link polecający"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={getBackdropVariants(reducedMotion)}
              className="absolute inset-0 bg-[#183153]/60 backdrop-blur-sm"
              onClick={close}
            />
            <motion.div
              variants={getModalPanelVariants(reducedMotion)}
              className="relative w-full max-w-md bg-sr-sand border border-sr-line rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Zamknij"
                className="cursor-target absolute right-4 top-4 w-9 h-9 flex items-center justify-center rounded-full text-[#3D4D65] hover:text-[#183153] hover:bg-black/5 transition-colors text-xl leading-none"
              >
                ×
              </button>

              {code ? (
                <>
                  <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-2">
                    Twój link jest gotowy!
                  </h2>
                  <p className="text-sm text-[#3D4D65] mb-5">
                    Numer startowy zweryfikujemy w tle — link działa od razu, nie musisz czekać.
                  </p>
                  <div className="bg-white border border-sr-line rounded-2xl px-4 py-3 text-sm text-[#183153] break-all mb-4">
                    {link}
                  </div>
                  <div className="flex flex-col gap-3">
                    {canNativeShare && (
                      <button
                        type="button"
                        onClick={nativeShare}
                        className="cursor-target px-5 py-3.5 bg-sr-navy text-sr-orange rounded-2xl text-sm font-bold transition-colors hover:bg-sr-navy/90"
                      >
                        Udostępnij przez aplikację…
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={copyLink}
                      className="cursor-target px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors"
                    >
                      {copied ? "Link skopiowany ✓" : "Kopiuj link"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-5">
                    Wygeneruj swój link
                  </h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Imię i nazwisko"
                      value={form.name}
                      onChange={set("name")}
                      maxLength={200}
                      className="w-full bg-white border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors"
                    />
                    <input
                      type="email"
                      required
                      placeholder="E-mail"
                      value={form.email}
                      onChange={set("email")}
                      maxLength={200}
                      className="w-full bg-white border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Twój numer startowy"
                      value={form.startNumber}
                      onChange={set("startNumber")}
                      maxLength={50}
                      className="w-full bg-white border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="cursor-target mt-2 px-5 py-3.5 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
                    >
                      {submitting ? "Generowanie…" : "Wygeneruj link"}
                    </button>
                    {error && <p className="text-sm text-sr-red">{error}</p>}
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReferralPanel;
