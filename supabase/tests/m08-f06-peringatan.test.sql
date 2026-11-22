-- Tes BR-007 / M08-F06: Peringatan stok minimum dan batch kedaluwarsa.
-- Stok di bawah min_stock ditandai peringatan. Batch kedaluwarsa dalam 30 hari
-- dengan quantity > 0 ditandai peringatan. FEFO: kedaluwarsa terdekat dulu.
\set ON_ERROR_STOP on
BEGIN;
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into products (id, sku, name, is_batch, is_taxable, sale_price, min_stock, is_active)
values
  ('00000000-0000-0000-0000-000000000201', 'OBT001', 'Obat Tablet', true, true, 50000, 10, true),
  ('00000000-0000-0000-0000-000000000202', 'OBT002', 'Obat Sirup', true, true, 75000, 5, true)
on conflict (sku) do nothing;

set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(3);

-- Produk di bawah stok minimum (OBT001 min_stock=10, saldo=3 → peringatan)
insert into stock_balances (id, branch_id, product_id, quantity, reserved, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000820', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', 3, 0, now(), now())
on conflict (branch_id, product_id) do update
set quantity = excluded.quantity, reserved = excluded.reserved, updated_at = now();

-- Produk di atas stok minimum (OBT002 min_stock=5, saldo=8 → tidak peringatan)
insert into stock_balances (id, branch_id, product_id, quantity, reserved, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000821', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000202', 8, 0, now(), now())
on conflict (branch_id, product_id) do update
set quantity = excluded.quantity, reserved = excluded.reserved, updated_at = now();

-- Query produk di bawah stok minimum harus mengembalikan OBT001 (1 baris)
select is(
  (select count(*) from stock_balances sb
   join products p on p.id = sb.product_id
   where sb.branch_id = '00000000-0000-0000-0000-000000000010'
     and sb.quantity < p.min_stock
     )::int,
  1,
  'BR-007: 1 produk di bawah stok minimum (OBT001: 3 < 10)'
);

-- Batch kedaluwarsa dalam 30 hari dengan quantity > 0 → peringatan
insert into stock_batches (id, branch_id, product_id, batch_no, expiry_date, quantity, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000830', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', 'BATCH-SOON', (current_date + interval '10 days')::date, 5, now(), now()),
  ('00000000-0000-0000-0000-000000000831', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', 'BATCH-LATE', (current_date + interval '60 days')::date, 10, now(), now());

-- Batch kedaluwarsa dalam 30 hari: hanya BATCH-SOON (1 baris)
select is(
  (select count(*) from stock_batches
   where branch_id = '00000000-0000-0000-0000-000000000010'
     and quantity > 0
     and expiry_date <= (current_date + interval '30 days')::date
     and expiry_date >= current_date
     )::int,
  1,
  'BR-007: 1 batch kedaluwarsa dalam 30 hari (BATCH-SOON, 10 hari)'
);

-- FEFO: batch kedaluwarsa terdekat dulu (BATCH-SOON sebelum BATCH-LATE)
select is(
  (select batch_no from stock_batches
   where branch_id = '00000000-0000-0000-0000-000000000010'
     and product_id = '00000000-0000-0000-0000-000000000201'
     and quantity > 0
   order by expiry_date asc
   limit 1),
  'BATCH-SOON',
  'BR-007 FEFO: BATCH-SOON (10 hari) sebelum BATCH-LATE (60 hari)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
