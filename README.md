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
    halaman. Setiap sel adalah `<img>` biasa — zero JS per-sel, native
    `loading="lazy"`, native pinch-zoom, tidak ada yang berubah saat
    digeser/di-zoom.
- `/page/[n]` — tampilan penuh satu halaman (1–604): gambar yang sama,
  ditampilkan lebih besar, dengan navigasi halaman sebelumnya/berikutnya
  (kanan = sebelumnya, kiri = berikutnya).
- Tema terang/gelap otomatis mengikuti sistem, dengan tombol switch
  manual (pojok kanan atas). Gambar mushaf sendiri selalu berlatar
  terang (kertas), hanya elemen di sekitarnya yang ikut berganti tema.

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
  kompres ke WebP (`sharp`, kualitas 80) → `public/poster/{n}.webp`.
- `scripts/build-poster-manifest.mjs` — baca dimensi tiap gambar hasil
  ekstraksi → `src/data/poster-manifest.json`, dipakai `/` dan
  `/page/[n]` supaya `<img width/height>` akurat (tidak ada layout
  shift saat gambar dimuat).

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
