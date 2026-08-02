// Extracts each of the 604 real Mushaf Madinah (1441H) pages directly from
// the official-layout PDF (https://pdf.quran.ws/pdfs/hafs/quran-hafs-mushaf.pdf)
// as WebP images, in two sizes:
//
//   public/poster/{n}.webp       full-res, for the single-page /page/[n] view
//   public/poster-thumb/{n}.webp small, for the 604-page grid on the homepage
//
// Why extract from a PDF instead of rendering text: earlier this project
// reconstructed pages from word-level glyph codes + line-number metadata
// (api.quran.com, mushaf=2). That data turned out to use different line
// breaks than the real 1441H print in a number of places (verified against
// this PDF page by page — e.g. a verse landing at the end of line 1 vs.
// spilling into line 2). Rendering directly from a PDF that already matches
// the 1441H layout sidesteps that whole reconstruction problem.
//
// Why two sizes: the official Quran.com Android app (quran/quran_android)
// also renders the Madani mushaf as images for the same accuracy reason —
// but it downloads one page image at a time, at a size matched to the
// screen. Loading 604 full-res images at once (what this project did
// before) is nothing like that — it's ~160MB up front. A small thumbnail
// tier for the grid (~604 tiny files) plus full-res loaded one page at a
// time for actual reading matches that same shape cheaply.
//
// Usage: node scripts/extract-pdf-pages.mjs [startPage] [endPage]
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp from "sharp";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const PDF_URL = "https://pdf.quran.ws/pdfs/hafs/quran-hafs-mushaf.pdf";
const PDF_CACHE = path.join(os.tmpdir(), "mushaf-madinah-source.pdf");
const OUT_DIR = path.join(process.cwd(), "public", "poster");
const THUMB_DIR = path.join(process.cwd(), "public", "poster-thumb");
const TOTAL_PAGES = 604;
// PDF page 1 is a cover page — every mushaf page N is PDF page N+1.
const PDF_PAGE_OFFSET = 1;
const SCALE = 1.8;
const WEBP_QUALITY = 80;
const THUMB_WIDTH = 480;
const THUMB_QUALITY = 68;

const startPage = Number(process.argv[2]) || 1;
const endPage = Number(process.argv[3]) || TOTAL_PAGES;

async function ensurePdf() {
  try {
    const s = await stat(PDF_CACHE);
    if (s.size > 100_000_000) {
      console.log(`Using cached PDF at ${PDF_CACHE}`);
      return;
    }
  } catch {
    // not cached yet
  }
  console.log(`Downloading ${PDF_URL} ...`);
  const res = await fetch(PDF_URL);
  if (!res.ok) throw new Error(`Failed to download PDF: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(PDF_CACHE, buf);
  console.log(`Saved PDF (${(buf.length / 1024 / 1024).toFixed(0)}MB) to ${PDF_CACHE}`);
}

async function run() {
  await ensurePdf();
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(THUMB_DIR, { recursive: true });

  const data = new Uint8Array(await readFile(PDF_CACHE));
  const doc = await pdfjsLib.getDocument({ data, disableFontFace: true }).promise;
  console.log(`PDF loaded: ${doc.numPages} pages total`);

  const total = endPage - startPage + 1;
  let done = 0;

  for (let n = startPage; n <= endPage; n++) {
    const pdfPageNum = n + PDF_PAGE_OFFSET;
    const page = await doc.getPage(pdfPageNum);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    const png = canvas.toBuffer("image/png");

    const full = sharp(png).webp({ quality: WEBP_QUALITY }).toBuffer();
    const thumb = sharp(png)
      .resize({ width: THUMB_WIDTH })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer();
    const [fullBuf, thumbBuf] = await Promise.all([full, thumb]);

    await Promise.all([
      writeFile(path.join(OUT_DIR, `${n}.webp`), fullBuf),
      writeFile(path.join(THUMB_DIR, `${n}.webp`), thumbBuf),
    ]);

    done++;
    if (done % 20 === 0 || done === total) {
      process.stdout.write(`\rExtracted ${done}/${total} (page ${n})...`);
    }
  }
  process.stdout.write("\n");
  console.log(`Done. Full images in ${OUT_DIR}, thumbnails in ${THUMB_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
