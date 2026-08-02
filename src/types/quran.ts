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
