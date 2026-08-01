import Link from "next/link";
import { getAllPages } from "@/lib/quran";
import { getGlyphPage } from "@/lib/glyphPages";
import MushafThumbnail from "@/components/MushafThumbnail";
import MushafPageGlyph from "@/components/MushafPageGlyph";

const GRID_COLUMNS = 20;

export default function HomePage() {
  const pages = getAllPages();

  // Halaman pembuka: Al-Fatihah saja.
  const openingPages = pages.slice(0, 1);
  // Halaman penutup: awal Al-Baqarah "digeser" turun bersama 2 halaman
  // terakhir Juz 30 → 3 halaman penutup.
  const closingPages = pages.slice(-3);
  // Sisanya masuk grid utama: tepat 600 halaman = 20 kolom x 30 baris.
  const gridPages = pages.slice(1, -3);

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 bg-white px-4 py-10">
      <header className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Mushaf Al-Qur&apos;an — 604 Halaman
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Mengikuti pembagian halaman standar Mushaf Madinah, disusun dari kanan ke kiri.
          Klik halaman mana pun untuk membaca dalam ukuran penuh.
        </p>
      </header>

      {/* Halaman pembuka: Al-Fatihah */}
      <section aria-label="Halaman pembuka" className="mx-auto grid w-full max-w-md grid-cols-1 gap-4">
        {openingPages.map((page) => (
          <Link key={page.page} href={`/page/${page.page}`} title={`Halaman ${page.page}`}>
            <MushafPageGlyph data={getGlyphPage(page.page)} />
          </Link>
        ))}
      </section>

      {/* Grid 600 halaman (20 x 30), diisi dari kanan ke kiri */}
      <section aria-label="Grid halaman mushaf">
        <div
          dir="rtl"
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))` }}
        >
          {gridPages.map((page) => (
            <Link
              key={page.page}
              href={`/page/${page.page}`}
              className="block transition hover:opacity-80 hover:ring-2 hover:ring-teal-600"
              title={`Halaman ${page.page}`}
            >
              <MushafThumbnail data={page} />
            </Link>
          ))}
        </div>
      </section>

      {/* Halaman penutup: awal Al-Baqarah + 2 halaman terakhir Juz 30 (kanan ke kiri) */}
      <section
        dir="rtl"
        aria-label="Halaman penutup"
        className="mx-auto grid w-full max-w-4xl grid-cols-3 gap-4"
      >
        {closingPages.map((page) => (
          <Link key={page.page} href={`/page/${page.page}`} title={`Halaman ${page.page}`}>
            <MushafPageGlyph data={getGlyphPage(page.page)} />
          </Link>
        ))}
      </section>
    </main>
  );
}
