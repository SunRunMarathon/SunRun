import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sun Run 2026 — Bieg Charytatywny w Lublinie",
  description:
    "Sun Run 2026 — charytatywny bieg na 5 km w Parku Ludowym w Lublinie. Biegnij dla tych, którzy już nie mogą. Wspieraj Hospicjum Dobrego Samarytanina.",
  keywords: [
    "Sun Run",
    "bieg charytatywny",
    "Lublin",
    "hospicjum",
    "5km",
    "Park Ludowy",
    "2026",
  ],
  openGraph: {
    title: "Sun Run 2026 — Bieg Charytatywny w Lublinie",
    description:
      "Charytatywny bieg na 5 km wspierający Hospicjum Dobrego Samarytanina. Dołącz do nas!",
    type: "website",
    locale: "pl_PL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        {children}
      </body>
    </html>
  );
}
