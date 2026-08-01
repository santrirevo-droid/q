import Link from "next/link";
import { getAllPages } from "@/lib/quran";
import MushafPage from "@/components/MushafPage";

const GRID_COLUMNS = 20;

export default function HomePage() {
  const pages = getAllPages();

  // Halaman pembuka: Al-Fatihah (1) + awal Al-Baqarah (2).
  const openingPages = pages.slice(0, 2);
  // Halaman penutup: 2 halaman terakhir Juz 30.
  const closingPages = pages.slice(-2);
  // Sisanya masuk grid utama: tepat 600 halaman = 20 kolom x 30 baris.
  const gridPages = pages.slice(2, -2);

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

      {/* Halaman pembuka: Al-Fatihah & awal Al-Baqarah (kanan ke kiri) */}
      <section
        dir="rtl"
        aria-label="Halaman pembuka"
        className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-4"
      >
        {openingPages.map((page) => (
          <Link key={page.page} href={`/page/${page.page}`} title={`Halaman ${page.page}`}>
            <MushafPage data={page} variant="full" />
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
              <MushafPage data={page} variant="thumbnail" />
            </Link>
          ))}
        </div>
      </section>

      {/* Halaman penutup: 2 halaman terakhir Juz 30 (kanan ke kiri) */}
      <section
        dir="rtl"
        aria-label="Halaman penutup"
        className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-4"
      >
        {closingPages.map((page) => (
          <Link key={page.page} href={`/page/${page.page}`} title={`Halaman ${page.page}`}>
            <MushafPage data={page} variant="full" />
          </Link>
        ))}
      </section>
    </main>
  );
}
