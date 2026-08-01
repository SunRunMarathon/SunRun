"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const THRESHOLDS = [25, 50, 75, 100];

// Wysyła event scroll_depth do GA4 przy każdym progu (25/50/75/100% wysokości
// strony), raz na wejście na podstronę. Nic się nie wysyła, dopóki GA nie
// jest załadowane (brak zgody) — trackEvent() jest wtedy no-opem.
export function ScrollDepthTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const fired = new Set<number>();

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;

      for (const threshold of THRESHOLDS) {
        if (ratio >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          trackEvent("scroll_depth", { percent: threshold, page_path: pathname });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}

export default ScrollDepthTracker;
