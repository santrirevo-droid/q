import type { Metadata } from "next";
import { Figtree, Amiri_Quran } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  weight: "400",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Mushaf Al-Qur'an — 604 Halaman",
  description:
    "Mushaf Al-Qur'an digital, 604 halaman mengikuti pembagian standar Mushaf Madinah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${figtree.variable} ${amiriQuran.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
