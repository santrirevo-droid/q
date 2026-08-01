import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { PageData } from "@/types/quran";

export const TOTAL_PAGES = 604;

const PAGES_DIR = path.join(process.cwd(), "src", "data", "pages");

function pageFilePath(pageNumber: number) {
  return path.join(PAGES_DIR, `${String(pageNumber).padStart(3, "0")}.json`);
}

export function getPage(pageNumber: number): PageData {
  if (pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    throw new Error(`Page ${pageNumber} out of range (1-${TOTAL_PAGES})`);
  }
  const raw = fs.readFileSync(pageFilePath(pageNumber), "utf-8");
  return JSON.parse(raw) as PageData;
}

let cachedAllPages: PageData[] | null = null;

export function getAllPages(): PageData[] {
  if (cachedAllPages) return cachedAllPages;
  const pages: PageData[] = [];
  for (let p = 1; p <= TOTAL_PAGES; p++) pages.push(getPage(p));
  cachedAllPages = pages;
  return pages;
}
