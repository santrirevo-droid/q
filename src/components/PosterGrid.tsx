"use client";

import { useState } from "react";
import Link from "next/link";

type Manifest = Record<string, { width: number; height: number }>;

interface PosterGridProps {
  openingPages: number[];
  gridPages: number[];
  closingPages: number[];
  thumbManifest: Manifest;
  tinyManifest: Manifest;
}

const GRID_COLUMNS = 20;
const THUMB_CELL_WIDTH = 220;
const TINY_CELL_WIDTH = 130;

export default function PosterGrid({
  openingPages,
  gridPages,
  closingPages,
  thumbManifest,
  tinyManifest,
}: PosterGridProps) {
  // "lazy" = moderate thumbnails, scrolled/lazy-loaded (default — best
  // balance of legibility and bandwidth).
  // "all" = every one of the 604 pages loaded immediately, at a size small
  // enough (~7MB total) that doing so is still cheap.
  const [mode, setMode] = useState<"lazy" | "all">("lazy");

  const isAll = mode === "all";
  const folder = isAll ? "poster-tiny" : "poster-thumb";
  const manifest = isAll ? tinyManifest : thumbManifest;
  const cellWidth = isAll ? TINY_CELL_WIDTH : THUMB_CELL_WIDTH;
  const gridStyle = {
    width: cellWidth * GRID_COLUMNS,
    gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${cellWidth}px)`,
  };

  function PosterImage({ n }: { n: number }) {
    const dims = manifest[String(n)];
    return (
      <Link href={`/page/${n}`} className="block" title={`Halaman ${n}`}>
        <img
          src={`/${folder}/${n}.webp`}
          alt={`Halaman ${n}`}
          width={dims?.width}
          height={dims?.height}
          loading={isAll ? "eager" : "lazy"}
          decoding="async"
          className="w-full border border-gray-200 shadow-sm transition hover:opacity-80 hover:ring-2 hover:ring-teal-600 dark:border-neutral-700"
        />
      </Link>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("lazy")}
          className={`rounded-full border px-3 py-1 transition ${
            !isAll
              ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
              : "border-gray-300 text-gray-600 hover:border-teal-600 dark:border-neutral-700 dark:text-neutral-400"
          }`}
        >
          Muat bertahap
        </button>
        <button
          type="button"
          onClick={() => setMode("all")}
          className={`rounded-full border px-3 py-1 transition ${
            isAll
              ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
              : "border-gray-300 text-gray-600 hover:border-teal-600 dark:border-neutral-700 dark:text-neutral-400"
          }`}
        >
          Muat semua sekaligus
        </button>
      </div>

      <section aria-label="Semua halaman mushaf" dir="rtl" className="w-full overflow-x-auto">
        <div className="flex flex-col gap-1" style={{ width: gridStyle.width }}>
          <div dir="rtl" className="grid items-start gap-1" style={gridStyle}>
            {openingPages.map((n) => (
              <PosterImage key={n} n={n} />
            ))}
          </div>

          <div dir="rtl" className="grid items-start gap-1" style={gridStyle}>
            {gridPages.map((n) => (
              <PosterImage key={n} n={n} />
            ))}
          </div>

          <div dir="rtl" className="grid items-start gap-1" style={gridStyle}>
            {closingPages.map((n) => (
              <PosterImage key={n} n={n} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
