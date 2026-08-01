// Reads the dimensions of every generated poster image and writes a small
// manifest so the homepage can set exact <img width/height>, letting the
// browser reserve the right space before the image loads (no layout shift).
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const TOTAL_PAGES = 604;
const POSTER_DIR = path.join(process.cwd(), "public", "poster");
const OUT_FILE = path.join(process.cwd(), "src", "data", "poster-manifest.json");

async function run() {
  const manifest = {};
  for (let n = 1; n <= TOTAL_PAGES; n++) {
    const file = path.join(POSTER_DIR, `${n}.webp`);
    const meta = await sharp(file).metadata();
    manifest[n] = { width: meta.width, height: meta.height };
  }
  await writeFile(OUT_FILE, JSON.stringify(manifest), "utf-8");
  console.log(`Wrote manifest for ${TOTAL_PAGES} pages to ${OUT_FILE}`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
