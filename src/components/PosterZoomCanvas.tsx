"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
  Virtualize,
  useControls,
  useTransformEffect,
} from "react-zoom-pan-pinch";

type Manifest = Record<string, { width: number; height: number }>;

interface PosterZoomCanvasProps {
  openingPages: number[];
  gridPages: number[];
  closingPages: number[];
  tinyManifest: Manifest;
  thumbManifest: Manifest;
  fullManifest: Manifest;
}

const GRID_COLUMNS = 20;
// Every one of the 604 extracted pages shares this exact pixel ratio (see
// poster-manifest.json) — safe to hardcode instead of reading per-cell.
const ASPECT = 1620 / 2482;
const CELL_W = 220;
const CELL_H = CELL_W / ASPECT;
const GAP = 8;
const STEP_X = CELL_W + GAP;
const STEP_Y = CELL_H + GAP;

// On-screen cell width (css px, i.e. CELL_W * current scale) at which to
// switch which image tier is requested — mirrors quran_android's
// per-screen-size on-demand image loading, just continuous instead of
// per-page-view.
const TINY_MAX_PX = 110;
const THUMB_MAX_PX = 520;
type Tier = "tiny" | "thumb" | "full";
const TIER_FOLDER: Record<Tier, string> = {
  tiny: "poster-tiny",
  thumb: "poster-thumb",
  full: "poster",
};
function tierFor(onScreenWidth: number): Tier {
  if (onScreenWidth <= TINY_MAX_PX) return "tiny";
  if (onScreenWidth <= THUMB_MAX_PX) return "thumb";
  return "full";
}

interface Cell {
  n: number;
  x: number;
  y: number;
}

function PosterCellImage({ n, tier, manifest }: { n: number; tier: Tier; manifest: Manifest }) {
  const dims = manifest[String(n)];
  return (
    <img
      src={`/${TIER_FOLDER[tier]}/${n}.webp`}
      alt={`Halaman ${n}`}
      width={dims?.width}
      height={dims?.height}
      decoding="async"
      draggable={false}
      className="h-full w-full select-none border border-gray-200 shadow-sm dark:border-neutral-700 dark:invert dark:brightness-90"
    />
  );
}

function PosterCanvasContent({
  cells,
  worldWidth,
  worldHeight,
  tinyManifest,
  thumbManifest,
  fullManifest,
}: {
  cells: Cell[];
  worldWidth: number;
  worldHeight: number;
  tinyManifest: Manifest;
  thumbManifest: Manifest;
  fullManifest: Manifest;
}) {
  const [tier, setTier] = useState<Tier>("tiny");

  useTransformEffect(({ state }) => {
    const next = tierFor(CELL_W * state.scale);
    setTier((prev) => (prev === next ? prev : next));
  });

  const manifest = tier === "tiny" ? tinyManifest : tier === "thumb" ? thumbManifest : fullManifest;

  return (
    <div style={{ width: worldWidth, height: worldHeight, position: "relative" }}>
      {cells.map(({ n, x, y }) => (
        <Virtualize
          key={n}
          x={x}
          y={y}
          width={CELL_W}
          height={CELL_H}
          margin={400}
          style={{ position: "absolute", left: x, top: y, width: CELL_W, height: CELL_H }}
        >
          <PosterCellImage n={n} tier={tier} manifest={manifest} />
        </Virtualize>
      ))}
    </div>
  );
}

function ZoomControls() {
  const { zoomIn, zoomOut, centerView, instance } = useControls();
  return (
    <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-1">
      <button
        type="button"
        aria-label="Perbesar"
        onClick={() => zoomIn(0.6)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-lg text-gray-700 shadow-sm hover:border-teal-600 hover:text-teal-700 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:border-teal-500 dark:hover:text-teal-400"
      >
        +
      </button>
      <button
        type="button"
        aria-label="Perkecil"
        onClick={() => zoomOut(0.6)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-lg text-gray-700 shadow-sm hover:border-teal-600 hover:text-teal-700 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:border-teal-500 dark:hover:text-teal-400"
      >
        −
      </button>
      <button
        type="button"
        aria-label="Tampilkan semua"
        onClick={() => centerView(instance.props.minScale, 300)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-xs text-gray-700 shadow-sm hover:border-teal-600 hover:text-teal-700 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:border-teal-500 dark:hover:text-teal-400"
      >
        ⤢
      </button>
    </div>
  );
}

export default function PosterZoomCanvas({
  openingPages,
  gridPages,
  closingPages,
  tinyManifest,
  thumbManifest,
  fullManifest,
}: PosterZoomCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const closingRow = 1 + Math.ceil(gridPages.length / GRID_COLUMNS);
  const totalRows = closingRow + 1;
  const worldWidth = GRID_COLUMNS * STEP_X - GAP;
  const worldHeight = totalRows * STEP_Y - GAP;

  const cells = useMemo<Cell[]>(() => {
    const list: Cell[] = [];
    openingPages.forEach((n, i) => {
      list.push({ n, x: (GRID_COLUMNS - 1 - i) * STEP_X, y: 0 });
    });
    gridPages.forEach((n, idx) => {
      const row = 1 + Math.floor(idx / GRID_COLUMNS);
      const colFromRight = idx % GRID_COLUMNS;
      list.push({ n, x: (GRID_COLUMNS - 1 - colFromRight) * STEP_X, y: row * STEP_Y });
    });
    closingPages.forEach((n, i) => {
      list.push({ n, x: (GRID_COLUMNS - 1 - i) * STEP_X, y: closingRow * STEP_Y });
    });
    return list;
  }, [openingPages, gridPages, closingPages, closingRow]);

  const fitScale = size ? Math.min(size.width / worldWidth, size.height / worldHeight) : 0.1;

  return (
    <div
      ref={wrapperRef}
      className="relative h-[80vh] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950"
    >
      {size && (
        <TransformWrapper
          key={`${size.width}x${size.height}`}
          initialScale={fitScale}
          minScale={fitScale}
          maxScale={8}
          initialPositionX={0}
          initialPositionY={0}
          centerOnInit
          limitToBounds
          doubleClick={{ step: 1.4 }}
          wheel={{ step: 0.3 }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: worldWidth, height: worldHeight }}
          >
            <PosterCanvasContent
              cells={cells}
              worldWidth={worldWidth}
              worldHeight={worldHeight}
              tinyManifest={tinyManifest}
              thumbManifest={thumbManifest}
              fullManifest={fullManifest}
            />
          </TransformComponent>
          <ZoomControls />
        </TransformWrapper>
      )}
    </div>
  );
}
