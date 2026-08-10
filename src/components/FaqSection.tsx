"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SECTION_GAP } from "@/lib/layout";

// Trzymane jako dane (nie osobne komponenty), żeby dodanie kolejnego pytania
// bylo jedna pozycja w tej tablicy - patrz podobne podejscie w survey-options.ts.
const faqs = [
  {
    question: "Kiedy i gdzie odbędzie się Sun Run 2026?",
    answer:
      "12 września 2026 w Parku Ludowym w Lublinie (al. Józefa Piłsudskiego). Festiwal otwiera się o 16:00, sam bieg startuje o 18:30.",
  },
  {
    // Kwoty i daty MUSZĄ się zgadzać co do znaku z osią czasu w sekcji „O biegu"
    // (src/app/page.tsx) i z offers w StructuredData.tsx - to jest właśnie
    // różnica między poprawnym oznaczeniem danych a cloakingiem. Wartości
    // trzymane centralnie w src/lib/pricing.ts (TIERS).
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
      "Rejestracja odbywa się w pełni elektronicznie przez system FRS (frslublin.pl) - link do formularza zapisów znajdziesz w przyciskach „Zapisz się” na tej stronie.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative z-10 w-full px-6 sm:px-12"
      style={{ paddingBottom: SECTION_GAP }}
      aria-labelledby="faq-heading"
    >
      <div className="max-w-[88rem] mx-auto">
        <h2
          id="faq-heading"
          className="max-w-3xl mx-auto text-center text-[1.75rem] font-bold uppercase tracking-[0.3em] text-sr-red mb-8"
        >
          Najczęściej zadawane pytania
        </h2>

        <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-3">
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
      </div>
    </section>
  );
}

export default FaqSection;
