"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Kiedy i gdzie odbędzie się bieg?",
    answer:
      "Bieg Sun Run 2026 odbędzie się we wrześniu 2026 roku w Parku Ludowym w Lublinie. Dokładna data i godziny zostaną podane wkrótce na naszej stronie oraz w mediach społecznościowych. Bieg wystartuje z głównych alejek parku.",
  },
  {
    question: "Na jaki cel przeznaczone są zebrane środki?",
    answer:
      "100% dochodu z opłat startowych oraz darowizn trafia bezpośrednio do Hospicjum Dobrego Samarytanina w Lublinie przy ul. Bernardyńskiej 11A. Środki te wspierają opiekę nad chorymi na nowotwory w terminalnym stadium oraz ich rodzinami.",
  },
  {
    question: "Jaki dystans i czas trwania ma bieg?",
    answer:
      "Trasa ma długość 5 km i składa się z 2 pętli po asfaltowych alejkach Parku Ludowego. Limit czasu na pokonanie trasy to 60 minut, co pozwala na udział zarówno biegaczom, jak i osobom chcącym pokonać ten dystans marszem lub spacerem.",
  },
  {
    question: "Czy osoba niepełnoletnia może wystartować?",
    answer:
      "Tak! Minimalny wiek uczestnika to 14 lat (rocznikowo). Osoby niepełnoletnie muszą podczas weryfikacji w biurze zawodów przedstawić pisemną zgodę rodzica lub opiekuna prawnego.",
  },
  {
    question: "Jak wygląda rejestracja i opłata startowa?",
    answer:
      "Rejestracja odbywa się w pełni elektronicznie za pośrednictwem systemu FRS (frslublin.pl). Linki do zapisów znajdziesz na naszej stronie głównej. Opłata startowa rośnie wraz ze zbliżaniem się terminu biegu (60, 70 i 80 PLN w dniu biegu).",
  },
] as const;

export default function FAQ() {
  return (
    <section id="faq" className="relative bg-zinc-950 px-4 py-24 border-t border-zinc-900">
      {/* Decorative gradient glowing orb */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px]" />
      
      <div className="relative mx-auto max-w-3xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
            FAQ
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Często zadawane pytania
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Masz pytania dotyczące biegu? Tutaj znajdziesz najważniejsze informacje i odpowiedzi.
          </p>
        </div>

        {/* Shadcn Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-zinc-800 bg-zinc-900/30 px-6 py-1 rounded-2xl hover:bg-zinc-900/50 hover:border-zinc-700/80 transition-all duration-300 shadow-sm"
            >
              <AccordionTrigger className="text-left text-zinc-200 hover:text-white hover:no-underline font-semibold text-lg py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-base leading-relaxed pb-5 pt-1">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
