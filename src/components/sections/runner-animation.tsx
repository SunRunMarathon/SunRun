"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Footprints } from "lucide-react";

export default function RunnerAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Nasłuchujemy na scroll tylko wewnątrz kontenera `containerRef`.
  // offset: ["start start", "end end"] oznacza, że animacja zaczyna się,
  // gdy góra kontenera dotyka góry ekranu, a kończy, gdy dół kontenera dotyka dołu ekranu.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Przekształcamy progres scrolla (0 - 1) na przesunięcie poziome biegacza (-10% do 110%).
  // Dzięki temu postać wbiega zza lewej krawędzi i wybiega za prawą krawędź.
  const xTransform = useTransform(scrollYProgress, [0, 1], ["-20%", "120vw"]);

  return (
    // Ten kontener ma wysokość 300vh, co oznacza, że scrollowanie przez niego zajmie 3 wysokości ekranu.
    <section ref={containerRef} className="relative h-[300vh] bg-[#faf9f5]">
      {/* 
        Sticky kontener zatrzymuje się w miejscu, dopóki główny kontener się scrolluje.
        To tutaj dzieje się cała "magia" – tło stoi w miejscu, a postać biegnie.
      */}
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden border-y border-zinc-200/50 bg-white/30 backdrop-blur-sm">
        
        {/* Tło lub ścieżka dla biegacza */}
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-50" />
        
        {/* Kontener biegacza */}
        <motion.div
          style={{ x: xTransform }}
          className="absolute z-10 flex items-center justify-center"
        >
          {/* Zastępcza ikona, dopóki nie dostaniemy pliku GIF / Lottie */}
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-2xl bg-white shadow-xl border border-zinc-100 p-4">
            <Footprints className="size-16 text-amber-500 mb-2 animate-bounce" />
            <span className="text-xs font-bold text-zinc-400 text-center uppercase tracking-widest">
              Biegacz<br />Placeholder
            </span>
          </div>
        </motion.div>

        {/* Tekst zachęcający do scrollowania */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm font-semibold text-zinc-400">Scrolluj dalej, by pobiec!</p>
        </div>
      </div>
    </section>
  );
}
