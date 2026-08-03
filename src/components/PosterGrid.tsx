"use client";

import { useState } from "react";
import Link from "next/link";
import PosterZoomCanvas from "./PosterZoomCanvas";

type Manifest = Record<string, { width: number; height: number }>;

interface PosterGridProps {
  openingPages: number[];
  gridPages: number[];
  closingPages: number[];
  thumbManifest: Manifest;
  tinyManifest: Manifest;
  fullManifest: Manifest;
}

const GRID_COLUMNS = 20;
const THUMB_CELL_WIDTH = 220;

export default function PosterGrid({
  openingPages,
  gridPages,
  closingPages,
  thumbManifest,
  tinyManifest,
  fullManifest,
}: PosterGridProps) {
  // "lazy" = moderate thumbnails in a flat, in-page grid, scrolled/lazy-
  // loaded (best balance of legibility and bandwidth). Fixed pixel width,
  // panned via horizontal scroll + native pinch-zoom.
  // "zoom" = the whole 604-page poster in one continuous zoomable/pannable
  // canvas (like a map) — starts fully zoomed out, and swaps in
  // progressively higher-resolution tiles as you zoom in, so detail never
  // runs out.
  const [mode, setMode] = useState<"lazy" | "zoom">("zoom");

  const isZoom = mode === "zoom";

  function PosterImage({ n }: { n: number }) {
    const dims = thumbManifest[String(n)];
    return (
      <Link href={`/page/${n}`} className="block" title={`Halaman ${n}`}>
        <img
          src={`/poster-thumb/${n}.webp`}
          alt={`Halaman ${n}`}
          width={dims?.width}
          height={dims?.height}
          loading="lazy"
          decoding="async"
          className="w-full border border-gray-200 shadow-sm transition hover:opacity-80 hover:ring-2 hover:ring-teal-600 dark:border-neutral-700 dark:invert dark:brightness-90"
        />
      </Link>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("zoom")}
          className={`rounded-full border px-3 py-1 transition ${
            isZoom
              ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
              : "border-gray-300 text-gray-600 hover:border-teal-600 dark:border-neutral-700 dark:text-neutral-400"
          }`}
        >
          Muat semua sekaligus
        </button>
        <button
          type="button"
          onClick={() => setMode("lazy")}
          className={`rounded-full border px-3 py-1 transition ${
            !isZoom
              ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
              : "border-gray-300 text-gray-600 hover:border-teal-600 dark:border-neutral-700 dark:text-neutral-400"
          }`}
        >
          Muat bertahap
        </button>
      </div>

      {isZoom ? (
        <PosterZoomCanvas
          openingPages={openingPages}
          gridPages={gridPages}
          closingPages={closingPages}
          tinyManifest={tinyManifest}
          thumbManifest={thumbManifest}
          fullManifest={fullManifest}
        />
      ) : (
        <section aria-label="Semua halaman mushaf" dir="rtl" className="w-full overflow-x-auto">
          <div className="flex flex-col gap-1" style={{ width: THUMB_CELL_WIDTH * GRID_COLUMNS }}>
            <div
              dir="rtl"
              className="grid items-start gap-1"
              style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${THUMB_CELL_WIDTH}px)` }}
            >
              {openingPages.map((n) => (
                <PosterImage key={n} n={n} />
              ))}
            </div>

            <div
              dir="rtl"
              className="grid items-start gap-1"
              style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${THUMB_CELL_WIDTH}px)` }}
            >
              {gridPages.map((n) => (
                <PosterImage key={n} n={n} />
              ))}
            </div>

            <div
              dir="rtl"
              className="grid items-start gap-1"
              style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${THUMB_CELL_WIDTH}px)` }}
            >
              {closingPages.map((n) => (
                <PosterImage key={n} n={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
