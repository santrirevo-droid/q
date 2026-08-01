import Link from "next/link";
import { getAllPages } from "@/lib/quran";
import MushafPage from "@/components/MushafPage";
import FrontMatterPage from "@/components/FrontMatterPage";

export default function HomePage() {
  const pages = getAllPages();

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-4 py-10">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Mushaf Al-Qur&apos;an — 604 Halaman</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Mengikuti pembagian halaman standar Mushaf Madinah. Klik halaman mana pun
          untuk membaca dalam ukuran penuh.
        </p>
      </header>

      {/* 2 halaman pembuka — terpisah dari 604 halaman utama */}
      <section aria-label="Halaman pembuka" className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-4">
        <FrontMatterPage
          eyebrow="Mushaf Al-Qur'an"
          title="القرآن الكريم"
          subtitle="Rasm Uthmani — Tata Letak Mushaf Madinah"
        />
        <FrontMatterPage
          eyebrow="Pengantar"
          arabic={false}
          title="Kata Pengantar"
          body={
            <p>
              Halaman ini disediakan sebagai ruang pengantar/kata sambutan.
              Silakan sunting sesuai kebutuhan.
            </p>
          }
        />
      </section>

      {/* Grid 604 halaman, 20 kolom */}
      <section aria-label="604 halaman mushaf">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}
        >
          {pages.map((page) => (
            <Link
              key={page.page}
              href={`/page/${page.page}`}
              className="block transition hover:opacity-80 hover:ring-2 hover:ring-amber-600"
              title={`Halaman ${page.page}`}
            >
              <MushafPage data={page} variant="thumbnail" />
            </Link>
          ))}
        </div>
      </section>

      {/* 2 halaman penutup — terpisah dari 604 halaman utama */}
      <section aria-label="Halaman penutup" className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-4">
        <FrontMatterPage
          eyebrow="Penutup"
          arabic={false}
          title="Doa Khatam Al-Qur'an"
          body={<p>Ruang untuk teks doa khatam Al-Qur&apos;an. Silakan sunting sesuai kebutuhan.</p>}
        />
        <FrontMatterPage
          eyebrow="Kolofon"
          arabic={false}
          title="Selesai"
          body={<p>604 halaman, mengikuti tata letak Mushaf Madinah.</p>}
        />
      </section>
    </main>
  );
}
