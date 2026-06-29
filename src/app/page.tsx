import { Navbar } from "@/components/navbar";
import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Beneficiary from "@/components/sections/beneficiary";
import Pricing from "@/components/sections/pricing";
import RoutePage from "@/components/sections/route";
import Volunteer from "@/components/sections/volunteer";
import Sponsors from "@/components/sections/sponsors";
import FAQ from "@/components/sections/faq";
import History from "@/components/sections/history";
import Footer from "@/components/sections/footer";
import { ScrollReveal } from "@/components/scroll-reveal";

import RunnerAnimation from "@/components/sections/runner-animation";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f5] text-zinc-900 scroll-smooth">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section (Has its own page-load animations) */}
        <Hero />

        {/* Scroll Animation - Biegacz */}
        <RunnerAnimation />

        {/* O nas Section */}
        <div id="about" className="scroll-mt-16">
          <ScrollReveal>
            <About />
          </ScrollReveal>
        </div>

        {/* Hospicjum Beneficiary Section */}
        <div id="beneficiary" className="scroll-mt-16">
          <ScrollReveal>
            <Beneficiary />
          </ScrollReveal>
        </div>

        {/* Zapisy i Cennik Section */}
        <div id="pricing" className="scroll-mt-16">
          <ScrollReveal>
            <Pricing />
          </ScrollReveal>
        </div>

        {/* Trasa Section */}
        <div id="route" className="scroll-mt-16">
          <ScrollReveal>
            <RoutePage />
          </ScrollReveal>
        </div>

        {/* Wolontariat Section */}
        <div id="volunteer" className="scroll-mt-16">
          <ScrollReveal>
            <Volunteer />
          </ScrollReveal>
        </div>

        {/* Sponsorzy Section */}
        <div id="sponsors" className="scroll-mt-16">
          <ScrollReveal>
            <Sponsors />
          </ScrollReveal>
        </div>

        {/* Częste Pytania FAQ Section */}
        <div id="faq" className="scroll-mt-16">
          <ScrollReveal>
            <FAQ />
          </ScrollReveal>
        </div>

        {/* Historia / Archiwum Section */}
        <div id="history" className="scroll-mt-16">
          <ScrollReveal>
            <History />
          </ScrollReveal>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
