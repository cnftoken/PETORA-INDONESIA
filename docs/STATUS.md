# Status

**Gambaran besar**
PETORA dimulai sebagai proyek baru dari brief final. Fondasi Next.js, Supabase, testing, dan dokumentasi fase 0 sudah hijau. M01 Organisasi dan Akses serta M06 Katalog dan Harga telah diimplementasikan; fase berikutnya adalah M02 Pelanggan dan Hewan.

**Sedang dikerjakan**
Branch `main`; fase 0 fondasi dan fase M01 selesai. Fase M06 menambahkan tabel katalog, layanan, status pajak, riwayat harga, seed, halaman katalog, dan tes pgTAP.

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

**Langkah berikutnya**
1. Selesaikan fondasi migration dan tes baseline.
2. Jalankan lint, typecheck, test, dan build.
3. Lanjut ke M01 dengan autentikasi, role, permission, cabang, dan audit.
