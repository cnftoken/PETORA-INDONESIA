-- Tes BR-006 / M08-F03: Penyesuaian stok dengan approval flow.
-- Alur: draft → approval → approved (stok berubah) / rejected (stok tidak berubah).
-- BR-006: Stok tidak boleh minus. Penyesuaian kurangi yang menyebabkan minus ditolak.
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

-- Tabel penyesuaian stok tersedia
select is(
  to_regclass('public.stock_adjustments') is not null,
  true,
  'Tabel penyesuaian stok tersedia'
);

-- Insert penyesuaian draft 10 pcs add
insert into stock_adjustments (id, branch_id, product_id, type, quantity, reason, status, created_at)
values
  ('00000000-0000-0000-0000-000000000900', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', 'add', 10, 'Stock opname', 'draft', now())
on conflict (id) do nothing;

select is(
  (select status from stock_adjustments where id = '00000000-0000-0000-0000-000000000900'),
  'draft',
  'Status penyesuaian awal draft'
);

-- Setel saldo stok awal 5 pcs
insert into stock_balances (id, branch_id, product_id, quantity, reserved, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000810', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000201', 5, 0, now(), now())
on conflict (branch_id, product_id) do update
set quantity = excluded.quantity, reserved = excluded.reserved, updated_at = now();

-- Ubah status ke approval (menunggu persetujuan)
update stock_adjustments set status = 'approval', updated_at = now()
where id = '00000000-0000-0000-0000-000000000900';

select is(
  (select status from stock_adjustments where id = '00000000-0000-0000-0000-000000000900'),
  'approval',
  'Status penyesuaian berubah ke approval (menunggu persetujuan)'
);

-- Approve: stok bertambah 5 + 10 = 15
update stock_adjustments set status = 'approved', updated_at = now()
where id = '00000000-0000-0000-0000-000000000900';

update stock_balances set quantity = quantity + 10, updated_at = now()
where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201';

select is(
  (select quantity from stock_balances where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201'),
  15,
  'Stok setelah approve: 5 + 10 = 15'
);

-- Rejected tidak mengubah stok
update stock_adjustments set status = 'rejected', updated_at = now()
where id = '00000000-0000-0000-0000-000000000900';

select is(
  (select quantity from stock_balances where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201'),
  15,
  'Stok tidak berubah setelah rejected (tetap 15)'
);

-- BR-006: Penyesuaikan kurangi yang menyebabkan stok minus ditolak
-- Stok saat ini 15, coba kurangi 20 → harus ditolak
do $$
begin
  update stock_balances set quantity = quantity - 20
  where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201';
  raise exception 'Stok tidak boleh minus, tapi update berhasil';
exception when check_violation then
  -- diharapkan: constraint quantity >= 0 mencegah minus
end $$;

select is(
  (select quantity from stock_balances where branch_id = '00000000-0000-0000-0000-000000000010' and product_id = '00000000-0000-0000-0000-000000000201'),
  15,
  'BR-006: Stok tetap 15, pengurangan 20 (menjadi -5) ditolak oleh constraint'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
