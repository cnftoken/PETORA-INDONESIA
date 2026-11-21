# Status

**Gambaran besar**
PETORA dimulai sebagai proyek baru dari brief final. Fondasi Next.js, Supabase, testing, dan dokumentasi fase 0 sudah hijau. M01 Organisasi dan Akses sedang diimplementasikan; 72 fitur v1 belum seluruhnya selesai.

**Sedang dikerjakan**
Branch `main`; fase 0 fondasi selesai; fase M01 menambahkan RLS, role/permission, penugasan cabang, setting perusahaan, audit, setup Owner, dan halaman pengaturan.

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

**Langkah berikutnya**
1. Selesaikan fondasi migration dan tes baseline.
2. Jalankan lint, typecheck, test, dan build.
3. Lanjut ke M01 dengan autentikasi, role, permission, cabang, dan audit.
