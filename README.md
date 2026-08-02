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
  manual (pojok kanan atas). Gambar mushaf sendiri selalu berlatar
  terang (kertas) di kedua tema — lihat catatan di bawah kenapa ini
  disengaja, bukan bug — hanya elemen di sekitarnya (nav, tombol,
  latar halaman) yang ikut berganti tema.

## Kenapa halaman mushaf tetap terang di dark mode

Ini bukan keterbatasan yang belum sempat diperbaiki — ini bagaimana
setiap aplikasi Qur'an akurat menanganinya, termasuk app resmi
Quran.com (`quran/quran_android`, diperiksa langsung untuk proyek
ini): Mushaf Madinah yang presisi baris-per-baris HANYA bisa dicapai
lewat gambar/glyph-font per halaman, bukan teks Unicode biasa yang
di-reflow otomatis — dan halaman itu, seperti kertas cetak asli,
tidak "dibalik warnanya" mengikuti tema aplikasi. `quran_android`
sendiri punya database `AyahInfo` terpisah hanya untuk koordinat
highlight overlay di atas gambar, bukan untuk merender ulang teksnya
sebagai Unicode yang bisa diberi warna bebas.

## Dua tingkat resolusi gambar (kenapa tidak terasa berat lagi)

Sebelumnya proyek ini memuat 604 gambar resolusi penuh sekaligus di
beranda (~160MB) — jauh lebih berat dari yang dibutuhkan grid
overview. `quran_android` sendiri tidak pernah memuat lebih dari satu
halaman resolusi penuh sekaligus (diunduh on-demand, sesuai ukuran
layar saat itu). Proyek ini meniru ide itu dengan dua tingkat:

- `public/poster-thumb/{n}.webp` (~33MB total, ~55KB/halaman) — dipakai
  grid beranda, cukup untuk overview + zoom sedang.
- `public/poster/{n}.webp` (~159MB total, resolusi penuh) — hanya
  dimuat satu per satu di `/page/[n]` saat halaman itu benar-benar
  dibuka.

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
node scripts/build-poster-manifest.mjs
```

Butuh waktu beberapa menit (604 halaman) dan akan mengunduh PDF sumber
(~210MB, di-cache di temp folder sistem agar tidak berulang kali
diunduh).
