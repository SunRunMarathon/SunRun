"use client";

import Link from "next/link";

// Wczesniej: kompaktowa karta + modal generujacy link na tej samej stronie.
// Modal renderowal sie POD pozniejszymi sekcjami (Wspomnienia/FAQ/Partnerzy)
// i sam w sobie byl za malo widoczny jak na cos, co ma zachecac do udzialu -
// stad zwykly link na osobna, wieksza podstrone (/zaproszenie) zamiast
// modala. Patrz ReferralGenerator.tsx.
export function ReferralPanel() {
  return (
    <div className="rounded-3xl bg-sr-white border border-sr-line p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-sr-red mb-1.5 block">
          Zapisany?
        </span>
        <p className="text-sm sm:text-base text-[#183153] font-bold">
          Zaproś znajomych na Sun Run i biegnijcie razem
        </p>
      </div>
      <Link
        href="/zaproszenie"
        className="cursor-target shrink-0 px-8 py-3.5 bg-sr-orange hover:bg-sr-orange/90 text-sr-navy font-black rounded-full text-sm tracking-widest uppercase transition-all shadow-lg hover:-translate-y-0.5"
      >
        Zaproś znajomych
      </Link>
    </div>
  );
}

export default ReferralPanel;
