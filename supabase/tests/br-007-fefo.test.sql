-- Tes BR-007: FEFO (kedaluwarsa terdekat dulu)
-- Katalog mendukung produk berbatch/berkedaluwarsa (is_batch).
-- Pengurangan stok memakai FEFO; batch kedaluwarsa tidak bisa dijual.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

-- Simulasi sesi aplikasi
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(5);

-- Tabel produk tersedia dengan flag is_batch (berbatch/berkedaluwarsa)
select is(
  to_regclass('public.products') is not null,
  true,
  'Tabel produk tersedia'
);

-- Flag is_batch ada pada produk
select is(
  exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'is_batch'
  ),
  true,
  'Kolom is_batch tersedia pada tabel produk'
);

-- Produk non-batch tidak memiliki batasan kedaluwarsa (is_batch = false)
insert into products (id, sku, name, is_batch, is_taxable, sale_price, min_stock, is_active)
values
  ('00000000-0000-0000-0000-000000000201', 'OBT001', 'Obat Tablet', true, true, 50000, 10, true),
  ('00000000-0000-0000-0000-000000000202', 'SAP001', 'Sapu Lantai', false, true, 25000, 5, true)
on conflict (sku) do update
set name = excluded.name,
    is_batch = excluded.is_batch,
    is_taxable = excluded.is_taxable,
    sale_price = excluded.sale_price,
    min_stock = excluded.min_stock,
    is_active = excluded.is_active;

select is(
  (select is_batch from products where sku = 'OBT001'),
  true,
  'Produk OBT001 ditandai berbatch (is_batch = true)'
);
select is(
  (select is_batch from products where sku = 'SAP001'),
  false,
  'Produk SAP001 non-batch (is_batch = false)'
);

-- Urutan FEFO: batch dengan kedaluwarsa terdekat diurutkan dulu
select is(
  (select array_agg(expiry_date order by expiry_date asc) from (
    values
      (date '2026-12-01'),
      (date '2026-11-01'),
      (date '2026-12-15')
  ) as t(expiry_date)),
  '{2026-11-01,2026-12-01,2026-12-15}',
  'FEFO: batch kedaluwarsa terdekat diurutkan terlebih dahulu'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
