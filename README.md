# Mushaf Al-Qur'an — 604 Halaman

Website Next.js yang menampilkan seluruh Al-Qur'an dalam 604 halaman,
mengikuti pembagian halaman standar Mushaf Madinah (teks Uthmani,
font Amiri Quran).

## Struktur

- `/` — halaman utama: 2 halaman pembuka, grid poster 604 halaman (20 kolom),
  2 halaman penutup.
- `/page/[n]` — tampilan penuh satu halaman (1–604) dengan navigasi
  halaman sebelumnya/berikutnya.
- `src/data/pages/*.json` — 604 file data ayat per halaman, sudah
  di-cache secara lokal (tidak fetch API saat runtime).
- `scripts/fetch-pages.mjs` — script untuk mengambil ulang data dari
  AlQuran Cloud API (`quran-uthmani`) jika perlu refresh.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Menyunting halaman pembuka/penutup

4 halaman ini (2 di awal, 2 di akhir) bukan bagian dari 604 halaman
Al-Qur'an — isinya placeholder yang bisa disunting bebas di
`src/app/page.tsx` (komponen `FrontMatterPage`).

## Catatan akurasi

Teks dirender ulang dengan font Uthmani (bukan gambar scan mushaf
asli), sehingga pembagian ayat per halaman mengikuti standar 604
halaman Mushaf Madinah, tetapi pembagian baris per halaman adalah
hasil reflow otomatis browser — bukan replika baris-demi-baris 100%
dari cetakan fisik.

## Refresh data

```bash
node scripts/fetch-pages.mjs
```
