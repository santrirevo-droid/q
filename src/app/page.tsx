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
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 bg-white px-4 py-10 dark:bg-neutral-900">
      <header className="relative text-center">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Mushaf Al-Qur&apos;an — 604 Halaman
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          Mengikuti pembagian halaman standar Mushaf Madinah (1441), susunan 20x30. Geser dan
          perbesar untuk menjelajah.
        </p>
      </header>

      {/* Satu poster 604 halaman dalam kanvas zoom/pan kontinu ala peta
          digital — resolusi gambar naik bertahap (tiny → thumb → full)
          seiring di-zoom masuk, lihat PosterZoomCanvas.tsx. */}
      <PosterZoomCanvas
        openingPages={openingPages}
        gridPages={gridPages}
        closingPages={closingPages}
        thumbManifest={thumbManifest}
        tinyManifest={tinyManifest}
        fullManifest={posterManifest}
      />
    </main>
  );
}
