insert into public.branches (code, name, timezone) values
  ('JKT01', 'PETORA Jakarta', 'Asia/Jakarta'),
  ('MKS01', 'PETORA Makassar', 'Asia/Makassar'),
  ('JYP01', 'PETORA Jayapura', 'Asia/Jayapura')
on conflict (code) do nothing;

insert into public.catalog_categories (name) values
  ('Obat'),
  ('Produk Klinik'),
  ('Pet Shop'),
  ('Pelayanan')
on conflict (name) do nothing;

insert into public.products (sku, name, category_id, unit, sale_price, taxable, tracked_by_batch, tracked_by_expiry)
select 'OBT-001', 'Amoxicillin 250 mg', id, 'tablet', 22000, true, true, true
from public.catalog_categories where name = 'Obat'
on conflict (sku) do nothing;

insert into public.services (code, name, category_id, price, taxable, performer)
select 'SRV-KNS', 'Konsultasi Dokter', id, 75000, true, 'doctor'
from public.catalog_categories where name = 'Pelayanan'
on conflict (code) do nothing;
insert into public.company (name) values ('PETORA')
on conflict do nothing;
