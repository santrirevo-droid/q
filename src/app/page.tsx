import Link from "next/link";
import { TOTAL_PAGES } from "@/lib/quran";
import { getGlyphPage } from "@/lib/glyphPages";
import MushafPageGlyph from "@/components/MushafPageGlyph";
import ThemeToggle from "@/components/ThemeToggle";

const GRID_COLUMNS = 20;
// Fixed pixel size — the grid is a large, panned-and-zoomed "poster", not a
// responsive layout that reflows (and squashes its text unreadable) to fit
// narrow mobile viewports.
const CELL_WIDTH = 220;
const CELL_MAX_FONT_SIZE = 26;

export default function HomePage() {
  const pageNumbers = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

  // Baris atas: Al-Fatihah saja.
  const openingPages = pageNumbers.slice(0, 1);
  // Baris bawah: awal Al-Baqarah "digeser" turun bersama 2 halaman
  // terakhir Juz 30 → 3 halaman.
  const closingPages = pageNumbers.slice(-3);
  // Baris tengah: tepat 600 halaman = 20 kolom x 30 baris.
  const gridPages = pageNumbers.slice(1, -3);

  const gridStyle = {
    width: CELL_WIDTH * GRID_COLUMNS,
    gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${CELL_WIDTH}px)`,
  };

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
          Mengikuti pembagian halaman standar Mushaf Madinah, disusun dari kanan ke kiri.
          Geser dan perbesar (pinch-zoom) untuk membaca — atau klik halaman untuk tampilan penuh.
        </p>
      </header>

      {/* Satu poster 604 halaman berukuran piksel tetap: baris pertama
          Al-Fatihah, 600 halaman utama, baris terakhir 3 halaman penutup.
          Di-pan lewat scroll horizontal dan dibaca lewat pinch-zoom bawaan
          browser — bukan layout responsif yang menyusut di layar sempit.
          Setiap sel memakai glyph font asli per-halaman (sama seperti
          tampilan baca penuh), dimuat lazy saat sel mendekati layar supaya
          tidak memuat 604 font sekaligus. */}
      <section aria-label="Semua halaman mushaf" dir="rtl" className="w-full overflow-x-auto">
        <div className="flex flex-col gap-1" style={{ width: gridStyle.width }}>
          <div dir="rtl" className="grid items-start gap-1" style={gridStyle}>
            {openingPages.map((n) => (
              <Link
                key={n}
                href={`/page/${n}`}
                className="block transition hover:opacity-80 hover:ring-2 hover:ring-teal-600"
                title={`Halaman ${n}`}
              >
                <MushafPageGlyph data={getGlyphPage(n)} maxFontSize={CELL_MAX_FONT_SIZE} lazy />
              </Link>
            ))}
          </div>

          <div dir="rtl" className="grid items-start gap-1" style={gridStyle}>
            {gridPages.map((n) => (
              <Link
                key={n}
                href={`/page/${n}`}
                className="block transition hover:opacity-80 hover:ring-2 hover:ring-teal-600"
                title={`Halaman ${n}`}
              >
                <MushafPageGlyph data={getGlyphPage(n)} maxFontSize={CELL_MAX_FONT_SIZE} lazy />
              </Link>
            ))}
          </div>

          <div dir="rtl" className="grid items-start gap-1" style={gridStyle}>
            {closingPages.map((n) => (
              <Link
                key={n}
                href={`/page/${n}`}
                className="block transition hover:opacity-80 hover:ring-2 hover:ring-teal-600"
                title={`Halaman ${n}`}
              >
                <MushafPageGlyph data={getGlyphPage(n)} maxFontSize={CELL_MAX_FONT_SIZE} lazy />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
