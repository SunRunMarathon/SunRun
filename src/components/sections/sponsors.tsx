import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, Star, Award, Newspaper } from "lucide-react";

const sponsorTiers = [
  {
    title: "Partner Główny",
    icon: Star,
    slots: 1,
    size: "lg" as const,
  },
  {
    title: "Partner",
    icon: Award,
    slots: 3,
    size: "md" as const,
  },
  {
    title: "Patron Medialny",
    icon: Newspaper,
    slots: 3,
    size: "sm" as const,
  },
] as const;

export default function Sponsors() {
  return (
    <section className="relative bg-zinc-900 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
            Partnerzy
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Sponsorzy i&nbsp;partnerzy
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Sun Run to wydarzenie budowane wspólnie. Dołącz do grona partnerów
            i&nbsp;pomóż nam dotrzeć do jeszcze większej liczby osób.
          </p>
        </div>

        {/* Sponsor tiers */}
        <div className="space-y-12">
          {sponsorTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.title}>
                {/* Tier label */}
                <div className="mb-6 flex items-center gap-3">
                  <Icon className="size-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-white">
                    {tier.title}
                  </h3>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>

                {/* Slots grid */}
                <div
                  className={`grid gap-4 ${
                    tier.slots === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                  }`}
                >
                  {Array.from({ length: tier.slots }).map((_, i) => (
                    <Card
                      key={i}
                      className={`group border-dashed border-zinc-700 bg-zinc-950/30 transition-all duration-300 hover:border-amber-500/40 hover:bg-zinc-950/60 ${
                        tier.size === "lg" ? "min-h-[180px]" : "min-h-[140px]"
                      }`}
                    >
                      <CardContent className="flex h-full flex-col items-center justify-center py-8">
                        <div className="mb-3 rounded-lg border border-dashed border-zinc-600 p-3 transition-colors group-hover:border-amber-500/30">
                          <Handshake className="size-6 text-zinc-600 transition-colors group-hover:text-amber-500/50" />
                        </div>
                        <p className="text-sm text-zinc-600 transition-colors group-hover:text-zinc-400">
                          Twoje logo tutaj
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Badge className="mb-4 border-amber-500/30 bg-amber-500/10 text-amber-400">
            Oferta partnerska dostępna
          </Badge>
          <p className="mb-6 text-zinc-400">
            Zainteresowany współpracą? Przygotowaliśmy pakiety sponsorskie
            dopasowane do różnych potrzeb.
          </p>
          <Button
            size="lg"
            className="gap-2 bg-amber-500 px-8 text-zinc-950 hover:bg-amber-400"
          >
            <Handshake className="size-5" />
            Zostań sponsorem
          </Button>
        </div>
      </div>
    </section>
  );
}
