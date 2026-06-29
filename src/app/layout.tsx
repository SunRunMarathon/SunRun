import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sun Run 2026",
  description: "Bieg Charytatywny dla Hospicjum Dobrego Samarytanina w Lublinie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
