import type { Metadata, Viewport } from "next";
import { Figtree, Amiri_Quran } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
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

// Explicitly allow pinch-zoom well past the default — this site is meant to
// be explored by zooming into the page grid, not just clicking through it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 10,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${figtree.variable} ${amiriQuran.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white dark:bg-neutral-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
