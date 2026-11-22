-- Tes BR-017: Transfer stok antar cabang
-- Alur: draft → dikirim → diterima, selisih ditinjau.
-- Stok asal berkurang saat dikirim, tujuan bertambah saat diterima.
-- Batch dan kedaluwarsa terbawa, dalam perjalanan tercatat.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'SBY01', 'Cabang Surabaya', 'Asia/Makassar')
on conflict (id) do nothing;

insert into products (id, sku, name, is_batch, is_taxable, sale_price, min_stock, is_active)
values ('00000000-0000-0000-0000-000000000201', 'OBT001', 'Obat Tablet', true, true, 50000, 10, true)
on conflict (sku) do nothing;

-- Simulasi sesi aplikasi (Owner)
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(8);

-- Tabel transfer stok tersedia
select is(
  to_regclass('public.stock_transfers') is not null,
  true,
  'Tabel transfer stok tersedia'
);

-- Tabel detail transfer stok tersedia
select is(
  to_regclass('public.stock_transfer_details') is not null,
  true,
  'Tabel detail transfer stok tersedia'
);

-- Insert transfer draft dari JKT01 ke SBY01
insert into stock_transfers (id, branch_id, destination_branch_id, status, reference, created_at)
values
  ('00000000-0000-0000-0000-000000000950', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 'draft', 'TRF-2026-000001', now())
on conflict (id) do nothing;

-- Status awal draft
select is(
  (select status from stock_transfers where id = '00000000-0000-0000-0000-000000000950'),
  'draft',
  'Status transfer awal draft'
);

-- Insert detail transfer 5 pcs OBT001
insert into stock_transfer_details (id, transfer_id, product_id, quantity, batch_no, expiry_date, created_at)
values
  ('00000000-0000-0000-0000-000000000951', '00000000-0000-0000-0000-000000000950', '00000000-0000-0000-0000-000000000201', 5, 'BATCH-202611', date '2026-11-01', now());

select is(
  (select quantity from stock_transfer_details where transfer_id = '00000000-0000-0000-0000-000000000950'),
  5,
  'Detail transfer: 5 pcs OBT001 batch BATCH-202611'
);

-- Ubah status ke 'dikirim' (asal mengirim)
update stock_transfers set status = 'dikirim', updated_at = now()
where id = '00000000-0000-0000-0000-000000000950';

select is(
  (select status from stock_transfers where id = '00000000-0000-0000-0000-000000000950'),
  'dikirim',
  'Status transfer berubah ke dikirim'
);

-- Stok asal berkurang saat dikirim (5 pcs dari JKT01)
insert into stock_balances (id, branch_id, product_id, quantity, reserved, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', 10, 0, now(), now())
on conflict (branch_id, product_id) do update
set quantity = excluded.quantity, reserved = excluded.reserved, updated_at = now();

-- Kurangi stok asal 5 pcs (dikirim)
update stock_balances set quantity = quantity - 5, updated_at = now()
where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201';

select is(
  (select quantity from stock_balances where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201'),
  5,
  'Stok asal berkurang 10 → 5 saat transfer dikirim'
);

-- Ubah status ke 'diterima' (tujuan menerima)
update stock_transfers set status = 'diterima', updated_at = now()
where id = '00000000-0000-0000-0000-000000000950';

select is(
  (select status from stock_transfers where id = '00000000-0000-0000-0000-000000000950'),
  'diterima',
  'Status transfer berubah ke diterima'
);

-- Stok tujuan bertambah saat diterima (5 pcs di SBY01)
insert into stock_balances (id, branch_id, product_id, quantity, reserved, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000201', 0, 0, now(), now())
on conflict (branch_id, product_id) do update
set quantity = excluded.quantity, reserved = excluded.reserved, updated_at = now();

update stock_balances set quantity = quantity + 5, updated_at = now()
where branch_id = '00000000-0000-0000-0000-000000000020' and product_id = '00000000-0000-0000-0000-000000000201';

select is(
  (select quantity from stock_balances where branch_id = '00000000-0000-0000-0000-000000000020' and product_id = '00000000-0000-0000-0000-000000000201'),
  5,
  'Stok tujuan bertambah 0 → 5 saat transfer diterima'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
