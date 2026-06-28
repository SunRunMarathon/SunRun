import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HeartHandshake, Home, Users, Target } from "lucide-react";

export default function Beneficiary() {
  return (
    <section className="relative bg-zinc-900 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <HeartHandshake className="size-6 text-amber-500" />
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              Beneficjent
            </p>
          </div>
          <h2 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
            Hospicjum Dobrego Samarytanina
          </h2>
          {/* Accent line */}
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-600" />
        </div>

        {/* Main info */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* Description */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-zinc-300">
              Hospicjum Dobrego Samarytanina to lubelska organizacja, która od
              lat obejmuje opieką pacjentów terminalnie chorych na nowotwory
              i&nbsp;ich rodziny. Działa przy ul.&nbsp;Bernardyńskiej 11A
              w&nbsp;Lublinie.
            </p>
            <p className="leading-relaxed text-zinc-400">
              Codziennie zespół hospicjum — lekarze, pielęgniarki, psycholodzy
              i&nbsp;wolontariusze — dba o&nbsp;godność i&nbsp;komfort życia
              swoich podopiecznych. Sun Run istnieje, by wspierać tę misję.
            </p>

            <Separator className="bg-zinc-800" />

            {/* Details */}
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-zinc-300"
              >
                <Home className="mr-1.5 size-3.5" />
                ul. Bernardyńska 11A, Lublin
              </Badge>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-zinc-300"
              >
                KRS: 0000 318 602
              </Badge>
            </div>
          </div>

          {/* Stats card */}
          <Card className="border-amber-500/20 bg-zinc-950/80">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-amber-500/10">
                <Users className="size-8 text-amber-500" />
              </div>
              <p className="mb-2 text-5xl font-extrabold text-amber-500">
                ~800
              </p>
              <p className="text-lg text-zinc-300">
                rodzin objętych opieką rocznie
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                pacjenci terminalnie chorzy na nowotwory i&nbsp;ich bliscy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 2026 Goal placeholder */}
        <Card className="border-dashed border-amber-500/30 bg-zinc-950/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Target className="size-6 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-white">
              Nasz cel na 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mx-auto max-w-lg text-zinc-400">
              Szczegóły wkrótce — cel zbiórki zostanie ogłoszony po
              konsultacjach z&nbsp;Hospicjum. Śledź nasze kanały, aby dowiedzieć
              się więcej.
            </p>
            <Badge className="mt-6 border-amber-500/30 bg-amber-500/10 text-amber-400">
              Ogłoszenie wkrótce
            </Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
