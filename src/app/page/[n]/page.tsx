import Link from "next/link";
import { notFound } from "next/navigation";
import { getPage, TOTAL_PAGES } from "@/lib/quran";
import MushafPage from "@/components/MushafPage";

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
  const prev = pageNumber > 1 ? pageNumber - 1 : null;
  const next = pageNumber < TOTAL_PAGES ? pageNumber + 1 : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 px-4 py-8">
      <div className="flex w-full items-center justify-between text-sm">
        <Link href="/" className="text-amber-800 hover:underline">
          ← Semua halaman
        </Link>
        <span className="text-neutral-500">
          Halaman {pageNumber} / {TOTAL_PAGES}
        </span>
      </div>

      <MushafPage data={data} variant="full" />

      <div className="flex w-full items-center justify-between">
        {prev ? (
          <Link
            href={`/page/${prev}`}
            className="rounded border border-amber-800/40 px-4 py-2 text-sm hover:bg-amber-800/5"
          >
            ← Halaman {prev}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/page/${next}`}
            className="rounded border border-amber-800/40 px-4 py-2 text-sm hover:bg-amber-800/5"
          >
            Halaman {next} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
