import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zaproś znajomych - Sun Run 2026",
  description:
    "Masz numer startowy na Sun Run 2026? Wygeneruj swój osobisty link i zaproś znajomych do udziału w charytatywnym biegu na rzecz Hospicjum Dobrego Samarytanina w Lublinie.",
  alternates: { canonical: "/zaproszenie" },
  openGraph: {
    title: "Zaproś znajomych - Sun Run 2026",
    description:
      "Wygeneruj swój link i zaproś znajomych na Sun Run 2026 - charytatywny bieg w Lublinie na rzecz Hospicjum Dobrego Samarytanina.",
    url: "/zaproszenie",
    type: "website",
  },
};

export default function ZaproszenieLayout({ children }: { children: React.ReactNode }) {
  return children;
}
