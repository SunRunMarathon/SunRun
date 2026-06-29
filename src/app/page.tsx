"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom SVG Icons to prevent lucide-react version compatibility issues
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Target date: 5 days from June 29, 2026 21:00 -> July 4, 2026 21:00
const TARGET_DATE = new Date("2026-07-04T21:00:00+02:00").getTime();

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  // Prevent hydration mismatch by rendering a dark loading skeleton on server
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0a09] text-white">
        <div className="animate-pulse text-xl font-light tracking-widest text-amber-500">
          SUN RUN 2026
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#0b0a09] text-zinc-100 overflow-hidden font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Background glow effects */}
      <div 
        className="absolute top-[-20%] left-[50%] -translate-x-[50%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(234, 88, 12, 0.04) 50%, transparent 100%)"
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 80%)"
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <SunIcon className="h-6 w-6 text-black stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            SUN RUN <span className="text-amber-500">2026</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <HeartIcon className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="hidden sm:inline">Dla Hospicjum Dobrego Samarytanina</span>
          <span className="sm:hidden text-xs">Dla Hospicjum</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6 inline-block">
            Przygotowania do II edycji
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Zapisy ruszają już <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            wkrótce!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-base sm:text-lg max-w-lg mb-12"
        >
          Szykujemy dla Was kolejną edycję charytatywnego biegu. 
          Wszystkie zebrane środki przekażemy na rzecz Hospicjum Dobrego Samarytanina w Lublinie.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-2xl mb-12"
        >
          {/* Days */}
          <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/20">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-600 opacity-60" />
            <div className="text-3xl sm:text-5xl font-bold font-mono tracking-tight text-white mb-1">
              {formatNumber(timeLeft.days)}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Dni
            </div>
          </div>

          {/* Hours */}
          <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/20">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-600 opacity-60" />
            <div className="text-3xl sm:text-5xl font-bold font-mono tracking-tight text-white mb-1">
              {formatNumber(timeLeft.hours)}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Godzin
            </div>
          </div>

          {/* Minutes */}
          <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/20">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-600 opacity-60" />
            <div className="text-3xl sm:text-5xl font-bold font-mono tracking-tight text-white mb-1">
              {formatNumber(timeLeft.minutes)}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Minut
            </div>
          </div>

          {/* Seconds */}
          <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/20">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-600 opacity-60" />
            <div className="text-3xl sm:text-5xl font-bold font-mono tracking-tight text-amber-500 mb-1">
              {formatNumber(timeLeft.seconds)}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Sekund
            </div>
          </div>
        </motion.div>

        {/* Call to action form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-md mx-auto"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="signup-form"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2.5"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="email"
                  required
                  placeholder="Twój adres e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-5 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Powiadom mnie
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="signup-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              >
                <CheckIcon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium text-left">
                  Zapisano! Powiadomimy Cię, gdy zapisy ruszą.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 text-xs text-zinc-500">
        <div>
          © {new Date().getFullYear()} Sun Run. Wszelkie prawa zastrzeżone.
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/sunrun_lublin/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 transition-colors flex items-center gap-1.5"
          >
            <InstagramIcon className="h-3.5 w-3.5" />
            <span>Instagram</span>
          </a>
          <a
            href="https://www.facebook.com/people/Sun-Run/61563604085444/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 transition-colors flex items-center gap-1.5"
          >
            <FacebookIcon className="h-3.5 w-3.5" />
            <span>Facebook</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
