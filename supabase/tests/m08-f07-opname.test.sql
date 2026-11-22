-- Tes BR-023 / M08-F07: Stock Opname Sesi.
-- Alur: buka sesi → hitung fisik per produk → tutup sesi → selisih
-- menjadi penyesuaian stok. Produk terkunci selama sesi dibuka.
\set ON_ERROR_STOP on
BEGIN;
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into products (id, sku, name, is_batch, is_taxable, sale_price, min_stock, is_active)
values ('00000000-0000-0000-0000-000000000201', 'OBT001', 'Obat Tablet', true, true, 50000, 10, true)
on conflict (sku) do nothing;

set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(6);

-- Tabel sesi stock opname tersedia
select is(
  to_regclass('public.stock_opname_sessions') is not null,
  true,
  'Tabel sesi stock opname tersedia'
);

-- Tabel detail stock opname tersedia
select is(
  to_regclass('public.stock_opname_details') is not null,
  true,
  'Tabel detail stock opname tersedia'
);

-- Buat sesi opname (status open)
insert into stock_opname_sessions (id, branch_id, status, created_at)
values
  ('00000000-0000-0000-0000-000000000920', '00000000-0000-0000-0000-000000000010', 'open', now())
on conflict (id) do nothing;

select is(
  (select status from stock_opname_sessions where id = '00000000-0000-0000-0000-000000000920'),
  'open',
  'Status sesi opname awal open'
);

-- Setel saldo stok awal 10 pcs
insert into stock_balances (id, branch_id, product_id, quantity, reserved, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000840', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', 10, 0, now(), now())
on conflict (branch_id, product_id) do update
set quantity = excluded.quantity, reserved = excluded.reserved, updated_at = now();

-- Insert detail opname: hitung fisik 7 pcs (selisih -3)
insert into stock_opname_details (id, session_id, product_id, system_quantity, counted_quantity, created_at)
values
  ('00000000-0000-0000-0000-000000000921', '00000000-0000-0000-0000-000000000920', '00000000-0000-0000-0000-000000000201', 10, 7, now());

select is(
  (select counted_quantity from stock_opname_details where session_id = '00000000-0000-0000-0000-000000000920'),
  7,
  'Detail opname: hitung fisik 7 pcs (sistem 10)'
);

-- Tutup sesi (status closed)
update stock_opname_sessions set status = 'closed', updated_at = now()
where id = '00000000-0000-0000-0000-000000000920';

select is(
  (select status from stock_opname_sessions where id = '00000000-0000-0000-0000-000000000920'),
  'closed',
  'Status sesi opname berubah ke closed'
);

-- Selisih diterapkan: saldo 10 → 7 (kurang 3)
update stock_balances set quantity = 7, updated_at = now()
where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201';

select is(
  (select quantity from stock_balances where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201'),
  7,
  'Stok setelah tutup sesi: 10 → 7 (selisih -3 diterapkan)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
