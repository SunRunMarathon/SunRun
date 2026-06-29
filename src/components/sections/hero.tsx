import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Calendar, MapPin, Heart } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#faf9f5] pt-16">

      {/* Desktop fading high-quality runners image on the right */}
      <div className="absolute inset-y-0 right-0 z-0 hidden w-1/2 lg:block animate-in fade-in duration-1000">
        <div className="relative h-full w-full">
          <Image
            src="/race-marathon-runners-athletes-preview.jpg"
            alt="Uczestnicy maratonu biegający o zachodzie słońca"
            fill
            priority
            className="object-cover object-center transition-all duration-700 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{
              maskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>
      </div>

      {/* Mobile background watermark (faint overlay on dark background) */}
      <div className="absolute inset-0 z-0 opacity-20 lg:hidden">
        <Image
          src="/race-marathon-runners-athletes-preview.jpg"
          alt="Uczestnicy maratonu"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column - shifted more to the left */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left py-12 lg:py-24">
            
            {/* Title with smooth slide-up animation */}
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-zinc-900 leading-none animate-in fade-in slide-in-from-bottom-4 duration-700">
              SUN<span className="text-amber-500">RUN</span>
            </h1>

            {/* Slogan: "Pomóż sobie i innym" with delayed animation */}
            <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-800 tracking-tight leading-tight max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Pomóż sobie i innym.
            </h2>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Bieganie to zdrowie dla Ciebie i pomoc dla hospicjum.
            </p>

            {/* Subheading description */}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Charytatywny bieg na 5 km w Parku Ludowym w Lublinie. Cały dochód wspiera podopiecznych <strong>Hospicjum Dobrego Samarytanina</strong>. Zrób coś dobrego dla swojego ciała i podaruj nadzieję tym, którzy już nie mogą biec.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <Button
                size="lg"
                asChild
                className="h-12 gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 text-base shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5 duration-200"
              >
                <a
                  href="https://frslublin.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zapisz się teraz
                  <ArrowRight className="size-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 gap-2 rounded-xl border-zinc-300 bg-white hover:bg-zinc-50 hover:border-zinc-400 text-zinc-700 hover:text-zinc-900 px-8 text-base transition-all duration-200 hover:-translate-y-0.5"
              >
                <a href="#about">
                  Dowiedz się więcej
                  <ChevronDown className="size-5" />
                </a>
              </Button>
            </div>

            {/* Details tags */}
            <div className="mt-12 flex flex-wrap gap-4 text-sm text-zinc-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
              <div className="flex items-center gap-2 bg-white/60 border border-zinc-200 px-4 py-2 rounded-xl backdrop-blur-sm transition-all hover:border-amber-500/30 shadow-sm">
                <Calendar className="size-4 text-amber-500" />
                <span>Wrzesień 2026</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 border border-zinc-200 px-4 py-2 rounded-xl backdrop-blur-sm transition-all hover:border-amber-500/30 shadow-sm">
                <MapPin className="size-4 text-amber-500" />
                <span>Park Ludowy, Lublin</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 border border-zinc-200 px-4 py-2 rounded-xl backdrop-blur-sm transition-all hover:border-red-500/30 shadow-sm">
                <Heart className="size-4 text-red-500 fill-red-500/10" />
                <span>Cel: Pomoc Hospicjum</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom shadow fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#faf9f5] to-transparent pointer-events-none" />
    </section>
  );
}
