// Renders each of the 604 mushaf pages to a static, high-resolution WebP
// image, using the real per-page QCF v2 glyph font (via the /print/[n]
// route). These images back the homepage poster — a plain image grid is
// dramatically cheaper to pan/zoom than 604 live React components each
// doing their own font loading/measuring, and (being pre-rendered) never
// visibly "changes" while scrolling like the live version did.
//
// Requires a running production server at BASE_URL (npm run build && npm run start).
// Usage: node scripts/render-poster-images.mjs [startPage] [endPage]
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public", "poster");
const TOTAL_PAGES = 604;
// Cell display width in the grid is 220px — at 1.4x scale factor a 900px
// print card renders ~1260px wide, ~5.7x the display size, plenty of
// zoom headroom without pixelating, while keeping the 604-image total
// size reasonable (full 2x was pushing ~190MB).
const DEVICE_SCALE_FACTOR = 1.4;
const WEBP_QUALITY = 75;

const startPage = Number(process.argv[2]) || 1;
const endPage = Number(process.argv[3]) || TOTAL_PAGES;

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1000, height: 1400 },
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    colorScheme: "light",
  });
  const page = await context.newPage();

  let done = 0;
  const total = endPage - startPage + 1;

  for (let n = startPage; n <= endPage; n++) {
    await page.goto(`${BASE_URL}/print/${n}`, { waitUntil: "load" });
    // document.fonts.ready doesn't reliably track a FontFace that was
    // constructed and added manually in JS (as MushafPageGlyph does) rather
    // than referenced from CSS — wait for the component's own explicit
    // "font applied" signal instead, or a page silently stays in its
    // (differently laid out) Unicode-fallback rendering.
    await page.waitForSelector('#print-card [data-font-ready="true"]', { timeout: 15000 });
    // One extra frame so the ResizeObserver-driven font-size settles after
    // the glyph font swaps in.
    await page.waitForTimeout(150);

    const card = page.locator("#print-card");
    const pngBuffer = await card.screenshot({ type: "png" });

    const webpBuffer = await sharp(pngBuffer).webp({ quality: WEBP_QUALITY }).toBuffer();
    await writeFile(path.join(OUT_DIR, `${n}.webp`), webpBuffer);

    done++;
    if (done % 20 === 0 || done === total) {
      process.stdout.write(`\rRendered ${done}/${total} (page ${n})...`);
    }
  }
  process.stdout.write("\n");

  await browser.close();
  console.log(`Done. Images written to ${OUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
