# Status

**Gambaran besar**
PETORA dimulai sebagai proyek baru dari brief final. Fondasi Next.js, Supabase, testing, M01, M06, dan M02 sudah hijau. Fase berikutnya adalah M08 Inventori, karena M02 kini menyediakan pemilik/hewan dan M06 menyediakan katalog.

**Sedang dikerjakan**
Branch `main`; fase 0, M01, M06, dan M02 selesai. M02 menambahkan pelanggan, hewan, nomor pasien, timeline, lampiran, riwayat pemilik, dan akun portal.

**Tumpukan jeda**
- Tidak ada.

**Masalah terbuka**
- Kredensial staging/produksi Supabase, Vercel, SMTP, dan GitHub belum disediakan pemilik.

**Pekerjaan terakhir**
- Memulihkan riwayat Git ke `origin/main`.
- Membuat App Router dan memasang dependency penyusun produk.
- Menyiapkan struktur Supabase dan dokumentasi proyek.
- Menjalankan Supabase lokal; migrasi phase 0 berhasil diterapkan.
- Menambahkan migrasi M01, seed role/permission, halaman pengaturan, skrip setup Owner, dan 8 tes pgTAP.
- Menambahkan migrasi M06, produk dan layanan, riwayat harga integer Rupiah, halaman katalog, dan 7 tes pgTAP tambahan.
- Menambahkan migrasi M02, pelanggan/hewan terpusat, bucket lampiran, seed, halaman operasional, dan 8 tes pgTAP tambahan.

**Langkah berikutnya**
1. Selesaikan fondasi migration dan tes baseline.
2. Jalankan lint, typecheck, test, dan build.
3. Lanjut ke M01 dengan autentikasi, role, permission, cabang, dan audit.
