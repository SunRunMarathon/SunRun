import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-20 text-center">
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(245,158,11,0.15)_0%,_rgba(234,88,12,0.05)_40%,_transparent_70%)]" />

      {/* Decorative sun rays */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-full -translate-x-1/2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-1/2 h-full w-px origin-top bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent"
            style={{ transform: `translateX(-50%) rotate(${i * 15 - 82.5}deg)` }}
          />
        ))}
      </div>

      {/* Subtle glow orb */}
      <div className="pointer-events-none absolute top-[-10%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Small label */}
        <Badge className="mb-6 border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
          2. edycja biegu charytatywnego
        </Badge>

        {/* Main heading */}
        <h1 className="mb-6 text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Sun Run
          </span>{" "}
          <span className="text-white">2026</span>
        </h1>

        {/* Subheading */}
        <p className="mb-6 text-xl font-light italic text-zinc-400 sm:text-2xl md:text-3xl">
          Biegnij dla tych, którzy już nie mogą
        </p>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
          Charytatywny bieg na 5 km w Parku Ludowym w Lublinie. Cały dochód
          wspiera podopiecznych Hospicjum Dobrego Samarytanina — organizację
          pomagającą blisko 800 rodzinom rocznie.
        </p>

        {/* CTA buttons */}
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-12 gap-2 rounded-xl bg-amber-500 px-8 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/40"
          >
            Zapisz się
            <ArrowRight className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 gap-2 rounded-xl border-zinc-700 px-8 text-base text-zinc-300 transition-all hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-400"
          >
            Dowiedz się więcej
            <ChevronDown className="size-5" />
          </Button>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge
            variant="outline"
            className="border-zinc-700 bg-zinc-900/60 px-4 py-1.5 text-sm text-zinc-300"
          >
            🏃 350+ biegaczy w 2025
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-700 bg-zinc-900/60 px-4 py-1.5 text-sm text-zinc-300"
          >
            📏 5 km
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-700 bg-zinc-900/60 px-4 py-1.5 text-sm text-zinc-300"
          >
            📍 Park Ludowy, Lublin
          </Badge>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
