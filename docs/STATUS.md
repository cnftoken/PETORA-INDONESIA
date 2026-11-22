# STATUS: PETORA

## Gambaran besar

Proyek PETORA telah menyelesaikan Fase 0 (fondasi), Fase 1 (M01 Organisasi dan Akses), dan Fase 2 (M06 Katalog dan Harga). Fase 0: repositori, konfigurasi build, CI workflow, struktur `src/`, sistem desain (`src/ui`), skema dasar database dengan RLS + audit, seed dasar, dan 4 tes pgTAP (BR-001, BR-002, BR-014, BR-016). Fase 1: seluruh 8 fitur M01 diimplementasi dengan 11 tes pgTAP (menambah BR-020, BR-021, dan M01-F01..F08). Fase 2: 4 fitur M06 (produk, layanan, kategori, riwayat harga, status pajak per item) dengan tes pgTAP BR-007 dan BR-020. Total 70 tes pgTAP lolos dari database kosong.

## Fase aktif

Fase 2 (M06 Katalog dan Harga) SELESAI. Siap memulai Fase 3 (M02 Pelanggan dan Hewan). 12/72 fitur operasional selesai (17%).

## Sedang dikerjakan

(Kosong — Fase 2 selesai. Langkah berikutnya adalah memulai Fase 3 M02.)

Langkah konkret berikutnya:
1. Mulai Fase 3 M02: data pelanggan, profil hewan, pencarian lintas cabang, timeline riwayat, lampiran — dengan tes pgTAP ditulis sebelum kode (BR-003).
2. Setiap aturan BR terkait Fase 3 harus punya tes otomatis yang lolos.
3. Update `FITUR.md`, `ATURAN-BISNIS.md`, `STATUS.md` di commit yang sama.
4. Commit Fase 3 setelah definisi selesai terpenuhi.

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

## Langkah berikutnya

1. Mulai Fase 3 M02 Pelanggan dan Hewan: data pelanggan, profil hewan, pencarian lintas cabang, timeline riwayat, lampiran — dengan tes pgTAP ditulis sebelum kode (BR-003).
2. Setiap aturan BR terkait Fase 3 harus punya tes otomatis yang lolos.
3. Update `FITUR.md`, `ATURAN-BISNIS.md`, `STATUS.md` di commit yang sama.
4. Commit Fase 3 setelah definisi selesai terpenuhi.
