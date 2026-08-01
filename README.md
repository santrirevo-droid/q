# Mushaf Al-Qur'an — 604 Halaman

Website Next.js yang menampilkan seluruh Al-Qur'an dalam 604 halaman,
mengikuti pembagian halaman & baris standar Mushaf Madinah, disusun
dari kanan ke kiri.

## Struktur

- `/` — halaman utama:
  - Halaman pembuka: halaman 1 (Al-Fatihah), ditampilkan besar
    terpisah di atas grid.
  - Grid poster **600 halaman** (halaman 2–601), 20 kolom × 30 baris,
    diisi dari kanan ke kiri.
  - Halaman penutup: halaman 602–604 (awal Al-Baqarah + 2 halaman
    terakhir Juz 30), ditampilkan besar terpisah di bawah grid dalam
    3 kolom.
- `/page/[n]` — tampilan penuh satu halaman (1–604), gaya `quran.com`
  (readingMode=arabic): tanpa bingkai, kartu nama surah, Bismillah,
  nomor halaman + garis pemisah, dan navigasi halaman
  sebelumnya/berikutnya (kanan = sebelumnya, kiri = berikutnya).

## Dua mode render teks Arab

1. **Grid/thumbnail** (`MushafThumbnail.tsx`) — font Amiri Quran biasa,
   dipakai untuk 600 thumbnail di grid agar tetap ringan (memuat 600
   font halaman sekaligus tidak realistis).
2. **Tampilan penuh** (`MushafPageGlyph.tsx`) — dipakai di `/page/[n]`
   dan 4 halaman pembuka/penutup. Merender glyph font per-halaman asli
   **QCF v2 (KFGQPC — King Fahd Glorious Qur'an Printing Complex)**,
   font yang sama dipakai quran.com, sehingga baris per halaman
   sama persis dengan cetakan Mushaf Madinah asli (bukan reflow
   otomatis browser). Setiap baris di-scale horizontal (meniru kashida
   justification) agar pas memenuhi lebar halaman seperti cetakan asli.
   Font dimuat langsung dari CDN Quran Foundation saat halaman dibuka
   (tidak dibundel di repo — lihat catatan lisensi di bawah); jika CDN
   tidak terjangkau, otomatis fallback ke teks Unicode + font Amiri
   Quran supaya halaman tidak pernah kosong.

## Sumber data

- `src/data/pages/*.json` — 604 file teks ayat per halaman (edisi
  Uthmani AlQuran Cloud), dipakai untuk grid/thumbnail dan info
  juz/nama surah.
- `src/data/glyph-pages/*.json` — 604 file data glyph per-kata per-baris
  (kode glyph QCF v2 + nomor baris asli) dari API publik
  `api.quran.com/api/v4`, dipakai oleh `MushafPageGlyph`.
- `scripts/fetch-pages.mjs` — refresh `src/data/pages/*.json`.
- `scripts/fetch-glyph-pages.mjs` — refresh `src/data/glyph-pages/*.json`.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Catatan lisensi font QCF v2

Font glyph-per-halaman ini adalah milik King Fahd Glorious Qur'an
Printing Complex (KFGQPC). Menurut ketentuan resmi mereka
(dm.qurancomplex.gov.sa/copyright-2), Mus'haf Madinah dalam berbagai
format boleh dipakai gratis untuk penggunaan pribadi, lembaga, maupun
website/software — asal font tidak dijual, diubah, atau direkayasa
ulang. Font tidak dibundel di repo ini; selalu dimuat langsung dari
CDN resmi (`verses.quran.foundation`) saat runtime, sesuai rekomendasi
Quran Foundation sendiri.

## Refresh data

```bash
node scripts/fetch-pages.mjs
node scripts/fetch-glyph-pages.mjs
```
