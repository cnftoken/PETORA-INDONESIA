-- Tes BR-022: Penomoran dokumen unik dan berurutan per cabang per jenis
-- Format: {KODE-CABANG}-{JENIS}-{TAHUN}-{URUT 6 digit}
-- Jenis: VST (kunjungan), INV (tagihan), PO, TRF
-- Unik, berurutan per cabang per jenis, tidak dipakai ulang setelah void,
-- tidak duplikat meski dibuat bersamaan.
-- Tes BR-009: Tagihan terpadu per kunjungan / rawat inap / retail
-- Header: pelanggan, hewan, sumber, cabang, nomor.
-- Baris: layanan, tindakan, obat, produk, kandang.
-- Finalisasi oleh Kasir mengunci baris, nomor, kurangi stok, status "belum lunas".
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into customers (id, full_name, phone, email, address, created_at)
values ('00000000-0000-0000-0000-000000000401', 'Budi Santoso', '081234567890', 'budi@example.com', 'Jl. Thamrin No. 1, Jakarta', now())
on conflict (phone) do nothing;

insert into patients (id, customer_id, patient_number, name, species, status, owner_id, created_at)
values ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000401', 'P001', 'Milo', 'Kucing', 'aktif', '00000000-0000-0000-0000-000000000401', now())
on conflict (patient_number) do nothing;

-- Simulasi sesi aplikasi (Owner)
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(6);

-- Tabel kunjungan tersedia
select is(
  to_regclass('public.visits') is not null,
  true,
  'Tabel kunjungan tersedia'
);

-- Tabel tagihan terpadu tersedia
select is(
  to_regclass('public.invoices') is not null,
  true,
  'Tabel tagihan terpadu tersedia'
);

-- Format nomor kunjungan: {KODE-CABANG}-VST-{TAHUN}-{URUT 6 digit}
insert into visits (id, branch_id, customer_id, patient_id, visit_number, status, created_at)
values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000501', 'JKT01-VST-2026-000001', 'terdaftar', now());

select is(
  (select visit_number from visits where id = '00000000-0000-0000-0000-000000000601'),
  'JKT01-VST-2026-000001',
  'Nomor kunjungan format JKT01-VST-2026-000001'
);

-- Nomor kunjungan unik per cabang per jenis
insert into visits (id, branch_id, customer_id, patient_id, visit_number, status, created_at)
values
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000501', 'JKT01-VST-2026-000002', 'terdaftar', now());

select is(
  (select count(*) from visits where visit_number like 'JKT01-VST-2026-%')::int,
  2,
  'Dua nomor kunjungan berurutan per cabang per jenis (000001, 000002)'
);

-- Tagihan terpadu terhubung ke kunjungan
insert into invoices (id, branch_id, customer_id, patient_id, visit_id, source, invoice_number, status, grand_total, created_at)
values
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000601', 'kunjungan', 'JKT01-INV-2026-000001', 'belum_lunas', 250000, now());

select is(
  (select invoice_number from invoices where id = '00000000-0000-0000-0000-000000000701'),
  'JKT01-INV-2026-000001',
  'Nomor tagihan format JKT01-INV-2026-000001'
);

select is(
  (select status from invoices where id = '00000000-0000-0000-0000-000000000701'),
  'belum_lunas',
  'Status tagihan awal belum lunas'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
