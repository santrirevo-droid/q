import Link from "next/link";
import { notFound } from "next/navigation";
import { getPage, TOTAL_PAGES } from "@/lib/quran";
import { getGlyphPage } from "@/lib/glyphPages";
import MushafPageGlyph from "@/components/MushafPageGlyph";

export function generateStaticParams() {
  return Array.from({ length: TOTAL_PAGES }, (_, i) => ({ n: String(i + 1) }));
}

interface PageProps {
  params: Promise<{ n: string }>;
}

export default async function SinglePage({ params }: PageProps) {
  const { n } = await params;
  const pageNumber = Number(n);

  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    notFound();
  }

  const data = getPage(pageNumber);
  const glyphData = getGlyphPage(pageNumber);
  const surahName = data.ayahs[0]?.surah.name ?? "";
  const juz = data.ayahs[0]?.juz ?? 1;
  const prev = pageNumber > 1 ? pageNumber - 1 : null;
  const next = pageNumber < TOTAL_PAGES ? pageNumber + 1 : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 bg-neutral-900 px-4 py-8">
      <div className="flex w-full items-center justify-between text-sm">
        <Link href="/" className="text-teal-400 hover:underline">
          ← Semua halaman
        </Link>
        <span className="font-arabic text-neutral-400">{surahName}</span>
        <span className="text-neutral-400">
          Halaman {pageNumber} · Juz {juz}
        </span>
      </div>

      <MushafPageGlyph data={glyphData} />

      {/* Navigasi kanan ke kiri: halaman sebelumnya di kanan, berikutnya di kiri */}
      <div dir="rtl" className="flex w-full items-center justify-between">
        {prev ? (
          <Link
            href={`/page/${prev}`}
            dir="ltr"
            className="flex items-center gap-1 rounded-full border border-neutral-700 px-4 py-1.5 text-sm text-neutral-300 hover:border-teal-500 hover:text-teal-400"
          >
            Halaman sebelumnya <span aria-hidden>›</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/page/${next}`}
            dir="ltr"
            className="flex items-center gap-1 rounded-full border border-neutral-700 px-4 py-1.5 text-sm text-neutral-300 hover:border-teal-500 hover:text-teal-400"
          >
            <span aria-hidden>‹</span> Halaman berikutnya
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
