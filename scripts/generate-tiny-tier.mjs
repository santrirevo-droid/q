// Generates a third, very small image tier from the existing thumbnail
// images (no PDF re-render needed) for the homepage's "load everything at
// once" overview mode — small enough that all 604 can load immediately
// with no lazy-loading, unlike the thumb tier which relies on scroll-based
// lazy loading to stay light.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const TOTAL_PAGES = 604;
const SRC_DIR = path.join(process.cwd(), "public", "poster-thumb");
const OUT_DIR = path.join(process.cwd(), "public", "poster-tiny");
const TINY_WIDTH = 160;
const TINY_QUALITY = 60;

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = {};

  for (let n = 1; n <= TOTAL_PAGES; n++) {
    const src = path.join(SRC_DIR, `${n}.webp`);
    const buf = await sharp(src).resize({ width: TINY_WIDTH }).webp({ quality: TINY_QUALITY }).toBuffer();
    await writeFile(path.join(OUT_DIR, `${n}.webp`), buf);
    const meta = await sharp(buf).metadata();
    manifest[n] = { width: meta.width, height: meta.height };

    if (n % 100 === 0 || n === TOTAL_PAGES) {
      process.stdout.write(`\rGenerated ${n}/${TOTAL_PAGES}...`);
    }
  }
  process.stdout.write("\n");

  await writeFile(
    path.join(process.cwd(), "src", "data", "poster-tiny-manifest.json"),
    JSON.stringify(manifest),
    "utf-8"
  );
  console.log(`Done. Images in ${OUT_DIR}, manifest written.`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
