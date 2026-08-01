# Mushaf Al-Qur'an — 604 Halaman

Website Next.js yang menampilkan seluruh Al-Qur'an dalam 604 halaman,
mengikuti pembagian halaman & baris standar Mushaf Madinah, disusun
dari kanan ke kiri.

## Struktur

- `/` — satu poster 604 halaman berukuran **piksel tetap** (bukan
  layout responsif), di-pan lewat scroll horizontal dan dibaca lewat
  pinch-zoom bawaan browser — tidak wajib klik untuk membaca:
  - Baris pertama: halaman 1 (Al-Fatihah).
  - Baris tengah: 600 halaman (halaman 2–601), 20 kolom × 30 baris.
  - Baris terakhir: halaman 602–604 (awal Al-Baqarah + 2 halaman
    terakhir Juz 30).
  - Semua diisi dari kanan ke kiri, ukuran sel sama untuk seluruh
    604 halaman.
- `/page/[n]` — tampilan penuh satu halaman (1–604), gaya `quran.com`
  (readingMode=arabic): tanpa bingkai, kartu nama surah, Bismillah,
  nomor halaman + garis pemisah, dan navigasi halaman
  sebelumnya/berikutnya (kanan = sebelumnya, kiri = berikutnya).
- Tema terang/gelap otomatis mengikuti sistem, dengan tombol switch
  manual (pojok kanan atas).

## Render teks Arab (`MushafPageGlyph.tsx`)

Dipakai baik di poster 604-halaman (`/`) maupun tampilan baca penuh
(`/page/[n]`) — satu komponen, dua ukuran (`maxFontSize`). Merender
glyph font per-halaman asli **QCF v2 (KFGQPC — King Fahd Glorious
Qur'an Printing Complex)**, font yang sama dipakai quran.com, sehingga
baris per halaman sama persis dengan cetakan Mushaf Madinah asli
(bukan reflow otomatis browser). Setiap baris & teks header/Bismillah
diukur lalu diberi ukuran font yang pas memenuhi lebar kontainer
(bukan di-stretch/distorsi) — otomatis menyesuaikan baik di kartu
besar (`/page/[n]`) maupun sel kecil 220px di poster grid.

Untuk poster 604-halaman, font per-halaman dimuat **lazy** (baru
di-fetch saat sel mendekati layar, lewat `IntersectionObserver`) —
memuat 604 font sekaligus tidak realistis. Sebelum termuat (atau jika
CDN tak terjangkau), otomatis fallback ke teks Unicode + font Amiri
Quran, dengan mekanisme fit-lebar yang sama supaya ukuran sel tetap
konsisten walau font asli belum siap.

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
