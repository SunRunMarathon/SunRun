import { Navbar } from "@/components/navbar";
import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Beneficiary from "@/components/sections/beneficiary";
import Pricing from "@/components/sections/pricing";
import Route from "@/components/sections/route";
import Volunteer from "@/components/sections/volunteer";
import Sponsors from "@/components/sections/sponsors";
import History from "@/components/sections/history";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <About />
        <Beneficiary />
        <Pricing />
        <Route />
        <Volunteer />
        <Sponsors />
        <History />
      </main>
      <Footer />
    </>
  );
}
