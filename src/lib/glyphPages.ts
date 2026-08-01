import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { GlyphPageData } from "@/types/quran";

const GLYPH_PAGES_DIR = path.join(process.cwd(), "src", "data", "glyph-pages");

export function getGlyphPage(pageNumber: number): GlyphPageData {
  const file = path.join(GLYPH_PAGES_DIR, `${String(pageNumber).padStart(3, "0")}.json`);
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw) as GlyphPageData;
}
