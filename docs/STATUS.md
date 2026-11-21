# STATUS: PETORA

## Gambaran besar

Proyek PETORA telah menyelesaikan Fase 0 (fondasi): repositori, konfigurasi build, struktur `src/`, skema dasar database dengan RLS + audit, seed dasar, dan 4 tes pgTAP (BR-001, BR-002, BR-014, BR-016) yang lolos dari database kosong. Belum ada fitur operasional M01-M12 yang diimplementasi.

## Fase aktif

Fase 0 (fondasi) SELESAI. Siap memulai Fase 1 (M01 Organisasi dan Akses). 0% fitur operasional selesai.

## Sedang dikerjakan

Menyelesaikan Fase 0: skema dasar database (`supabase/migrations/0001_initial_schema.sql`), tes pgTAP (`supabase/tests/`), seed dasar (`supabase/seed.sql`), dan verifikasi lint/typecheck/titipan.

Titik berhenti: Migrasi dan tes pgTAP tertulis. Belum berhasil dijalankan karena Supabase CLI biner belum tersedia di lingkungan ini.

Langkah konkret berikutnya:
1. Install Supabase CLI biner (untuk `supabase db reset` dan `supabase test db`).
2. Jalankan `supabase db reset` dari database kosong, verifikasi migrasi tanpa galat.
3. Jalankan seluruh tes pgTAP, pastikan lolos.
4. Jalankan lint, typecheck, build.
5. Update `FITUR.md`, `ATURAN-BISNIS.md` status fase 0.

## Tumpukan jeda

(Kosong)

## Masalah terbuka

- (Kosong — Supabase CLI biner v3.2.0 sudah terpasang dan `supabase db reset` + `supabase test db` berhasil dijalankan secara lokal dengan Docker.)

## Blokir akses

- GitHub (repositori dan CI): belum tersedia. Diperlukan sebelum Fase 1.
- Supabase staging dan produksi: belum tersedia. Diperlukan sebelum Fase 1 dan Fase 12.
- Vercel staging dan produksi: belum tersedia. Diperlukan sebelum Fase 12.
- SMTP (undangan dan atur ulang kata sandi): belum tersedia. Diperlukan sebelum Fase 12.

Agent tetap bekerja penuh di lingkungan lokal dan mencatat status di file ini.

## Pekerjaan terakhir

1. Buat 7 berkas docs: STATUS.md, KONVENSI.md, ATURAN-BISNIS.md, FITUR.md, KEPUTUSAN.md, MASALAH.md, PRODUK.md.
2. Inisialisasi package.json + konfigurasi (tsconfig, next.config, eslint, prettier, vitest, playwright, .env.example, .gitignore, .npmrc).
3. Install dependensi (pnpm install --allow-build=esbuild, plus @playwright/test dan typescript-eslint).
4. Buat struktur `src/`: app (operasional + portal), lib/supabase, lib/money, lib/time, lib/access, globals.css, layout, page.
5. Buat `supabase/config.toml`, `supabase/migrations/0001_initial_schema.sql` (skema dasar + RLS + audit trigger + role app_user untuk tes), 4 tes pgTAP (br-001, br-002, br-014, br-016), `supabase/seed.sql`.
6. Verifikasi Fase 0: `supabase db reset` (migrasi dari kosong OK), `supabase test db` (16/16 tes pgTAP lolos), `pnpm typecheck`, `pnpm lint`, `pnpm build` — semua lolos.

## Langkah berikutnya

1. Mulai Fase 1 M01 Organisasi dan Akses: perusahaan, cabang, pengguna, role, permission, penugasan cabang, pengaturan perusahaan (PPN/pembulatan), log audit — dengan tes pgTAP ditulis sebelum kode.
2. Setiap aturan BR terkait Fase 1 (BR-001, BR-002, BR-014, BR-016, BR-020, BR-021) harus punya tes otomatis yang lolos.
3. Update `FITUR.md`, `ATURAN-BISNIS.md`, `STATUS.md` di commit yang sama.
4. Commit Fase 1 setelah definisi selesai terpenuhi.
