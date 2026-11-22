# STATUS: PETORA

## Gambaran besar

Proyek PETORA telah menyelesaikan Fase 0 (fondasi), Fase 1 (M01 Organisasi dan Akses), Fase 2 (M06 Katalog dan Harga), Fase 3 (M02 Pelanggan dan Hewan), dan Fase 4 (M03 Pelayanan Klinik, parsial). Fase 0: repositori, konfigurasi build, CI workflow, struktur `src/`, sistem desain (`src/ui`), skema dasar database dengan RLS + audit, seed dasar, dan 4 tes pgTAP (BR-001, BR-002, BR-014, BR-016). Fase 1: seluruh 8 fitur M01 diimplementasi dengan 11 tes pgTAP (menambah BR-020, BR-021, dan M01-F01..F08). Fase 2: 4 fitur M06 (produk, layanan, kategori, riwayat harga, status pajak per item) dengan tes pgTAP BR-007 dan BR-020. Fase 3: 3 fitur M02 (data pelanggan, pencarian lintas cabang, profil hewan) dengan tes pgTAP BR-003. Fase 4: 3 fitur M03 (pendaftaran kunjungan, pemeriksaan, daftar kunjungan) dengan tes pgTAP BR-022 dan BR-009. Total 81 tes pgTAP lolos dari database kosong.

## Fase aktif

Fase 4 (M03 Pelayanan Klinik, parsial: F01, F03, F06 selesai; F02, F04, F05 belum karena butuh realtime, stok integrasi, dan validasi transisi status) SELESAI. 18/72 fitur operasional selesai (25%).

## Sedang dikerjakan

(Kosong — Fase 4 selesai parsial.)

Langkah konkret berikutnya:
1. Selesaikan sisa M03 (F02 antrean realtime, F04 resep dengan integrasi stok, F05 validasi transisi status) atau lanjut ke fase berikutnya.
2. Setiap aturan BR terkait fase berikutnya harus punya tes otomatis yang lolos.
3. Update `FITUR.md`, `ATURAN-BISNIS.md`, `STATUS.md` di commit yang sama.
4. Commit fase setelah definisi selesai terpenuhi.

## Tumpukan jeda

(Kosong)

## Masalah terbuka

(Kosong)

## Blokir akses

- GitHub (repositori dan CI): belum tersedia. Diperlukan sebelum rilis produksi.
- Supabase staging dan produksi: belum tersedia. Diperlukan sebelum Fase 12.
- Vercel staging dan produksi: belum tersedia. Diperlukan sebelum Fase 12.
- SMTP (undangan dan atur ulang kata sandi): belum tersedia. Diperlukan sebelum Fase 12.

Agent tetap bekerja penuh di lingkungan lokal dan mencatat status di file ini. Kredensial ini tidak memblokir pengembangan fase berikutnya di lingkungan lokal.

## Pekerjaan terakhir

1. Buat 7 berkas docs: STATUS.md, KONVENSI.md, ATURAN-BISNIS.md, FITUR.md, KEPUTUSAN.md, MASALAH.md, PRODUK.md.
2. Inisialisasi package.json + konfigurasi (tsconfig, next.config, eslint, prettier, vitest, playwright, .env.example, .gitignore, .npmrc).
3. Install dependensi (pnpm install --allow-build=esbuild, plus @playwright/test dan typescript-eslint).
4. Buat struktur `src/`: app (operasional + portal), lib/supabase, lib/money, lib/time, lib/access, globals.css, layout, page.
5. Buat `src/ui/` sistem desain: cn utils, Button, Input, Card, Dialog, Sheet, Label.
6. Buat `.github/workflows/ci.yml`: lint, typecheck, test:unit, test:db (pgTAP), test:e2e (Playwright), build.
7. Buat `supabase/config.toml`, `supabase/migrations/0001_initial_schema.sql` (skema dasar + RLS + audit trigger + role app_user untuk tes), 14 tes pgTAP (br-001, br-002, br-014, br-016, br-020, br-021, m01-f01..f08), `supabase/seed.sql`.
8. Implementasi modul M01: schemas, queries, actions, components (CompanyForm, BranchForm, UserForm, BranchSettingForm), dan halaman (company, branches, users, roles, permissions, branch-assignments, settings, audit-logs).
9. Verifikasi Fase 0 dan Fase 1: `supabase db reset` (migrasi dari kosong OK), `supabase test db` (65/65 tes pgTAP lolos), `pnpm typecheck`, `pnpm lint`, `pnpm build` — semua lolos.
10. Implementasi Fase 2 M06: migrasi `0002_m06_katalog_harga.sql` (kategori, produk, layanan, price_history, RLS, audit, trigger riwayat harga), skema Zod, queries, actions, client form wrapper, dan halaman Server Component (categories, products, services). Tes pgTAP `br-007-fefo` ditulis sebelum kode dan lolos setelah migrasi. Total 70 tes pgTAP lolos.
11. Implementasi Fase 3 M02: migrasi `0003_m02_pelanggan_hewan.sql` (customers, patients, RLS, audit, indeks pencarian lintas cabang), skema Zod, queries, actions, client form wrapper, dan halaman Server Component (customers, patients). Tes pgTAP `br-003-cross-branch-medical` ditulis sebelum kode dan lolos setelah migrasi. Total 75 tes pgTAP lolos.
12. Implementasi Fase 4 M03: migrasi `0004_m03_pelayanan_klinik.sql` (visits, visit_queue, examinations, prescriptions, invoices, invoice_lines, RLS, audit), skema Zod, queries, actions, client form wrapper, dan halaman Server Component (visits, queue, examinations, invoices). Tes pgTAP `m03-f01-f06-klinik` (BR-022, BR-009) ditulis sebelum kode dan lolos setelah migrasi. Total 81 tes pgTAP lolos.

## Langkah berikutnya

1. Selesaikan sisa M03 (F02 antrean realtime, F04 resep dengan integrasi stok, F05 validasi transisi status) atau lanjut ke fase berikutnya dengan tes pgTAP ditulis sebelum kode.
2. Setiap aturan BR terkait fase berikutnya harus punya tes otomatis yang lolos.
3. Update `FITUR.md`, `ATURAN-BISNIS.md`, `STATUS.md` di commit yang sama.
4. Commit fase setelah definisi selesai terpenuhi.
