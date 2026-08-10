"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ReferralGenerator } from "@/components/ReferralGenerator";

export default function ZaproszeniePage() {
  return (
    <div className="relative bg-sr-sand text-sr-navy overflow-x-hidden min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <ReferralGenerator />
      </div>
      <Footer />
    </div>
  );
}
