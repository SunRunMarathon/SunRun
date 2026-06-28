"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ExternalLink, Clock, Zap, Star } from "lucide-react";

const tiers = [
  {
    id: "tier-1",
    label: "I termin",
    price: "60",
    deadline: "do [DATA 2026]",
    description:
      "Najniższa cena za wczesną rejestrację. Zarezerwuj swoje miejsce już teraz i&nbsp;wesprzyj cel charytatywny.",
    icon: Clock,
    highlight: "Najlepsza cena",
  },
  {
    id: "tier-2",
    label: "II termin",
    price: "70",
    deadline: "do [DATA 2026]",
    description:
      "Standardowa cena rejestracji. Pakiet startowy, numer, chip pomiarowy i&nbsp;pamiątkowy medal w&nbsp;cenie.",
    icon: Star,
    highlight: "Standardowy",
  },
  {
    id: "tier-3",
    label: "III termin",
    price: "80",
    deadline: "w dniu biegu",
    description:
      "Rejestracja w&nbsp;dniu biegu — jeśli zostaną wolne miejsca. Nie czekaj na ostatnią chwilę!",
    icon: Zap,
    highlight: "Ostatnia szansa",
  },
] as const;

export default function Pricing() {
  return (
    <section className="relative bg-zinc-950 px-4 py-24">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[150px]" />

      <div className="relative mx-auto max-w-4xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
            Cennik
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Opłata startowa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Im wcześniej się zapiszesz, tym mniej zapłacisz. Cały dochód trafia
            na cel charytatywny.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tier-1" className="items-center">
          <TabsList className="mb-8 bg-zinc-900 p-1">
            {tiers.map((tier) => (
              <TabsTrigger
                key={tier.id}
                value={tier.id}
                className="rounded-lg px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950"
              >
                {tier.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <TabsContent key={tier.id} value={tier.id}>
                <Card className="mx-auto max-w-lg border-zinc-800/60 bg-zinc-900/50">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <Icon className="size-6 text-amber-500" />
                    </div>
                    <Badge className="mx-auto mb-2 w-fit border-amber-500/30 bg-amber-500/10 text-amber-400">
                      {tier.highlight}
                    </Badge>
                    <CardTitle className="text-white">
                      <span className="text-5xl font-extrabold text-amber-500">
                        {tier.price}
                      </span>{" "}
                      <span className="text-2xl text-zinc-400">PLN</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      {tier.deadline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p
                      className="text-zinc-400"
                      dangerouslySetInnerHTML={{ __html: tier.description }}
                    />
                  </CardContent>
                  <CardFooter className="flex-col gap-4 border-zinc-800 bg-zinc-950/50">
                    <Button
                      size="lg"
                      className="w-full gap-2 bg-amber-500 text-zinc-950 hover:bg-amber-400"
                      asChild
                    >
                      <a
                        href="https://frslublin.pl"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Zapisz się przez FRS
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                    <p className="text-xs text-zinc-500">
                      Zapisy prowadzone przez system FRS (frslublin.pl)
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
