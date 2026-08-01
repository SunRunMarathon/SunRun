"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const REJESTRACJA_URL = "https://frslublin.pl/pl/app/races/sign_up_form/295";

// Trzymane jako dane (nie osobne komponenty), żeby dodanie kolejnego pytania
// bylo jedna pozycja w tej tablicy - patrz podobne podejscie w survey-options.ts.
const faqs = [
  {
    question: "Kiedy i gdzie odbędzie się Sun Run 2026?",
    answer:
      "12 września 2026 w Parku Ludowym w Lublinie (al. Józefa Piłsudskiego). Festiwal otwiera się o 16:00, sam bieg startuje o 18:30.",
  },
  {
    // Kwoty i daty MUSZĄ się zgadzać co do znaku z kartami w PricingSection.tsx
    // i z offers w StructuredData.tsx - to jest właśnie różnica między
    // poprawnym oznaczeniem danych a cloakingiem (patrz komentarz w TIERS).
    question: "Ile kosztuje udział?",
    answer:
      "To bieg charytatywny, więc opłata to minimalna wpłata (darowizna), nie sztywna cena biletu - można wpłacić więcej. Minimum wynosi 60 zł przy zapisie do 9 sierpnia 2026, 70 zł do 9 września 2026 i 80 zł w dniu biegu (12 września 2026). Cały dochód trafia do Hospicjum Dobrego Samarytanina.",
  },
  {
    question: "Jaki dystans i limit czasu ma bieg?",
    answer:
      "5 km w formie 2 pętli po asfaltowych alejkach Parku Ludowego, z limitem czasu 80 minut. Trasa ma atest PZLA (Polski Związek Lekkiej Atletyki).",
  },
  {
    question: "Kto może wystartować?",
    answer:
      "Osoby, które ukończyły 14. rok życia. Niepełnoletni uczestnicy muszą przedstawić pisemną zgodę rodzica lub opiekuna prawnego.",
  },
  {
    question: "Jak wygląda zapis na bieg?",
    answer:
      "Rejestracja odbywa się w pełni elektronicznie przez system FRS (frslublin.pl) - link do formularza zapisów znajdziesz na tej stronie w przycisku „Zapisz się”.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative z-10 w-full px-6 sm:px-12 pb-16 sm:pb-24"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-[88rem] mx-auto">
        <h2
          id="faq-heading"
          className="text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-8"
        >
          Najczęściej zadawane pytania
        </h2>

        <Accordion type="single" collapsible className="max-w-3xl space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-2xl border border-sr-line bg-sr-white px-6 not-last:border-b-0"
            >
              <AccordionTrigger className="text-left text-[#183153] font-bold hover:no-underline text-base py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#3D4D65] text-sm leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <a
          href={REJESTRACJA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-target inline-flex items-center justify-center mt-8 px-12 py-5 bg-sr-navy hover:bg-sr-navy/90 text-sr-orange font-black rounded-full text-lg tracking-widest uppercase transition-all duration-300 shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Zapisz się
        </a>
      </div>
    </section>
  );
}

export default FaqSection;
