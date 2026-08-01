import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollDepthTracker } from "@/components/ScrollDepthTracker";
import { OutboundLinkTracker } from "@/components/OutboundLinkTracker";

/**
 * Montserrat — font tekstowy wg księgi znaku (SemiBold, Bold, ExtraBold, Black
 * wraz z odmianami pochyłymi).
 *
 * `latin-ext` jest tu KONIECZNY. Bez tego podzbioru font nie zawiera polskich
 * znaków diakrytycznych i litery ą, ć, ę, ł, ń, ó, ś, ź, ż spadałyby na czcionkę
 * zastępczą — w środku wyrazu, co widać od razu.
 *
 * Montserrat na Google Fonts jest fontem zmiennym, więc jedno wczytanie pokrywa
 * wszystkie grubości z księgi i nie trzeba wyliczać ich osobno.
 */
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
});

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sun Run Lublin 2026 - Bieg Charytatywny | 5 km, Park Ludowy",
    template: "%s | Sun Run Lublin",
  },
  description:
    "Sun Run to charytatywny bieg w Lublinie (5 km, Park Ludowy) w 100% organizowany przez lubelską młodzież na rzecz Hospicjum Dobrego Samarytanina. Bieganie, sport i pomoc - dołącz do II edycji 2026 lub zostań wolontariuszem albo partnerem.",
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
    title: "Sun Run Lublin 2026 - Bieg Charytatywny | 5 km, Park Ludowy",
    description:
      "Charytatywny bieg w Lublinie na rzecz Hospicjum Dobrego Samarytanina. 5 km · Park Ludowy · bieg i Nordic Walking · 350+ uczestników w 2025. Dołącz do II edycji 2026!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sun Run Lublin 2026 - bieg charytatywny w Parku Ludowym",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sun Run Lublin 2026 - Bieg Charytatywny",
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
    "geo.position": "51.2359;22.5601",
    ICBM: "51.2359, 22.5601",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`h-full antialiased bg-[#F4D8A2] ${lemonMilk.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        {/* Dane strukturalne schema.org (Organization, WebSite, SportsEvent) */}
        <StructuredData />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4D8A2]" suppressHydrationWarning>
        {children}
        {/* GA4 ładuje się dopiero po zgodzie w banerze — patrz GoogleAnalytics.tsx */}
        <GoogleAnalytics />
        <ScrollDepthTracker />
        <OutboundLinkTracker />
        <CookieConsent />
      </body>
    </html>
  );
}
