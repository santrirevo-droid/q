// Fetches word-level QCF v2 glyph codes + exact mushaf line numbers from the
// public Quran.com API (api.quran.com/api/v4), and builds 604 per-page JSON
// files describing, line by line, exactly what the real Mushaf Madinah page
// looks like (same data source quran.com's own "Reading > Arabic" mode uses).
//
// This does NOT download the QCF font files themselves — those are loaded
// directly from the Quran Foundation CDN at runtime (per their own guidance),
// to avoid bundling ~50-80MB of font assets into this repo.
//
// Usage: node scripts/fetch-glyph-pages.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "glyph-pages");
const TOTAL_JUZ = 30;
const CHAPTERS_WITHOUT_BASMALAH = new Set([1, 9]);

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchAllVersesForJuz(juz) {
  const verses = [];
  let page = 1;
  for (;;) {
    const url = `https://api.quran.com/api/v4/verses/by_juz/${juz}?words=true&word_fields=code_v2,text_qpc_hafs,line_number,page_number,char_type_name&mushaf=2&per_page=700&page=${page}`;
    const json = await fetchJson(url);
    verses.push(...json.verses);
    if (!json.pagination || !json.pagination.next_page) break;
    page = json.pagination.next_page;
  }
  return verses;
}

// Reuses the already-cached, fully-vocalized surah names from the Uthmani
// page data fetched earlier (scripts/fetch-pages.mjs), keyed by surah number.
async function loadSurahNames() {
  const { readFile } = await import("node:fs/promises");
  const dir = path.join(process.cwd(), "src", "data", "pages");
  const names = new Map();
  for (let p = 1; p <= 604 && names.size < 114; p++) {
    const file = path.join(dir, `${String(p).padStart(3, "0")}.json`);
    const json = JSON.parse(await readFile(file, "utf-8"));
    for (const ayah of json.ayahs) {
      if (!names.has(ayah.surah.number)) names.set(ayah.surah.number, ayah.surah.name);
    }
  }
  return names;
}

async function run() {
  console.log("Loading surah names from cached Uthmani data...");
  const surahNames = await loadSurahNames();

  console.log("Fetching chapters metadata...");
  const chaptersJson = await fetchJson("https://api.quran.com/api/v4/chapters?language=ar");
  const bismillahPre = new Map(chaptersJson.chapters.map((c) => [c.id, c.bismillah_pre]));

  const pages = new Map();
  for (let p = 1; p <= 604; p++) pages.set(p, []);

  for (let juz = 1; juz <= TOTAL_JUZ; juz++) {
    process.stdout.write(`Fetching juz ${juz}/${TOTAL_JUZ}...\n`);
    const verses = await fetchAllVersesForJuz(juz);

    for (const verse of verses) {
      const [surahStr] = verse.verse_key.split(":");
      const surahNumber = Number(surahStr);

      const items = pages.get(verse.page_number);

      if (verse.verse_number === 1) {
        items.push({
          type: "header",
          surahNumber,
          name: surahNames.get(surahNumber) ?? "",
        });
        if (
          bismillahPre.get(surahNumber) &&
          !CHAPTERS_WITHOUT_BASMALAH.has(surahNumber)
        ) {
          items.push({ type: "basmalah" });
        }
      }

      // Group this verse's words into per-line chunks, merging into the
      // current page's trailing line item when the line number matches.
      for (const word of verse.words) {
        const last = items[items.length - 1];
        const wordEntry = { code: word.code_v2, text: word.text_qpc_hafs, kind: word.char_type_name };
        if (last && last.type === "line" && last.line === word.line_number) {
          last.words.push(wordEntry);
        } else {
          items.push({ type: "line", line: word.line_number, words: [wordEntry] });
        }
      }
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  let emptyPages = 0;
  for (const [pageNumber, items] of pages) {
    if (items.length === 0) emptyPages++;
    const filename = `${String(pageNumber).padStart(3, "0")}.json`;
    await writeFile(
      path.join(OUT_DIR, filename),
      JSON.stringify({ page: pageNumber, items }),
      "utf-8"
    );
  }

  console.log(`Wrote 604 page files to ${OUT_DIR}`);
  if (emptyPages > 0) {
    console.warn(`Warning: ${emptyPages} page(s) had no data.`);
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
