"use client";

import { useEffect, useRef, useState } from "react";
import type { GlyphPageData } from "@/types/quran";

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
  const outerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const outer = outerRef.current;
    const measure = measureRef.current;
    if (!outer || !measure) return;
    const outerWidth = outer.clientWidth;
    const naturalWidth = measure.scrollWidth;
    if (naturalWidth > 0) {
      const ideal = MEASURE_SIZE * (outerWidth / naturalWidth);
      setFontSize(Math.min(ideal, maxFontSize));
    }
  }, [text, fontFamily, maxFontSize]);

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

export default function MushafPageGlyph({ data, maxFontSize = 36 }: MushafPageGlyphProps) {
  const fontFamily = `QCFP${data.page}`;
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
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
  }, [fontFamily, data.page]);

  return (
    <div className="flex w-full flex-col bg-white text-[#272727] dark:bg-neutral-900 dark:text-neutral-100">
      <div className="flex flex-col items-stretch gap-3" dir="rtl">
        {data.items.map((item, idx) => {
          if (item.type === "header") {
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 px-4 py-4 text-center dark:bg-neutral-800"
              >
                <div className="font-arabic text-2xl font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </div>
                <div dir="ltr" className="text-xs text-gray-500 dark:text-neutral-400">
                  {item.surahNumber}. {item.englishName}
                </div>
              </div>
            );
          }

          if (item.type === "basmalah") {
            return (
              <div key={idx} className="my-2 flex flex-col items-center gap-3 text-center">
                <div className="font-arabic pb-1 text-2xl leading-normal text-gray-800 dark:text-neutral-100">
                  {BASMALAH}
                </div>
                <div dir="ltr" className="text-xs text-gray-500 dark:text-neutral-400">
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

          return (
            <div
              key={idx}
              className="font-arabic text-[19px] leading-[2]"
              style={{ textAlign: "justify", direction: "rtl" }}
            >
              {item.words.map((w, wi) =>
                w.kind === "end" ? (
                  <span
                    key={wi}
                    className="mx-1 inline-flex h-[1.4em] w-[1.4em] items-center justify-center rounded-full border border-teal-600 align-middle text-[10px] text-teal-700 dark:border-neutral-400 dark:text-neutral-300"
                  >
                    {w.text}
                  </span>
                ) : (
                  <span key={wi}>{w.text} </span>
                )
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 text-center text-xs text-gray-400 dark:text-neutral-500">
        {data.page}
      </div>
    </div>
  );
}
