# Mushaf Al-Qur'an — 604 Halaman

Website Next.js yang menampilkan seluruh Al-Qur'an dalam 604 halaman,
mengikuti pembagian halaman standar Mushaf Madinah (teks Uthmani,
font Amiri Quran).

## Struktur

- `/` — halaman utama:
  - Halaman pembuka: halaman 1 (Al-Fatihah) dan halaman 2 (awal Al-Baqarah),
    ditampilkan besar terpisah di atas grid.
  - Grid poster **600 halaman** (halaman 3–602), 20 kolom × 30 baris.
  - Halaman penutup: halaman 603–604 (2 halaman terakhir Juz 30),
    ditampilkan besar terpisah di bawah grid.
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
