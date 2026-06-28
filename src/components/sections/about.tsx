import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Heart, Users, Trophy } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Cel charytatywny",
    description:
      "Cały dochód z biegu trafia do Hospicjum Dobrego Samarytanina w Lublinie — organizacji, która wspiera blisko 800 rodzin pacjentów terminalnie chorych na nowotwory rocznie. Każdy kilometr ma znaczenie.",
  },
  {
    icon: Users,
    title: "Organizacja młodzieżowa",
    description:
      "Sun Run to w pełni oddolna inicjatywa lubelskiej młodzieży. Od logistyki przez promocję po program — za wszystkim stoi zespół młodych ludzi, którzy wierzą, że mogą zmieniać świat na lepsze.",
  },
  {
    icon: Trophy,
    title: "Sport i integracja",
    description:
      "5 km po asfaltowych ścieżkach Parku Ludowego — trasa idealna zarówno dla biegaczy, jak i dla osób preferujących spacer. To wydarzenie łączy aktywność fizyczną z budowaniem wspólnoty.",
  },
] as const;

export default function About() {
  return (
    <section className="relative bg-zinc-950 px-4 py-24">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
            O wydarzeniu
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Więcej niż bieg
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Sun Run to wydarzenie, które łączy sport, dobroczynność
            i&nbsp;społeczność w&nbsp;jednym dniu pełnym pozytywnej energii.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group border-zinc-800/60 bg-zinc-900/50 transition-all duration-300 hover:border-amber-500/30 hover:bg-zinc-900/80"
              >
                <CardHeader>
                  <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-colors group-hover:bg-amber-500/20">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-lg text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="sr-only">
                    {feature.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
