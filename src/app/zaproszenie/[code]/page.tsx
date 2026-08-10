import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getInviterNameByCode } from "@/lib/referrals-db";
import { ReferralLanding } from "@/components/ReferralLanding";

// Next.js w tej wersji przekazuje params jako Promise (patrz AGENTS.md -
// breaking changes wobec starszych wersji).
type Props = { params: Promise<{ code: string }> };

// Strony personalne (jedna na kazdy wygenerowany link) - noindex, zeby
// wyszukiwarki nie indeksowaly setek prawie identycznych podstron.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const inviterName = await getInviterNameByCode(code);
  return {
    title: inviterName
      ? `${inviterName} zaprasza Cię na Sun Run 2026`
      : "Zaproszenie na Sun Run 2026",
    robots: { index: false, follow: false },
  };
}

export default async function ZaproszeniePage({ params }: Props) {
  const { code } = await params;
  const inviterName = await getInviterNameByCode(code);
  if (!inviterName) notFound();

  return (
    <div className="relative bg-sr-sand text-sr-navy overflow-x-hidden min-h-screen">
      <Navbar />
      <ReferralLanding code={code} inviterName={inviterName} />
      <Footer />
    </div>
  );
}
