import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partnerzy i sponsorzy — pakiety współpracy przy biegu",
  description:
    "Zostań partnerem lub sponsorem Sun Run — charytatywnego biegu w Lublinie. Widoczność wśród aktywnej społeczności, stoisko w miasteczku biegowym, media coverage. Poznaj pakiety współpracy i partnerów (DKMS, VIVO! Lublin, AS Babuni, Datasport, UP Lublin).",
  keywords: [
    "sponsor biegu Lublin", "partner biegu charytatywnego", "pakiety sponsorskie bieg",
    "reklama wydarzenie sportowe Lublin", "współpraca bieg Lublin", "sponsoring sport Lublin",
    "DKMS Lublin", "VIVO Lublin bieg",
  ],
  alternates: { canonical: "/partnerzy" },
  openGraph: {
    title: "Partnerzy i sponsorzy — Sun Run Lublin",
    description:
      "Pakiety współpracy dla partnerów i sponsorów charytatywnego biegu Sun Run w Lublinie.",
    url: "/partnerzy",
    type: "website",
  },
};

export default function PartnerzyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
