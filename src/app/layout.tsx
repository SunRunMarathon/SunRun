import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";

/**
 * LEMON MILK BOLD — font nagłówkowy wg księgi znaku.
 *
 * Plik pochodzi z oryginalnej dystrybucji autora (Muhammad Ariq Syauqi),
 * przekonwertowany do woff2. Ma pełne pokrycie polskich znaków, w tym „Ś",
 * którego brakowało w pierwszej pobranej kopii. Księga stwierdza, że font
 * wolno używać bezpłatnie w celach osobistych i charytatywnych.
 *
 * Udostępniany jako zmienna CSS --font-lemonmilk, żeby dało się go włączać
 * wybiórczo (na razie: pozycje menu bocznego), a nie globalnie.
 */
const lemonMilk = localFont({
  src: "../fonts/LemonMilk-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-lemonmilk",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";
const GA_ID = "G-13PE0DJ8V6";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sun Run Lublin 2026 — Bieg Charytatywny | 5 km, Park Ludowy",
    template: "%s | Sun Run Lublin",
  },
  description:
    "Sun Run to charytatywny bieg w Lublinie (5 km, Park Ludowy) w 100% organizowany przez lubelską młodzież na rzecz Hospicjum Dobrego Samarytanina. Bieganie, sport i pomoc — dołącz do II edycji 2026 lub zostań wolontariuszem albo partnerem.",
  keywords: [
    // marka
    "Sun Run", "Sun Run Lublin", "Sun Run 2026",
    // bieganie / sport w Lublinie
    "bieg Lublin", "bieganie Lublin", "biegi Lublin", "zawody biegowe Lublin",
    "maraton Lublin", "półmaraton Lublin", "bieg 5 km Lublin", "sport Lublin",
    "wydarzenia sportowe Lublin", "wydarzenia biegowe Lublin", "impreza biegowa Lublin",
    "bieg Park Ludowy", "bieg al. Piłsudskiego Lublin", "Nordic Walking Lublin",
    // bieg charytatywny
    "bieg charytatywny", "bieg charytatywny Lublin", "bieg dla hospicjum",
    "charytatywny bieg Lublin", "cel charytatywny bieg", "bieg z pomocą",
    // hospicjum
    "Hospicjum Dobrego Samarytanina", "hospicjum Lublin", "wsparcie hospicjum Lublin",
    "pomoc hospicjum", "hospicjum Bernardyńska Lublin",
    // wolontariat / partnerzy
    "wolontariat Lublin", "wolontariat bieg", "sponsor biegu Lublin", "partnerzy biegu",
  ],
  authors: [{ name: "Sun Run Lublin" }],
  creator: "Sun Run Lublin",
  publisher: "Sun Run Lublin",
  category: "Sport",
  applicationName: "Sun Run Lublin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: SITE_URL,
    siteName: "Sun Run Lublin",
    title: "Sun Run Lublin 2026 — Bieg Charytatywny | 5 km, Park Ludowy",
    description:
      "Charytatywny bieg w Lublinie na rzecz Hospicjum Dobrego Samarytanina. 5 km · Park Ludowy · bieg i Nordic Walking · 350+ uczestników w 2025. Dołącz do II edycji 2026!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sun Run Lublin 2026 — bieg charytatywny w Parku Ludowym",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sun Run Lublin 2026 — Bieg Charytatywny",
    description:
      "Charytatywny bieg 5 km w Parku Ludowym w Lublinie na rzecz Hospicjum Dobrego Samarytanina. Dołącz do II edycji!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "PL-LU",
    "geo.placename": "Lublin",
    "geo.position": "51.2478;22.5508",
    ICBM: "51.2478, 22.5508",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`h-full antialiased bg-[#F4D8A2] ${lemonMilk.variable}`} suppressHydrationWarning>
      <head>
        {/* Dane strukturalne schema.org (Organization, WebSite, SportsEvent) */}
        <StructuredData />
        {/* Google Analytics 4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4D8A2]" suppressHydrationWarning>{children}</body>
    </html>
  );
}
