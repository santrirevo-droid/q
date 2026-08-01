"use client";

import { useEffect, useRef, useState } from "react";
import type { GlyphPageData } from "@/types/quran";
import { toArabicNumber } from "@/lib/utils";

const BASMALAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const FONT_BASE = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2";

interface MushafPageGlyphProps {
  data: GlyphPageData;
  meta: { juz: number; surahName: string };
}

// Renders one physical mushaf line, scaled horizontally to fill the full
// line width — mimicking the kashida justification of the real print,
// since a single glyph-per-word run has no spaces to stretch/compress.
function JustifiedGlyphLine({ text, fontFamily }: { text: string; fontFamily: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const outerWidth = outer.clientWidth;
    const innerWidth = inner.scrollWidth;
    setScale(innerWidth > 0 ? outerWidth / innerWidth : 1);
  }, [text, fontFamily]);

  return (
    <div ref={outerRef} className="w-full overflow-hidden" dir="rtl">
      <span
        ref={innerRef}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          transform: `scaleX(${scale})`,
          transformOrigin: "right center",
          fontFamily: `"${fontFamily}"`,
        }}
        className="text-[28px]"
      >
        {text}
      </span>
    </div>
  );
}

export default function MushafPageGlyph({ data, meta }: MushafPageGlyphProps) {
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
    <div className="relative flex w-full flex-col border border-gray-200 bg-white p-[5%] text-[#272727] shadow-sm">
      <div className="font-arabic mb-2 flex items-center justify-between text-[11px] tracking-wide text-gray-400">
        <span>{meta.surahName}</span>
        <span>الجزء {toArabicNumber(meta.juz)}</span>
      </div>

      <div className="flex flex-col items-stretch gap-1" dir="rtl">
        {data.items.map((item, idx) => {
          if (item.type === "header") {
            return (
              <div
                key={idx}
                className="font-arabic my-1 rounded border border-gray-200 bg-gray-50 py-1 text-center text-[13px] font-semibold text-gray-800"
              >
                {item.name}
              </div>
            );
          }

          if (item.type === "basmalah") {
            return (
              <div key={idx} className="font-arabic mb-1 text-center text-[18px] text-gray-800">
                {BASMALAH}
              </div>
            );
          }

          if (fontReady) {
            return (
              <JustifiedGlyphLine
                key={idx}
                text={item.words.map((w) => w.code).join(" ")}
                fontFamily={fontFamily}
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
                    className="mx-1 inline-flex h-[1.4em] w-[1.4em] items-center justify-center rounded-full border border-teal-600 align-middle text-[10px] text-teal-700"
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

      <div className="font-arabic mt-2 text-center text-[12px] text-gray-400">
        {toArabicNumber(data.page)}
      </div>
    </div>
  );
}
