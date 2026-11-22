# STATUS: PETORA

## Gambaran besar

Proyek PETORA telah menyelesaikan Fase 0 (fondasi), Fase 1 (M01 Organisasi dan Akses), Fase 2 (M06 Katalog dan Harga), Fase 3 (M02 Pelanggan dan Hewan), Fase 4 (M03 Pelayanan Klinik, lengkap F01-F06), Fase 5 (M08 Inventori, semua F01-F07 selesai), dan Fase 6 parsial (M04 Rekam Medis dan Vaksinasi, F01 entri medis + BR-004 penguncian entri final, F02 diagnosis dan saran diagnosis). Fase 0: repositori, konfigurasi build, CI workflow, struktur `src/`, sistem desain (`src/ui`), skema dasar database dengan RLS + audit, seed dasar, dan 4 tes pgTAP (BR-001, BR-002, BR-014, BR-016). Fase 1: seluruh 8 fitur M01 diimplementasi dengan 11 tes pgTAP (menambah BR-020, BR-021, dan M01-F01..F08). Fase 2: 4 fitur M06 (produk, layanan, kategori, riwayat harga, status pajak per item) dengan tes pgTAP BR-007 dan BR-020. Fase 3: 3 fitur M02 (data pelanggan, pencarian lintas cabang, profil hewan) dengan tes pgTAP BR-003. Fase 4: 6 fitur M03 (pendaftaran kunjungan, antrean, pemeriksaan, resep dengan integrasi stok, perubahan status kunjungan, daftar kunjungan) dengan tes pgTAP BR-022, BR-009, dan validasi transisi status. Fase 5: 7 fitur M08 (saldo stok per cabang, batch dan kedaluwarsa/FEOF, kartu stok, transfer antar cabang, penyesuaian stok dengan approval, peringatan stok minimum & kedaluwarsa, stock opname sesi) dengan tes pgTAP BR-006, BR-024, BR-017, BR-006 (approval), BR-007, dan BR-023. Fase 6: M04-F01 entri medis dengan tes pgTAP BR-004, M04-F02 diagnosis dan saran diagnosis dengan tes pgTAP `m04-f02-diagnosis`, M04-F03 lampiran medis (JPG/PNG/PDF, maks 10 MB, signed URL, RLS isolasi cabang) dengan tes pgTAP `m04-f03-medical-attachment`. Total 140 tes pgTAP lolos dari database kosong.

## Fase aktif

Fase 6 (M04 Rekam Medis dan Vaksinasi, F01 entri medis + F02 diagnosis dan saran diagnosis + F03 lampiran medis selesai; F04-F08 belum) SELESAI PARSIAL. 31/72 fitur operasional selesai (43%). Autentikasi (login/logout) telah diimplementasikan di luar fase (prasyarat fondasi).

## Sedang dikerjakan

(Kosong — Fase 5 selesai parsial, Fase 6 M04 parsial.)

Langkah konkret berikutnya:
1. Selesaikan sisa M04 (F03 lampiran medis, F04 penguncian entri, F05 addendum, F06 vaksinasi, F07 pengingat booster, F08 tandai dibagikan) atau lanjut ke fase berikutnya.
2. Setiap aturan BR terkait fase berikutnya harus punya tes otomatis yang lolos.
3. Update `FITUR.md`, `ATURAN-BISNIS.md`, `STATUS.md` di commit yang sama.
4. Commit fase setelah definisi selesai terpenuhi.

## Tumpukan jeda

(Kosong)

## Masalah terbuka

(Kosong — login/logout terlewat sudah diperbaiki 2026-11-22.)

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
13. Implementasi Fase 5 M08: migrasi `0005_m08_inventori.sql` (stock_balances, stock_batches, stock_mutations, RLS, audit) dan `0006_m03_f04_stok_integrasi.sql` (branch_id pada resep, fungsi decrement_stock_fifo), skema Zod, queries, actions, client form wrapper, dan halaman Server Component (stock-balance, stock-mutations, stock-opname). Tes pgTAP `m08-f01-f02-stock` (BR-006, BR-024) ditulis sebelum kode dan lolos setelah migrasi. Integrasi M03-F04 resep memanggil decrement_stock_fifo via RPC. Total 87 tes pgTAP lolos.
14. Implementasi M08-F05 transfer stok antar cabang (BR-017): migrasi `0007_m08_f05_transfer_stok.sql` (stock_transfers, stock_transfer_details, RLS, audit), tes pgTAP `m08-f05-transfer` (8 tes), queries (getStockTransfers, getStockTransferById), actions (createStockTransfer, sendStockTransfer, receiveStockTransfer, cancelStockTransfer), UI halaman stock-transfers + StockTransferForm/FormWrapper. Total 95 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
15. Implementasi M08-F03 penyesuaian stok dengan approval flow (BR-006): migrasi `0008_m08_f03_penyesuaian_stok.sql` (stock_adjustments, RLS, audit), tes pgTAP `m08-f03-adjustment` (6 tes), skema Zod (stockAdjustmentApprove/RejectSchema), queries (getStockAdjustments, getStockAdjustmentById), actions (createStockAdjustment, requestApprovalStockAdjustment, approveStockAdjustment, rejectStockAdjustment), UI halaman stock-adjustments + StockAdjustmentApprovalWrapper. Total 101 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
16. Implementasi M08-F06 peringatan stok minimum & kedaluwarsa (BR-007): queries (getStockLowAlerts, getStockExpiryAlerts), UI halaman stock-alerts. Tes pgTAP `m08-f06-peringatan` (3 tes, test-before-code). Total 104 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
17. Implementasi M08-F07 stock opname sesi (BR-023): migrasi `0009_m08_f07_stock_opname.sql` (stock_opname_sessions, stock_opname_details, RLS, audit), tes pgTAP `m08-f07-opname` (6 tes), skema Zod (stockOpnameSession/Count/CloseSchema), queries (getStockOpnameSessions, getStockOpnameSessionById), actions (openStockOpnameSession, countStockOpname, closeStockOpnameSession), UI halaman stock-opname. Total 110 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
18. Implementasi M03-F05 validasi transisi status kunjungan: migrasi `0010_m03_f05_status_transition.sql` (fungsi trg_validate_visit_status_transition + trigger on visits), tes pgTAP `m03-f05-status-transition` (7 tes, test-before-code). Total 117 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
19. Implementasi M03-F02 antrean kunjungan (real-time): tes pgTAP `m03-f02-antrean` (6 tes, test-before-code pada tabel visit_queue yang sudah ada), UI halaman queue dengan tombol Panggil/Lewati/Selesaikan, aksi updateVisitQueue via Server Action. Total 123 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
20. Implementasi M04-F01 entri medis + BR-004 penguncian entri final: migrasi `0011_m04_f01_medical_entry_lock.sql` (fungsi trg_validate_examination_final + trigger on examinations), tes pgTAP `m04-f01-medical-entry` (6 tes, test-before-code), modul medical-records baru dengan schemas, queries (getMedicalEntries, getMedicalEntryById), actions (createMedicalEntry, updateMedicalEntry, finalizeMedicalEntry, addMedicalAddendum), UI halaman medical-records + MedicalEntryForm/FormWrapper. Total 129 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
21. Implementasi M04-F02 diagnosis dan saran diagnosis: Server Action `getDiagnosisSuggestions` di `src/modules/medical-records/actions/index.ts`, query `getDiagnosisSuggestions` di `src/modules/medical-records/queries/index.ts`, UI autocomplete diagnosis di `MedicalEntryForm.tsx`, tes pgTAP `m04-f02-diagnosis` (4 tes, test-before-code). Total 133 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.
22. Implementasi autentikasi login/logout (prasyarat fondasi, terlewat dari Fase 0-5): halaman `/login` (form email+password min 10, Zod + React Hook Form), Server Action `signIn` (redirect ke `/login?error=...` bila gagal) & `signOut` (redirect ke `/login`), middleware proteksi `/app/*` & `/portal/*` (redirect ke `/login` bila tidak ada sesi, refresh cookie session), tombol logout di header `/app` & `/portal` (LogoutButton dengan Server Action). Verifikasi: typecheck, lint, build — semua lolos. Catatan: tes pgTAP untuk autentikasi belum dibuat (requires Supabase Auth setup).
23. Implementasi M04-F03 lampiran medis: migrasi `0012_m04_f03_medical_attachment.sql` (tabel medical_attachments, RLS isolasi cabang, storage bucket `medical-attachments` private, storage RLS, audit trigger, CHECK file_type JPG/PNG/PDF dan file_size maks 10 MB), tes pgTAP `m04-f03-medical-attachment` (7 tes, test-before-code), skema Zod `medicalAttachmentSchema`, queries (getMedicalAttachments, getMedicalAttachmentById), Server Actions (uploadMedicalAttachment, getMedicalAttachmentSignedUrl, deleteMedicalAttachment, getMedicalAttachmentsAction), UI (MedicalAttachmentUpload, MedicalAttachmentList) di MedicalEntryFormWrapper. Total 140 tes pgTAP lolos. Verifikasi: typecheck, lint (warning pre-existing), build, pgTAP — semua lolos.

## Langkah berikutnya

1. Lanjut sisa M04 (F04 penguncian entri, F05 addendum, F06 vaksinasi, F07 pengingat booster, F08 tandai dibagikan) dengan tes pgTAP ditulis sebelum kode.
2. Setiap aturan BR terkait fase berikutnya harus punya tes otomatis yang lolos.
3. Update `FITUR.md`, `ATURAN-BISNIS.md`, `STATUS.md` di commit yang sama.
4. Commit fase setelah definisi selesai terpenuhi.
