"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getBackdropVariants, getModalPanelVariants } from "@/lib/motion-variants";

// Jedyny sposob otwarcia tego popupu - kazdy przycisk "Zapisz sie" (hero,
// menu boczne, stopka, archiwum) dispatchuje to zdarzenie zamiast nawigowac
// do FRS. Wzorem OPEN_SURVEY_EVENT w SurveyPopup.tsx - dziala z dowolnego
// miejsca w drzewie komponentow bez przekazywania open/setOpen przez propsy.
export const OPEN_REGISTRATION_EVENT = "sunrun:open-registration";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegistrationModal() {
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthYear, setBirthYear] = useState("");

  useEffect(() => {
    const onOpenRequest = () => setOpen(true);
    window.addEventListener(OPEN_REGISTRATION_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_REGISTRATION_EVENT, onOpenRequest);
  }, []);

  const reset = () => {
    setFullName("");
    setEmail("");
    setBirthYear("");
    setError("");
    setSubmitted(false);
  };

  const close = () => {
    setOpen(false);
    // Malutkie opoznienie, zeby tresc nie "mrugnela" na formularz w trakcie
    // animacji zamykania panelu.
    setTimeout(reset, 300);
  };

  const submit = async () => {
    if (submitting) return;
    setError("");

    const name = fullName.trim();
    const mail = email.trim();
    const year = Number(birthYear);

    if (!name || !mail || !birthYear) {
      setError("Wypełnij wszystkie pola");
      return;
    }
    if (!EMAIL_RE.test(mail)) {
      setError("Nieprawidłowy adres e-mail");
      return;
    }
    if (!Number.isInteger(year) || year < 1915 || year > 2026) {
      setError("Nieprawidłowy rok urodzenia");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email: mail, birthYear: year }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Nie udało się wysłać formularza, spróbuj ponownie");
    } finally {
      setSubmitting(false);
    }
  };

  const backdropVariants = getBackdropVariants(reducedMotion);
  const panelVariants = getModalPanelVariants(reducedMotion);

  // Portal do document.body - ten sam powod co w ShareModal.tsx: wyzwalacz
  // moze siedziec w panelu bocznym animowanym przez GSAP (transform na
  // przodku psuje centrowanie "fixed inset-0" bez portalu).
  return (
    typeof document !== "undefined" &&
    createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Zapisz się na Sun Run"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={backdropVariants}
              className="absolute inset-0 bg-[#183153]/60 backdrop-blur-sm"
              onClick={close}
            />
            <motion.div
              variants={panelVariants}
              className="relative w-full max-w-md bg-sr-sand border border-sr-line rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Zamknij"
                className="cursor-target absolute right-4 top-4 w-9 h-9 flex items-center justify-center rounded-full text-[#3D4D65] hover:text-[#183153] hover:bg-black/5 transition-colors text-xl leading-none"
              >
                ×
              </button>

              {submitted ? (
                <div className="pt-2">
                  <p className="text-xl font-black text-sr-red uppercase tracking-wide mb-3">
                    Dziękujemy za rejestrację!
                  </p>
                  <p className="text-sm text-[#183153] leading-relaxed mb-3">
                    Czekamy na Ciebie już w tę sobotę w Parku Ludowym! Aby dokończyć rejestrację i
                    zagwarantować sobie udział w biegu, wystarczy uiścić opłatę na miejscu.
                  </p>
                  <p className="text-sm text-[#183153] leading-relaxed">
                    Do zobaczenia na starcie! Liczymy na Ciebie - pobiegnijmy razem i spotkajmy się
                    dla Hospicjum! 💛
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-5">
                    Daj nam znać, że się pojawisz!
                  </h2>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Imię i nazwisko"
                      maxLength={200}
                      autoComplete="name"
                      className="w-full bg-white border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Twój e-mail"
                      maxLength={200}
                      autoComplete="email"
                      className="w-full bg-white border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors"
                    />
                    <input
                      type="number"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      placeholder="Rok urodzenia"
                      min={1915}
                      max={2026}
                      inputMode="numeric"
                      className="w-full bg-white border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors"
                    />
                  </div>

                  {error && <p className="text-xs text-sr-red mt-3">{error}</p>}

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submit}
                    className="cursor-target w-full mt-5 py-3.5 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
                  >
                    {submitting ? "Wysyłanie…" : "Wyślij formularz"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )
  );
}

export default RegistrationModal;
