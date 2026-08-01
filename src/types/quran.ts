export interface AyahSurahRef {
  number: number;
  name: string;
  englishName: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: AyahSurahRef;
  juz: number;
  sajda: boolean;
}

export interface PageData {
  page: number;
  ayahs: Ayah[];
}

export interface GlyphWord {
  code: string;
  text: string;
  kind: "word" | "end";
}

export type GlyphPageItem =
  | { type: "header"; surahNumber: number; name: string; englishName: string }
  | { type: "basmalah" }
  | { type: "line"; line: number; words: GlyphWord[] };

export interface GlyphPageData {
  page: number;
  items: GlyphPageItem[];
}
