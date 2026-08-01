import { notFound } from "next/navigation";
import { TOTAL_PAGES } from "@/lib/quran";
import { getGlyphPage } from "@/lib/glyphPages";
import MushafPageGlyph from "@/components/MushafPageGlyph";

// Not a user-facing route — a bare, fixed-size, chrome-free wrapper used
// only by scripts/render-poster-images.mjs to screenshot each page into a
// static image for the homepage poster. No nav, no theme toggle, no
// dark-mode reliance (generation always runs with colorScheme: "light").

export function generateStaticParams() {
  return Array.from({ length: TOTAL_PAGES }, (_, i) => ({ n: String(i + 1) }));
}

interface PageProps {
  params: Promise<{ n: string }>;
}

export const PRINT_WIDTH = 900;
// Deliberately high — this route only exists to render a static image, so
// there's no "too large" text to guard against like in the live app. The
// cap should never actually bind; each line should size purely off how
// much it needs to fill PRINT_WIDTH.
export const PRINT_MAX_FONT_SIZE = 160;
// Unlike maxFontSize above, this one DOES bind in practice (banner strings
// are short) — set to roughly what a normal ayah line settles at, at this
// width, so the surah-name/Bismillah banners read as one line, not a title.
export const PRINT_BANNER_MAX_FONT_SIZE = 52;

export default async function PrintPage({ params }: PageProps) {
  const { n } = await params;
  const pageNumber = Number(n);

  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    notFound();
  }

  const glyphData = getGlyphPage(pageNumber);

  return (
    <div style={{ width: PRINT_WIDTH }} id="print-card">
      <MushafPageGlyph
        data={glyphData}
        maxFontSize={PRINT_MAX_FONT_SIZE}
        bannerMaxFontSize={PRINT_BANNER_MAX_FONT_SIZE}
      />
    </div>
  );
}
