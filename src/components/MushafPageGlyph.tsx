"use client";

import { useEffect, useRef, useState } from "react";
import type { GlyphPageData, GlyphWord } from "@/types/quran";

const BASMALAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const BASMALAH_TRANSLATION = "Dengan menyebut nama Allah Yang Maha Pengasih, Maha Penyayang";
const FONT_BASE = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2";

// Used only to measure each line's natural glyph width precisely; the real
// rendered size is computed from it, so the exact value doesn't matter.
const MEASURE_SIZE = 200;

interface MushafPageGlyphProps {
  data: GlyphPageData;
  /** Largest a full-width line is allowed to render at. Short/narrow
   * containers (e.g. thumbnail-ish cards) naturally size down from this. */
  maxFontSize?: number;
  /** Cap for the surah-name/Bismillah banners specifically. Defaults to a
   * fraction of maxFontSize so a short banner string doesn't dwarf the
   * (much longer, so much smaller) ayah lines — pass explicitly when
   * maxFontSize itself is set artificially high (e.g. the print route,
   * where it's just "don't ever clip", not a real target line size). */
  bannerMaxFontSize?: number;
  /** Only fetch this page's font once it scrolls near the viewport, instead
   * of immediately on mount. Needed when many instances render at once
   * (the 604-page grid) — eagerly loading hundreds of font files at once
   * would be very heavy. */
  lazy?: boolean;
}

// Shrinks (never distorts) text to exactly fill its container's width, by
// measuring the text's natural width at a large reference size and scaling
// from that. Uses a ResizeObserver rather than a one-shot effect: with
// hundreds of these mounting at once (the page grid), a plain effect can
// read a container's width before the browser has finished settling layout
// for that batch, silently locking in a wrong (usually too-large) size.
// ResizeObserver keeps re-measuring until the box is stable, so it
// self-corrects instead of freezing on a bad first read.
function useFitFontSize(text: string, maxFontSize: number) {
  const outerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const outer = outerRef.current;
    const measure = measureRef.current;
    if (!outer || !measure) return;

    const recompute = () => {
      const outerWidth = outer.clientWidth;
      const naturalWidth = measure.scrollWidth;
      if (outerWidth > 0 && naturalWidth > 0) {
        const ideal = MEASURE_SIZE * (outerWidth / naturalWidth);
        setFontSize(Math.min(ideal, maxFontSize));
      }
    };

    recompute();
    if (typeof ResizeObserver === "undefined") return;
    // Must watch BOTH: outer rarely resizes (it's usually a fixed-width
    // column), but that's exactly the problem — the hidden measure span is
    // what actually changes size as the browser finishes laying it out
    // (e.g. once the real glyph font finishes applying), and a first read
    // before that settles reports scrollWidth 0, which would otherwise
    // permanently lock fontSize at the maxFontSize fallback.
    const observer = new ResizeObserver(recompute);
    observer.observe(outer);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [text, maxFontSize]);

  return { outerRef, measureRef, fontSize };
}

// Renders one physical mushaf line, sized (not stretched) so its natural
// width exactly fills the line — real kashida-style justification with no
// per-word gaps to expand, but without the letterform distortion a
// horizontal scaleX() trick would introduce.
function JustifiedGlyphLine({
  text,
  fontFamily,
  maxFontSize,
}: {
  text: string;
  fontFamily: string;
  maxFontSize: number;
}) {
  const { outerRef, measureRef, fontSize } = useFitFontSize(text, maxFontSize);

  return (
    <div ref={outerRef} className="relative w-full" dir="rtl">
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          fontFamily: `"${fontFamily}"`,
          fontSize: MEASURE_SIZE,
        }}
      >
        {text}
      </span>
      <div style={{ fontFamily: `"${fontFamily}"`, fontSize, whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
}

// Same shrink-to-fit idea as JustifiedGlyphLine, but for plain Unicode text
// (surah names, Bismillah) rendered in the regular Arabic font — these used
// a fixed text size before, which overflowed badly in narrow grid cells.
function AutoFitText({
  text,
  maxFontSize,
  className,
}: {
  text: string;
  maxFontSize: number;
  className?: string;
}) {
  const { outerRef, measureRef, fontSize } = useFitFontSize(text, maxFontSize);

  return (
    <div ref={outerRef} className="relative w-full">
      <span
        ref={measureRef}
        aria-hidden
        className="font-arabic"
        style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontSize: MEASURE_SIZE }}
      >
        {text}
      </span>
      <div className={className} style={{ fontSize, whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
}

function FallbackWords({ words }: { words: GlyphWord[] }) {
  return (
    <>
      {words.map((w, i) =>
        w.kind === "end" ? (
          <span
            key={i}
            className="mx-1 inline-flex h-[1.4em] w-[1.4em] items-center justify-center rounded-full border border-teal-600 align-middle text-[0.5em] text-teal-700 dark:border-neutral-400 dark:text-neutral-300"
          >
            {w.text}
          </span>
        ) : (
          <span key={i}>{w.text} </span>
        )
      )}
    </>
  );
}

// Same shrink-to-fit approach, used before the real per-page glyph font has
// loaded (or for pages still waiting in the lazy-load queue). Without this,
// the fallback Unicode text would wrap unpredictably at a fixed size,
// making some grid cells much taller than their neighbours while waiting.
function FitFallbackLine({ words, maxFontSize }: { words: GlyphWord[]; maxFontSize: number }) {
  const key = words.map((w) => w.text).join(" ");
  const { outerRef, measureRef, fontSize } = useFitFontSize(key, maxFontSize);

  return (
    <div ref={outerRef} className="font-arabic relative w-full" dir="rtl">
      <span
        ref={measureRef}
        aria-hidden
        style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontSize: MEASURE_SIZE }}
      >
        <FallbackWords words={words} />
      </span>
      <div style={{ fontSize, whiteSpace: "nowrap" }}>
        <FallbackWords words={words} />
      </div>
    </div>
  );
}

export default function MushafPageGlyph({
  data,
  maxFontSize = 36,
  bannerMaxFontSize,
  lazy = false,
}: MushafPageGlyphProps) {
  const fontFamily = `QCFP${data.page}`;
  const [fontReady, setFontReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const rootRef = useRef<HTMLDivElement>(null);

  // Lazy mode: only start fetching the font once this card scrolls near
  // the viewport (large rootMargin so it's ready before the user arrives).
  useEffect(() => {
    if (!lazy || shouldLoad) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    setFontReady(false);

    if (typeof FontFace === "undefined") return;
    const face = new FontFace(fontFamily, `url(${FONT_BASE}/p${data.page}.woff2)`);
    face
      .load()
      .then((loaded) => {
        if (cancelled) return;
        document.fonts.add(loaded);
        setFontReady(true);
      })
      .catch(() => {
        // Network/CDN unavailable — silently keep the Unicode fallback.
      });

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, fontFamily, data.page]);

  // The header/basmalah banners should read as roughly one text line, not a
  // giant title — cap them well below maxFontSize so a short string (which
  // would otherwise auto-fit almost to the full cell width) doesn't dwarf
  // the actual ayah lines and blow the page's height out of proportion.
  const bannerFontSize = bannerMaxFontSize ?? Math.max(12, Math.round(maxFontSize * 0.6));
  // Derived from bannerFontSize (not maxFontSize directly): when maxFontSize
  // is set artificially high (the print route uses it as "never clip", not
  // a real target size), scaling straight off it would blow this caption up
  // too and overflow the card.
  const captionSize = Math.max(9, Math.round(bannerFontSize * 0.35));

  return (
    <div
      ref={rootRef}
      data-font-ready={fontReady}
      className="flex w-full flex-col bg-white text-[#272727] dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div
        className="flex flex-col items-stretch"
        dir="rtl"
        style={{ gap: Math.max(2, Math.round(maxFontSize * 0.15)) }}
      >
        {data.items.map((item, idx) => {
          if (item.type === "header") {
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 px-2 py-2 text-center dark:bg-neutral-800"
              >
                <AutoFitText
                  text={item.name}
                  maxFontSize={bannerFontSize}
                  className="font-arabic font-semibold text-gray-900 dark:text-white"
                />
                <div
                  dir="ltr"
                  className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 dark:text-neutral-400"
                  style={{ fontSize: captionSize }}
                >
                  {item.surahNumber}. {item.englishName}
                </div>
              </div>
            );
          }

          if (item.type === "basmalah") {
            return (
              <div key={idx} className="flex flex-col items-center gap-1 text-center">
                <AutoFitText
                  text={BASMALAH}
                  maxFontSize={bannerFontSize}
                  className="font-arabic text-gray-800 dark:text-neutral-100"
                />
                <div
                  dir="ltr"
                  className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 dark:text-neutral-400"
                  style={{ fontSize: captionSize }}
                >
                  {BASMALAH_TRANSLATION}
                </div>
              </div>
            );
          }

          if (fontReady) {
            return (
              <JustifiedGlyphLine
                key={idx}
                text={item.words.map((w) => w.code).join(" ")}
                fontFamily={fontFamily}
                maxFontSize={maxFontSize}
              />
            );
          }

          return <FitFallbackLine key={idx} words={item.words} maxFontSize={maxFontSize} />;
        })}
      </div>

      <div className="mt-4 pt-3 text-center text-xs text-gray-400 dark:text-neutral-500">
        {data.page}
      </div>
    </div>
  );
}
