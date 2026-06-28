import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MapPin, Route as RouteIcon, Clock, Users, Footprints } from "lucide-react";

const routeDetails = [
  {
    id: "distance",
    icon: RouteIcon,
    question: "Jaki jest dystans?",
    answer:
      "Trasa biegu wynosi 5 km i składa się z 2 pętli po asfaltowych ścieżkach Parku Ludowego w Lublinie. Trasa jest płaska i przyjazna dla biegaczy na każdym poziomie zaawansowania.",
  },
  {
    id: "time-limit",
    icon: Clock,
    question: "Jaki jest limit czasowy?",
    answer:
      "Limit czasowy wynosi 60 minut. Trasa jest odpowiednia zarówno dla biegaczy, jak i osób preferujących szybki marsz — każdy może ją ukończyć w wyznaczonym czasie.",
  },
  {
    id: "age",
    icon: Users,
    question: "Kto może wziąć udział?",
    answer:
      "W biegu mogą wziąć udział osoby, które ukończyły 14. rok życia. Osoby niepełnoletnie muszą posiadać zgodę rodzica lub opiekuna prawnego. Klasyfikacje wiekowe: OPEN, 14+, 30+, 50+.",
  },
  {
    id: "surface",
    icon: Footprints,
    question: "Jaka jest nawierzchnia?",
    answer:
      "Cała trasa przebiega po asfaltowych ścieżkach Parku Ludowego (al. J. Piłsudskiego). Nawierzchnia jest równa i komfortowa — idealna do biegania w standardowych butach do biegania.",
  },
] as const;

export default function RoutePage() {
  return (
    <section className="relative bg-zinc-900 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
            Trasa
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Trasa biegu
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            5 kilometrów po malowniczych ścieżkach Parku Ludowego w&nbsp;Lublinie
            — dwie pętle pełne zieleni i&nbsp;pozytywnej energii.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Map placeholder */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-12">
            <MapPin className="mb-4 size-12 text-amber-500/40" />
            <p className="mb-2 text-lg font-medium text-zinc-400">
              Mapa trasy
            </p>
            <p className="text-sm text-zinc-600">
              Szczegółowa mapa zostanie opublikowana wkrótce
            </p>
            <Badge className="mt-4 border-amber-500/30 bg-amber-500/10 text-amber-400">
              Park Ludowy, Lublin
            </Badge>
          </div>

          {/* Accordion FAQ */}
          <div>
            <h3 className="mb-6 text-xl font-semibold text-white">
              Szczegóły trasy
            </h3>
            <Accordion type="multiple" className="space-y-2">
              {routeDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 transition-colors hover:border-amber-500/20"
                  >
                    <AccordionTrigger className="text-zinc-200 hover:text-amber-400 hover:no-underline">
                      <span className="flex items-center gap-3">
                        <Icon className="size-4 text-amber-500" />
                        {item.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
