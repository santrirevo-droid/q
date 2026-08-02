// Reads the dimensions of every generated poster image (both the full-res
// and thumbnail tiers) and writes small manifests so pages can set exact
// <img width/height>, letting the browser reserve the right space before
// the image loads (no layout shift).
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const TOTAL_PAGES = 604;

async function buildManifest(dir, outFile) {
  const manifest = {};
  for (let n = 1; n <= TOTAL_PAGES; n++) {
    const file = path.join(dir, `${n}.webp`);
    const meta = await sharp(file).metadata();
    manifest[n] = { width: meta.width, height: meta.height };
  }
  await writeFile(outFile, JSON.stringify(manifest), "utf-8");
  console.log(`Wrote manifest for ${TOTAL_PAGES} pages to ${outFile}`);
}

async function run() {
  await buildManifest(
    path.join(process.cwd(), "public", "poster"),
    path.join(process.cwd(), "src", "data", "poster-manifest.json")
  );
  await buildManifest(
    path.join(process.cwd(), "public", "poster-thumb"),
    path.join(process.cwd(), "src", "data", "poster-thumb-manifest.json")
  );
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
