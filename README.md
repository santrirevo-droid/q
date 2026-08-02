# Mushaf Al-Qur'an — 604 Halaman

Website Next.js yang menampilkan seluruh Al-Qur'an dalam 604 halaman,
mengikuti pembagian halaman & baris standar Mushaf Madinah 1441H
(King Fahd Quran Complex), disusun dari kanan ke kiri.

## Struktur

- `/` — satu poster 604 halaman berukuran **piksel tetap** (bukan
  layout responsif), di-pan lewat scroll horizontal dan dibaca lewat
  pinch-zoom bawaan browser — tidak wajib klik untuk membaca:
  - Baris pertama: halaman 1 (Al-Fatihah).
  - Baris tengah: 600 halaman (halaman 2–601), 20 kolom × 30 baris.
  - Baris terakhir: halaman 602–604 (awal Al-Baqarah + 2 halaman
    terakhir Juz 30).
  - Semua diisi dari kanan ke kiri, ukuran sel sama untuk seluruh 604
    halaman. Setiap sel adalah `<img>` biasa (tier thumbnail, lihat di
    bawah) — zero JS per-sel, native `loading="lazy"`, native
    pinch-zoom, tidak ada yang berubah saat digeser/di-zoom.
- `/page/[n]` — tampilan penuh satu halaman (1–604): gambar resolusi
  penuh, dengan navigasi halaman sebelumnya/berikutnya (kanan =
  sebelumnya, kiri = berikutnya).
- Tema terang/gelap otomatis mengikuti sistem, dengan tombol switch
  manual (pojok kanan atas). Termasuk gambar mushaf-nya sendiri — lihat
  catatan di bawah.

## Dark mode untuk gambar mushaf: filter invert, bukan render ulang

Mushaf Madinah yang presisi baris-per-baris hanya bisa dicapai lewat
gambar per halaman (lihat catatan PDF di bawah), bukan teks Unicode
biasa yang bisa diberi warna bebas. Tapi itu bukan berarti gambarnya
harus selalu terang di dark mode — karena isinya cuma tinta
hitam di atas kertas putih (grayscale, tanpa warna), CSS `filter:
invert()` membalik hitam↔putih dengan bersih tanpa distorsi warna,
menghasilkan tampilan gelap yang tetap terlihat seperti mushaf asli
(bukan cuma dibiarkan terang di tengah UI gelap). Diterapkan lewat
`dark:invert dark:brightness-90` di setiap `<img>` mushaf
(`PosterGrid.tsx` dan `/page/[n]`) — tanpa perlu generate ulang
gambar versi gelap terpisah.

## Tiga tingkat resolusi gambar (kenapa tidak terasa berat lagi)

Sebelumnya proyek ini memuat 604 gambar resolusi penuh sekaligus di
beranda (~160MB) — jauh lebih berat dari yang dibutuhkan grid
overview. `quran_android` sendiri tidak pernah memuat lebih dari satu
halaman resolusi penuh sekaligus (diunduh on-demand, sesuai ukuran
layar saat itu). Proyek ini meniru ide itu dengan tiga tingkat:

- `public/poster-tiny/{n}.webp` (~7MB total, ~12KB/halaman, lebar
  160px) — dipakai mode "Muat semua sekaligus" di beranda: seluruh
  604 halaman dimuat langsung tanpa lazy-load, ukurannya kecil sekali
  jadi tetap ringan.
- `public/poster-thumb/{n}.webp` (~33MB total, ~55KB/halaman, lebar
  480px) — mode default "Muat bertahap" di beranda: lazy-loaded
  seiring scroll, lebih detail untuk overview + zoom sedang.
- `public/poster/{n}.webp` (~159MB total, resolusi penuh, skala 1.8×
  dari PDF asli) — hanya dimuat satu per satu di `/page/[n]` saat
  halaman itu benar-benar dibuka.

Toggle antara mode "Muat bertahap" dan "Muat semua sekaligus" ada di
`src/components/PosterGrid.tsx` (client component, satu-satunya
bagian beranda yang butuh interaktivitas).

## Sumber halaman: ekstraksi langsung dari PDF Mushaf 1441H

Setiap halaman adalah **gambar hasil ekstraksi langsung** dari PDF
resmi tata letak Mushaf Madinah 1441H
(`https://pdf.quran.ws/pdfs/hafs/quran-hafs-mushaf.pdf`), bukan hasil
render ulang teks.

Kenapa begitu — bukan render teks dengan font glyph per-halaman
(pendekatan awal proyek ini)? Karena pendekatan itu butuh merekonstruksi
posisi baris dari data kata per kata (API publik `api.quran.com`,
`mushaf=2`), dan data itu ternyata **tidak selalu identik** dengan
pemotongan baris cetakan 1441H asli — di beberapa halaman sebuah ayat
yang seharusnya menutup satu baris malah terpotong ke baris berikutnya,
atau sebaliknya. Mengekstrak langsung dari PDF yang sudah memakai tata
letak 1441H menghilangkan masalah ini sepenuhnya — tidak ada rekonstruksi
sama sekali, murni menyalin apa yang sudah benar.

- `scripts/extract-pdf-pages.mjs` — mengunduh PDF (di-cache di temp
  folder sistem), lalu untuk tiap halaman 1–604: render ke kanvas
  resolusi tinggi (skala 1.8×) lewat `pdfjs-dist` + `@napi-rs/canvas`,
  kompres ke WebP (`sharp`) dua kali dari kanvas yang sama →
  `public/poster/{n}.webp` (kualitas 80, penuh) dan
  `public/poster-thumb/{n}.webp` (di-resize ke lebar 480px, kualitas
  68, buat grid beranda).
- `scripts/build-poster-manifest.mjs` — baca dimensi tiap gambar hasil
  ekstraksi (kedua tier) → `src/data/poster-manifest.json` dan
  `src/data/poster-thumb-manifest.json`, dipakai `/` dan `/page/[n]`
  supaya `<img width/height>` akurat (tidak ada layout shift saat
  gambar dimuat).

## Sumber data lain

- `src/data/pages/*.json` — 604 file teks ayat per halaman (edisi
  Uthmani AlQuran Cloud), dipakai hanya untuk info juz/nama surah di
  bilah atas `/page/[n]` (bukan untuk tata letak/baris — itu sepenuhnya
  dari gambar PDF).
- `scripts/fetch-pages.mjs` — refresh `src/data/pages/*.json`.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Refresh gambar poster

```bash
node scripts/extract-pdf-pages.mjs
node scripts/generate-tiny-tier.mjs
node scripts/build-poster-manifest.mjs
```

Butuh waktu beberapa menit (604 halaman) dan akan mengunduh PDF sumber
(~210MB, di-cache di temp folder sistem agar tidak berulang kali
diunduh). `generate-tiny-tier.mjs` cukup cepat — resize dari
`poster-thumb` yang sudah ada, tidak render ulang PDF.
