"use client";

import { useEffect, useRef, useState } from "react";
import type { GlyphPageData } from "@/types/quran";

const BASMALAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const BASMALAH_TRANSLATION = "Dengan menyebut nama Allah Yang Maha Pengasih, Maha Penyayang";
const FONT_BASE = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2";

interface MushafPageGlyphProps {
  data: GlyphPageData;
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

export default function MushafPageGlyph({ data }: MushafPageGlyphProps) {
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
    <div className="flex w-full flex-col bg-white text-[#272727]">
      <div className="flex flex-col items-stretch gap-3" dir="rtl">
        {data.items.map((item, idx) => {
          if (item.type === "header") {
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 px-4 py-4 text-center"
              >
                <div className="font-arabic text-2xl font-semibold text-gray-900">
                  {item.name}
                </div>
                <div dir="ltr" className="text-xs text-gray-500">
                  {item.surahNumber}. {item.englishName}
                </div>
              </div>
            );
          }

          if (item.type === "basmalah") {
            return (
              <div key={idx} className="my-2 flex flex-col items-center gap-3 text-center">
                <div className="font-arabic pb-1 text-2xl leading-normal text-gray-800">
                  {BASMALAH}
                </div>
                <div dir="ltr" className="text-xs text-gray-500">
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

      <div className="mt-4 border-t border-gray-200 pt-3 text-center text-xs text-gray-400">
        {data.page}
      </div>
    </div>
  );
}
