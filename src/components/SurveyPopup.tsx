"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  OTHER_VALUE,
  SURVEY_OPTIONS,
  SURVEY_QUESTION,
  type SurveyOption,
} from "@/lib/survey-options";
import { collectClientMeta } from "@/lib/client-meta";
import { trackEvent } from "@/lib/analytics";
import { getVisitorId } from "@/lib/visitor-id";
import { hasAnalyticsConsent } from "@/lib/consent";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getBackdropVariants, getModalPanelVariants, getStepVariants } from "@/lib/motion-variants";

// Eksportowany, bo page.tsx czyta ten sam klucz, żeby wiedzieć, czy przycisk
// "Ankieta" ma pokazywać pytanie, czy już podziękowanie za odpowiedź.
export const ANSWERED_KEY = "sr_survey_answered";

// Zdarzenie, przez które przycisk "Ankieta" w hero (patrz page.tsx) otwiera
// ten popup. To JEDYNY sposób, w jaki się teraz otwiera — nie ma już
// wyskakiwania samo z siebie przy scrollu.
export const OPEN_SURVEY_EVENT = "sunrun:open-survey";

// Zdarzenie wysyłane zaraz po zapisaniu odpowiedzi, żeby przycisk w hero mógł
// natychmiast przełączyć się w stan "już odpowiedziano" bez przeładowania
// strony (localStorage samo z siebie nie powiadamia komponentów o zmianie).
export const SURVEY_ANSWERED_EVENT = "sunrun:survey-answered";

// Krok w obrębie popupu: "main" to pierwsze pytanie, "sub" to doprecyzowanie
// (na razie tylko dla "Media społecznościowe"), "detail" to opcjonalne pole
// tekstowe pokazywane po wybraniu "Inne" na dowolnym poziomie.
type Step = "main" | "sub" | "detail";

export function SurveyPopup() {
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);

  const [step, setStep] = useState<Step>("main");
  const [mainValue, setMainValue] = useState<string | null>(null);
  const [subValue, setSubValue] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");

  const mainOption = SURVEY_OPTIONS.find((o) => o.value === mainValue) || null;

  // Jedyne wejście do popupu to zdarzenie z przycisku "Ankieta" w hero — nie
  // ma już samoczynnego otwierania przy scrollu.
  useEffect(() => {
    setAlreadyAnswered(window.localStorage.getItem(ANSWERED_KEY) === "1");

    const onOpenRequest = () => setOpen(true);
    window.addEventListener(OPEN_SURVEY_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_SURVEY_EVENT, onOpenRequest);
  }, []);

  const resetSteps = () => {
    setStep("main");
    setMainValue(null);
    setSubValue(null);
    setOtherText("");
  };

  const close = () => {
    setOpen(false);
    setSubmitted(false);
    resetSteps();
  };

  const submit = async (answer: string, answerDetail: string | null, freeText: string | null) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const meta = collectClientMeta();
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          answerDetail,
          otherText: freeText,
          visitorId: getVisitorId(),
          // IP/geolokalizacja/user-agent/typ urzadzenia w /api/survey zapisuja
          // sie TYLKO gdy to true - sama odpowiedz idzie zawsze, niezaleznie
          // od zgody (patrz komentarz w api/survey/route.ts).
          consent: hasAnalyticsConsent(),
          ...meta,
        }),
      });
    } catch {
      // brak zapisu nie może zepsuć UI-a użytkownikowi — po prostu logujemy w konsoli
      console.error("Nie udało się zapisać odpowiedzi ankiety");
    } finally {
      window.localStorage.setItem(ANSWERED_KEY, "1");
      setAlreadyAnswered(true);
      window.dispatchEvent(new Event(SURVEY_ANSWERED_EVENT));
      trackEvent("survey_submit", { answer, answerDetail: answerDetail ?? undefined });
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(close, 1800);
    }
  };

  const chooseMain = (opt: SurveyOption) => {
    if (opt.subOptions) {
      setMainValue(opt.value);
      setStep("sub");
      return;
    }
    if (opt.value === OTHER_VALUE) {
      setMainValue(opt.value);
      setStep("detail");
      return;
    }
    submit(opt.value, null, null);
  };

  const chooseSub = (opt: SurveyOption) => {
    if (opt.value === OTHER_VALUE) {
      setSubValue(opt.value);
      setStep("detail");
      return;
    }
    submit(mainValue!, opt.value, null);
  };

  const submitDetail = () => {
    submit(mainValue!, subValue, otherText.trim() || null);
  };

  const goBack = () => {
    if (step === "detail" && mainOption?.subOptions) {
      setStep("sub");
      setSubValue(null);
      return;
    }
    setStep("main");
    setMainValue(null);
    setSubValue(null);
  };

  const backdropVariants = getBackdropVariants(reducedMotion);
  const panelVariants = getModalPanelVariants(reducedMotion);
  const stepVariants = getStepVariants(reducedMotion);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={SURVEY_QUESTION}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            variants={backdropVariants}
            className="absolute inset-0 bg-[#183153]/50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            layout
            variants={panelVariants}
            transition={{ layout: { duration: reducedMotion ? 0 : 0.25, ease: "easeInOut" } }}
            className="relative w-full max-w-md bg-sr-sand border border-sr-line rounded-3xl p-7 sm:p-8 shadow-2xl overflow-hidden"
          >
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
                <p className="text-xl font-black text-sr-red uppercase tracking-wide mb-1">
                  Dzięki!
                </p>
                <p className="text-sm text-[#183153]">Twoja odpowiedź została zapisana.</p>
              </div>
            ) : alreadyAnswered ? (
              <div className="pt-2">
                <p className="text-sm text-[#183153]">
                  Dziękujemy, Twoja odpowiedź została już zapisana wcześniej 🙌
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {step === "main" && (
                  <motion.div key="main" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-5">
                      {SURVEY_QUESTION}
                    </h2>
                    <div className="flex flex-col gap-3">
                      {SURVEY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={submitting}
                          onClick={() => chooseMain(opt)}
                          className="cursor-target text-left px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors disabled:opacity-50"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#3D4D65] leading-relaxed mt-5">
                      Odpowiedź zapisujemy razem z&nbsp;podstawowymi danymi technicznymi (adres IP,
                      przybliżona lokalizacja, źródło wejścia na stronę), żeby lepiej rozumieć, skąd
                      przychodzą uczestnicy. Szczegóły w{" "}
                      <Link href="/polityka-prywatnosci" className="underline hover:text-[#183153]">
                        polityce prywatności
                      </Link>
                      .
                    </p>
                  </motion.div>
                )}

                {step === "sub" && mainOption?.subOptions && (
                  <motion.div key="sub" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <button
                      type="button"
                      onClick={goBack}
                      className="text-xs text-[#3D4D65] hover:text-[#183153] mb-3 -ml-1 px-1"
                    >
                      ← Wstecz
                    </button>
                    <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-5">
                      {mainOption.subQuestion}
                    </h2>
                    <div className="flex flex-col gap-3">
                      {mainOption.subOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={submitting}
                          onClick={() => chooseSub(opt)}
                          className="cursor-target text-left px-5 py-3.5 bg-white border border-sr-line hover:border-sr-orange rounded-2xl text-sm font-bold text-[#183153] transition-colors disabled:opacity-50"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === "detail" && (
                  <motion.div key="detail" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <button
                      type="button"
                      onClick={goBack}
                      className="text-xs text-[#3D4D65] hover:text-[#183153] mb-3 -ml-1 px-1"
                    >
                      ← Wstecz
                    </button>
                    <h2 className="text-lg sm:text-xl font-black text-[#183153] pr-8 mb-3">
                      Chcesz dopisać skąd? (opcjonalnie)
                    </h2>
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder="Np. plakat na uczelni, radio..."
                      maxLength={200}
                      className="w-full bg-white border border-sr-line focus:border-sr-orange rounded-xl px-4 py-3 text-sm text-[#183153] outline-none transition-colors mb-4"
                    />
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={submitDetail}
                      className="cursor-target w-full py-3.5 bg-sr-orange hover:bg-sr-orange/90 disabled:opacity-50 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all"
                    >
                      Wyślij
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SurveyPopup;
