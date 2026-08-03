import { TOTAL_PAGES } from "@/lib/quran";
import ThemeToggle from "@/components/ThemeToggle";
import PosterZoomCanvas from "@/components/PosterZoomCanvas";
import thumbManifest from "@/data/poster-thumb-manifest.json";
import tinyManifest from "@/data/poster-tiny-manifest.json";
import posterManifest from "@/data/poster-manifest.json";

export default function HomePage() {
  const pageNumbers = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

  // Baris atas: Al-Fatihah saja.
  const openingPages = pageNumbers.slice(0, 1);
  // Baris bawah: awal Al-Baqarah "digeser" turun bersama 2 halaman
  // terakhir Juz 30 → 3 halaman.
  const closingPages = pageNumbers.slice(-3);
  // Baris tengah: tepat 600 halaman = 20 kolom x 30 baris.
  const gridPages = pageNumbers.slice(1, -3);

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-white dark:bg-neutral-900">
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-3 py-1.5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            Mushaf Al-Qur&apos;an — 604 Halaman
          </h1>
          <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
            Mushaf Madinah (1441), susunan 20x30 — geser dan perbesar untuk menjelajah.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Satu poster 604 halaman dalam kanvas zoom/pan kontinu ala peta
          digital, memenuhi sisa layar — resolusi gambar naik bertahap
          (tiny → thumb → full) seiring di-zoom masuk, lihat
          PosterZoomCanvas.tsx. */}
      <div className="min-h-0 flex-1">
        <PosterZoomCanvas
          openingPages={openingPages}
          gridPages={gridPages}
          closingPages={closingPages}
          thumbManifest={thumbManifest}
          tinyManifest={tinyManifest}
          fullManifest={posterManifest}
        />
      </div>
    </main>
  );
}
