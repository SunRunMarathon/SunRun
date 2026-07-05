import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nas — organizatorzy biegu charytatywnego w Lublinie",
  description:
    "Sun Run to bieg charytatywny w 100% organizowany przez lubelską młodzież na rzecz Hospicjum Dobrego Samarytanina. Poznaj zespół, misję i wartości, które stoją za biegiem w Lublinie.",
  keywords: [
    "o nas Sun Run", "organizatorzy biegu Lublin", "młodzież Lublin bieg",
    "wolontariat Lublin", "bieg charytatywny organizatorzy", "Hospicjum Dobrego Samarytanina",
  ],
  alternates: { canonical: "/o-nas" },
  openGraph: {
    title: "O nas — organizatorzy Sun Run Lublin",
    description:
      "Bieg charytatywny w 100% organizowany przez lubelską młodzież na rzecz Hospicjum Dobrego Samarytanina w Lublinie.",
    url: "/o-nas",
    type: "website",
  },
};

export default function ONasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
