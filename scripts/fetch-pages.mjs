// Fetches the entire Quran (Uthmani script, with per-ayah mushaf page numbers)
// from the AlQuran Cloud API in a single request, then splits it into 604
// per-page JSON files matching the standard Mushaf Madinah pagination.
//
// Usage: node scripts/fetch-pages.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const TOTAL_PAGES = 604;
const OUT_DIR = path.join(process.cwd(), "src", "data", "pages");
const SOURCE_URL = "https://api.alquran.cloud/v1/quran/quran-uthmani";

async function run() {
  console.log("Downloading full Quran text (quran-uthmani)...");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200 || !json.data) {
    throw new Error(`Unexpected response: ${JSON.stringify(json).slice(0, 200)}`);
  }

  const pages = new Map();
  for (let p = 1; p <= TOTAL_PAGES; p++) pages.set(p, []);

  for (const surah of json.data.surahs) {
    for (const ayah of surah.ayahs) {
      const entry = {
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        surah: {
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
        },
        juz: ayah.juz,
        sajda: Boolean(ayah.sajda) && ayah.sajda !== false,
      };
      const list = pages.get(ayah.page);
      if (!list) throw new Error(`Ayah ${ayah.number} has unexpected page ${ayah.page}`);
      list.push(entry);
    }
  }

  await mkdir(OUT_DIR, { recursive: true });

  let empty = 0;
  for (const [pageNumber, ayahs] of pages) {
    if (ayahs.length === 0) empty++;
    const filename = `${String(pageNumber).padStart(3, "0")}.json`;
    await writeFile(
      path.join(OUT_DIR, filename),
      JSON.stringify({ page: pageNumber, ayahs }),
      "utf-8"
    );
  }

  console.log(`Wrote ${TOTAL_PAGES} page files to ${OUT_DIR}`);
  if (empty > 0) {
    console.warn(`Warning: ${empty} page(s) had no ayahs.`);
    process.exitCode = 1;
  } else {
    console.log("All pages populated successfully.");
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
