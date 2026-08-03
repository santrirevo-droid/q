# Mushaf Al-Qur'an — 604 Halaman

Website Next.js yang menampilkan seluruh Al-Qur'an dalam 604 halaman,
mengikuti pembagian halaman & baris standar Mushaf Madinah 1441H
(King Fahd Quran Complex), disusun dari kanan ke kiri.

## Struktur

- `/` — satu poster 604 halaman, dua mode tampilan (tombol pill di atas
  grid):
  - **"Muat semua sekaligus"** (default) — kanvas zoom/pan kontinu ala
    peta digital (`PosterZoomCanvas.tsx`, lihat catatan di bawah): mulai
    zoomed-out melihat seluruh 604 halaman sekaligus, lalu scroll/pinch
    untuk zoom terus-menerus ke halaman mana pun tanpa kehilangan
    detail — resolusi gambar naik otomatis (tiny → thumb → full)
    seiring di-zoom masuk.
  - **"Muat bertahap"** — grid datar berukuran **piksel tetap** (bukan
    layout responsif), di-pan lewat scroll horizontal dan dibaca lewat
    pinch-zoom bawaan browser. Baris pertama = halaman 1 (Al-Fatihah),
    baris tengah = 600 halaman (2–601, 20×30), baris terakhir =
    602–604. Setiap sel `<img>` biasa (tier thumbnail) dengan native
    `loading="lazy"`.
- `/page/[n]` — tampilan penuh satu halaman (1–604): gambar resolusi
  penuh, dengan navigasi halaman sebelumnya/berikutnya (kanan =
  sebelumnya, kiri = berikutnya).
- Tema terang/gelap otomatis mengikuti sistem, dengan tombol switch
  manual (pojok kanan atas). Termasuk gambar mushaf-nya sendiri — lihat
  catatan di bawah.

## Kanvas zoom/pan kontinu (`PosterZoomCanvas.tsx`)

Mode "Muat semua sekaligus" dibangun di atas
[`react-zoom-pan-pinch`](https://github.com/BetterTyped/react-zoom-pan-pinch)
untuk gesture (scroll/wheel untuk zoom, drag untuk pan, pinch di
mobile, double-click/tap untuk zoom cepat), dikombinasikan dengan dua
teknik agar tetap ringan meski memuat 604 halaman resolusi tinggi:

- **Virtualisasi** lewat `Virtualize` bawaan library — tiap sel
  ditempatkan di koordinat "dunia" tetap (`x, y` dalam satuan piksel
  tak-terskala), tapi `<img>`-nya hanya benar-benar dipasang ke DOM
  saat sel itu (plus margin buffer) tumpang tindih dengan area yang
  sedang terlihat di layar. Saat zoom-in, ratusan sel di luar layar
  otomatis dilepas dari DOM.
- **Tier gambar otomatis** — lebar sel di layar (`lebar sel dunia ×
  skala saat ini`) dipantau lewat `useTransformEffect`; di bawah ~110px
  pakai `poster-tiny`, di bawah ~520px pakai `poster-thumb`, di atasnya
  pakai `poster` (resolusi penuh). Threshold ini sengaja dibuat sebagai
  "bucket" (bukan dihitung ulang tiap frame) supaya re-render React
  hanya terjadi beberapa kali sepanjang rentang zoom, bukan tiap piksel
  gesture.

Posisi tiap halaman di kanvas dihitung langsung dari urutan halaman
(bukan CSS Grid + `dir="rtl"`) — halaman 1 di kolom paling kanan, lalu
mengisi ke kiri, turun baris, persis alur baca mushaf — supaya
matematika virtualisasi (posisi dunia ↔ area layar yang terlihat) tetap
sederhana.

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
  160px) — dipakai saat kanvas zoom dalam keadaan zoomed-out (sel kecil
  di layar).
- `public/poster-thumb/{n}.webp` (~33MB total, ~55KB/halaman, lebar
  480px) — dipakai saat zoom sedang (kanvas), dan sebagai satu-satunya
  tier di mode "Muat bertahap".
- `public/poster/{n}.webp` (~159MB total, resolusi penuh, skala 1.8×
  dari PDF asli) — dipakai saat kanvas di-zoom cukup dekat, dan di
  `/page/[n]` (satu gambar per kunjungan halaman).

Toggle antara mode "Muat semua sekaligus" (kanvas zoom) dan "Muat
bertahap" (grid datar) ada di `src/components/PosterGrid.tsx` (client
component, satu-satunya bagian beranda yang butuh interaktivitas).

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
