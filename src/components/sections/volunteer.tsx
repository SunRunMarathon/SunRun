"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Send } from "lucide-react";

export default function Volunteer() {
  return (
    <section className="relative bg-zinc-950 px-4 py-24">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left column — Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
              <Heart className="size-4" />
              Dołącz do zespołu
            </div>

            <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
              Zostań wolontariuszem
            </h2>

            <p className="mb-6 text-lg leading-relaxed text-zinc-400">
              Sun Run jest organizowany w&nbsp;całości przez wolontariuszy —
              młodych ludzi z&nbsp;Lublina, którzy wierzą w&nbsp;siłę
              wspólnego działania. Potrzebujemy Ciebie!
            </p>

            <ul className="space-y-3 text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block size-2 rounded-full bg-amber-500" />
                Pomoc przy organizacji trasy i&nbsp;punktów nawadniania
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block size-2 rounded-full bg-amber-500" />
                Obsługa biura zawodów i&nbsp;pakietów startowych
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block size-2 rounded-full bg-amber-500" />
                Wsparcie w&nbsp;promocji i&nbsp;mediach społecznościowych
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block size-2 rounded-full bg-amber-500" />
                Opieka nad uczestnikami w&nbsp;dniu biegu
              </li>
            </ul>
          </div>

          {/* Right column — Form */}
          <Card className="border-zinc-800/60 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Formularz zgłoszeniowy
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Wypełnij formularz, a&nbsp;odezwiemy się do Ciebie z&nbsp;
                szczegółami.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    Imię
                  </Label>
                  <Input
                    id="name"
                    placeholder="Twoje imię"
                    className="border-zinc-700 bg-zinc-950/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.pl"
                    className="border-zinc-700 bg-zinc-950/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-300">
                    Wiadomość
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Napisz kilka słów o sobie i o tym, jak chciałbyś/chciałabyś pomóc..."
                    rows={4}
                    className="border-zinc-700 bg-zinc-950/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 bg-amber-500 text-zinc-950 hover:bg-amber-400"
                >
                  Wyślij zgłoszenie
                  <Send className="size-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
