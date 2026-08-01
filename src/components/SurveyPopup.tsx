"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SURVEY_OPTIONS, SURVEY_QUESTION } from "@/lib/survey-options";
import { collectClientMeta } from "@/lib/client-meta";
import { trackEvent } from "@/lib/analytics";

const SEEN_KEY = "sr_survey_seen";
const ANSWERED_KEY = "sr_survey_answered";
// Próg przescrollowania, po którym wyskakuje ankieta — 28% wysokości strony,
// czyli już wyraźnie po hero, ale nie na końcu strony.
const SCROLL_THRESHOLD_RATIO = 0.28;

// Zdarzenie, przez które przycisk "Ankieta" w hero (patrz page.tsx) może
// otworzyć ten sam popup ręcznie, niezależnie od scrolla.
export const OPEN_SURVEY_EVENT = "sunrun:open-survey";

export function SurveyPopup() {
  const [open, setOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    setAlreadyAnswered(window.localStorage.getItem(ANSWERED_KEY) === "1");

    const onOpenRequest = () => {
      setManualOpen(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_SURVEY_EVENT, onOpenRequest);

    const seen = window.localStorage.getItem(SEEN_KEY) === "1";
    const answered = window.localStorage.getItem(ANSWERED_KEY) === "1";
    if (seen || answered) {
      return () => window.removeEventListener(OPEN_SURVEY_EVENT, onOpenRequest);
    }

    const onScroll = () => {
      if (triggeredRef.current) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const ratio = window.scrollY / scrollable;
      if (ratio >= SCROLL_THRESHOLD_RATIO) {
        triggeredRef.current = true;
        window.localStorage.setItem(SEEN_KEY, "1");
        setOpen(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(OPEN_SURVEY_EVENT, onOpenRequest);
    };
  }, []);

  const close = () => {
    setOpen(false);
    setManualOpen(false);
    setSubmitted(false);
  };

  const submit = async (value: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const meta = collectClientMeta();
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: value, ...meta }),
      });
    } catch {
      // brak zapisu nie może zepsuć UI-a użytkownikowi — po prostu logujemy w konsoli
      console.error("Nie udało się zapisać odpowiedzi ankiety");
    } finally {
      window.localStorage.setItem(ANSWERED_KEY, "1");
      window.localStorage.setItem(SEEN_KEY, "1");
      setAlreadyAnswered(true);
      trackEvent("survey_submit", { answer: value });
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(close, 1800);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={SURVEY_QUESTION}
    >
      <div className="absolute inset-0 bg-[#183153]/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md bg-sr-sand border border-sr-line rounded-3xl p-7 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Zamknij"
          className="cursor-target absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full text-[#3D4D65] hover:text-[#183153] hover:bg-black/5 transition-colors text-xl leading-none"
        >
          ×
        </button>

        {submitted ? (
          <div className="pt-2">
            <p className="text-xl font-black text-sr-red uppercase tracking-wide mb-1">Dzięki!</p>
            <p className="text-sm text-[#183153]">Twoja odpowiedź została zapisana.</p>
          </div>
        ) : alreadyAnswered && manualOpen ? (
          <div className="pt-2">
            <p className="text-sm text-[#183153]">
              Dziękujemy, Twoja odpowiedź została już zapisana wcześniej 🙌
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-5">
              {SURVEY_QUESTION}
            </h2>
            <div className="flex flex-col gap-3">
              {SURVEY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={submitting}
                  onClick={() => submit(opt.value)}
                  className="cursor-target text-left px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors disabled:opacity-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#3D4D65] leading-relaxed mt-5">
              Odpowiedź zapisujemy razem z podstawowymi danymi technicznymi (adres IP, przybliżona
              lokalizacja, źródło wejścia na stronę), żeby lepiej rozumieć, skąd przychodzą
              uczestnicy. Szczegóły w{" "}
              <Link href="/polityka-prywatnosci" className="underline hover:text-[#183153]">
                polityce prywatności
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default SurveyPopup;
