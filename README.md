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
    604 halaman. Setiap sel adalah **gambar statis** pra-render
    (bukan komponen React hidup) — lihat "Poster = gambar statis"
    di bawah untuk alasannya.
- `/page/[n]` — tampilan penuh satu halaman (1–604), gaya `quran.com`
  (readingMode=arabic): tanpa bingkai, kartu nama surah, Bismillah,
  nomor halaman + garis pemisah, dan navigasi halaman
  sebelumnya/berikutnya (kanan = sebelumnya, kiri = berikutnya). Ini
  tetap komponen React hidup (`MushafPageGlyph`) — teks bisa
  di-select/di-search, dan ikut tema terang/gelap.
- Tema terang/gelap otomatis mengikuti sistem, dengan tombol switch
  manual (pojok kanan atas). Poster (`/`) sendiri selalu tema terang
  (gambar statis, lihat di bawah); hanya `/page/[n]` yang benar-benar
  berganti tema.

## Poster = gambar statis, bukan 604 komponen hidup

Versi awal poster merender 604 halaman sebagai komponen React hidup
(masing-masing memuat font sendiri, mengukur ulang lebar, dsb) — jadi
sangat berat, dan terlihat "berubah" saat digeser karena font/ukuran
sel menyesuaikan belakangan. Sekarang poster memakai pola **deep-zoom
image** (seperti Google Maps/Arts & Culture): setiap halaman
di-*screenshot* sekali di waktu build (resolusi tinggi, huruf QCF
asli) jadi file WebP statis, dan beranda tinggal menampilkan grid
`<img>` biasa — zero JS per-sel, native `loading="lazy"`, native
pinch-zoom, tidak ada yang berubah saat digeser.

Trade-off yang disadari: karena jadi gambar, teks poster tidak bisa
di-search/copy dan tidak bisa dibaca screen reader. Untuk itu, klik
halaman mana pun di poster akan membuka `/page/[n]` — versi teks hidup
yang aksesibel.

- `src/app/print/[n]/page.tsx` — rute internal (bukan untuk pengunjung)
  yang dipakai script render: kartu halaman ukuran tetap tanpa
  chrome/tema, selalu terang.
- `scripts/render-poster-images.mjs` — screenshot 604 halaman dari
  `/print/[n]` (server production harus jalan dulu) → `public/poster/*.webp`.
- `scripts/build-poster-manifest.mjs` — baca dimensi tiap gambar hasil
  render → `src/data/poster-manifest.json`, dipakai beranda supaya
  `<img width/height>` akurat (tidak ada layout shift saat gambar
  dimuat).

Kedua script butuh `playwright` dan `sharp` — **tidak** termasuk
dependency default (biar `npm install` tetap ringan untuk pemakaian
sehari-hari); pasang dulu kalau perlu regenerasi:

```bash
npm install -D playwright sharp
npm run build && npm run start   # server production harus jalan
node scripts/render-poster-images.mjs
node scripts/build-poster-manifest.mjs
```

## Render teks Arab (`MushafPageGlyph.tsx`)

Dipakai di `/page/[n]` (tampilan hidup) dan `/print/[n]` (sumber
screenshot poster). Merender glyph font per-halaman asli **QCF v2
(KFGQPC — King Fahd Glorious Qur'an Printing Complex)**, font yang
sama dipakai quran.com, sehingga baris per halaman sama persis dengan
cetakan Mushaf Madinah asli (bukan reflow otomatis browser). Setiap
baris & teks header/Bismillah diukur lalu diberi ukuran font yang pas
memenuhi lebar kontainer (bukan di-stretch/distorsi) — otomatis
menyesuaikan baik di kartu `/page/[n]` maupun kartu lebar `/print/[n]`.

Font per-halaman dimuat via `FontFace` JS langsung dari CDN Quran
Foundation (tidak dibundel di repo — lihat catatan lisensi di bawah).
Sebelum termuat (atau jika CDN tak terjangkau), otomatis fallback ke
teks Unicode + font Amiri Quran, dengan mekanisme fit-lebar yang sama
supaya proporsi tetap konsisten walau font asli belum siap.

## Sumber data

- `src/data/pages/*.json` — 604 file teks ayat per halaman (edisi
  Uthmani AlQuran Cloud), dipakai untuk info juz/nama surah di
  `/page/[n]`.
- `src/data/glyph-pages/*.json` — 604 file data glyph per-kata per-baris
  (kode glyph QCF v2 + nomor baris asli) dari API publik
  `api.quran.com/api/v4`, dipakai oleh `MushafPageGlyph`.
- `src/data/poster-manifest.json` — dimensi gambar poster per halaman
  (lihat "Poster = gambar statis" di atas).
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

Setelah refresh data glyph, poster perlu di-render ulang juga (lihat
"Poster = gambar statis" di atas).
