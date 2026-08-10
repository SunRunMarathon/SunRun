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
    // flex-col + flex-1 na tresci: stopka zawsze na dole ekranu (nie tuz pod
    // krotka trescia z pustym pasem pod soba) - krotka tresc tej strony
    // (jeden akapit + przycisk) bez tego ukladu zostawiala na telefonie
    // dziwna, pusta przestrzen miedzy tekstem a stopka.
    <div className="relative bg-sr-sand text-sr-navy overflow-x-hidden min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center">
        <ReferralLanding code={code} inviterName={inviterName} />
      </div>
      <Footer />
    </div>
  );
}
