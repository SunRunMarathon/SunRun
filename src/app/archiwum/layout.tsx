import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archiwum I edycji 2025 — wyniki, relacja i galeria",
  description:
    "Archiwum I edycji Sun Run 2025: ponad 350 uczestników, bieg na 5 km w Parku Ludowym w Lublinie na rzecz Hospicjum Dobrego Samarytanina. Zobacz wyniki, relację i galerię zdjęć z pierwszego biegu charytatywnego.",
  keywords: [
    "Sun Run 2025", "wyniki bieg Lublin 2025", "bieg charytatywny Lublin 2025",
    "galeria bieg Lublin", "relacja bieg Park Ludowy", "wyniki biegu 5 km Lublin",
  ],
  alternates: { canonical: "/archiwum" },
  openGraph: {
    title: "Archiwum I edycji 2025 — Sun Run Lublin",
    description:
      "Ponad 350 uczestników, 5 km w Parku Ludowym — relacja, wyniki i galeria I edycji biegu charytatywnego Sun Run.",
    url: "/archiwum",
    type: "website",
  },
};

export default function ArchiwumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
