"use client";

import React, { useState, useEffect } from "react";

// Target date: July 4, 2026 at 21:00 (5 days from June 29)
const TARGET_DATE = new Date("2026-07-04T21:00:00+02:00").getTime();

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        return "00:00:00:00";
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const f = (num: number) => String(num).padStart(2, "0");

      return `${f(days)}:${f(hours)}:${f(minutes)}:${f(seconds)}`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white font-mono select-none">
      <div className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider">
        {timeLeft}
      </div>
    </div>
  );
}
