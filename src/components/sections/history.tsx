import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Heart,
  ExternalLink,
  Award,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "350+",
    label: "biegaczy",
  },
  {
    icon: MapPin,
    value: "5 km",
    label: "dystans",
  },
  {
    icon: Heart,
    value: "50+",
    label: "wolontariuszy",
  },
  {
    icon: Calendar,
    value: "6.09.2025",
    label: "data biegu",
  },
] as const;

export default function History() {
  return (
    <section className="relative bg-zinc-950 px-4 py-24">
      {/* Decorative top line */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Trophy className="size-6 text-amber-500" />
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              Archiwum
            </p>
          </div>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Sun Run 2025
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Pierwsza edycja biegu charytatywnego Sun Run odbyła się
            6&nbsp;września 2025 roku w&nbsp;Parku Ludowym w&nbsp;Lublinie
            i&nbsp;zakończyła się ogromnym sukcesem.
          </p>
        </div>

        {/* Stats grid */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="border-zinc-800/60 bg-zinc-900/50 text-center"
              >
                <CardContent className="py-8">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Icon className="size-5 text-amber-500" />
                  </div>
                  <p className="text-3xl font-extrabold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievement details */}
        <Card className="border-zinc-800/60 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="size-6 text-amber-500" />
              <CardTitle className="text-xl text-white">
                Co udało nam się osiągnąć
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed text-zinc-400">
              Dzięki zaangażowaniu uczestników i&nbsp;sponsorów pierwsza edycja
              Sun Run pozwoliła sfinansować zakup{" "}
              <span className="font-medium text-amber-400">
                materacy przeciwodleżynowych
              </span>{" "}
              dla podopiecznych Hospicjum Dobrego Samarytanina oraz rozpocząć
              budowę{" "}
              <span className="font-medium text-amber-400">
                całorocznego ogrodu hospicyjnego
              </span>
              .
            </p>

            <Separator className="bg-zinc-800" />

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Datasport — pomiar czasu
              </Badge>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Dzień Dawcy Szpiku DKMS
              </Badge>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Kampania „Nagraj się dla Hospicjum"
              </Badge>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Patronat: UP Lublin
              </Badge>
            </div>

            <Separator className="bg-zinc-800" />

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-500">
                Wyniki biegu i&nbsp;klasyfikacje dostępne online.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-amber-500/30 text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-300"
              >
                Wyniki 2025
                <ExternalLink className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
