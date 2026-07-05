import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrunlublin.pl";
const GA_ID = "G-13PE0DJ8V6";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sun Run Lublin — Bieg Charytatywny 2026",
    template: "%s | Sun Run Lublin",
  },
  description:
    "Bieg charytatywny w 100% organizowany przez lubelską młodzież. Wspieramy Hospicjum Dobrego Samarytanina w Lublinie. Dołącz do II edycji Sun Run 2026!",
  keywords: [
    "bieg charytatywny Lublin",
    "Sun Run Lublin",
    "hospicjum bieg",
    "bieg 5km Lublin",
    "Park Ludowy bieg",
    "wolontariat Lublin",
  ],
  authors: [{ name: "Sun Run Lublin" }],
  creator: "Sun Run Lublin",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: SITE_URL,
    siteName: "Sun Run Lublin",
    title: "Sun Run Lublin — Bieg Charytatywny 2026",
    description:
      "II edycja biegu charytatywnego dla Hospicjum Dobrego Samarytanina w Lublinie. 5 km · Park Ludowy · 350+ uczestników w 2025.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sun Run Lublin 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sun Run Lublin — Bieg Charytatywny 2026",
    description: "II edycja biegu charytatywnego dla Hospicjum w Lublinie.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased bg-[#F5F1E8]" suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F5F1E8]" suppressHydrationWarning>{children}</body>
    </html>
  );
}
