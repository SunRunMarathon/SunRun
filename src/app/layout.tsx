import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SunRun",
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
      className="h-full antialiased bg-black"
    >
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}
