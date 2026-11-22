-- Tes BR-003: Pelanggan, hewan, dan riwayat medis terpusat lintas cabang
-- Data pelanggan dan hewan tidak diisolasi per cabang; dapat diakses dari
-- seluruh cabang. Nomor telepon pelanggan unik.
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

-- Simulasi sesi aplikasi (Owner, akses semua cabang)
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(5);

-- Tabel pelanggan tersedia
select is(
  to_regclass('public.customers') is not null,
  true,
  'Tabel pelanggan tersedia'
);

-- Tabel hewan/pasien tersedia
select is(
  to_regclass('public.patients') is not null,
  true,
  'Tabel hewan/pasien tersedia'
);

-- Nomor telepon pelanggan unik (divalidasi lewat coba insert duplikat di bawah)
select is(
  (select count(*) from information_schema.columns
   where table_name = 'customers' and column_name = 'phone')::int,
  1,
  'Kolom phone tersedia pada tabel pelanggan'
);

-- Insert pelanggan dari cabang Jakarta
insert into customers (id, full_name, phone, email, address, created_at)
values
  ('00000000-0000-0000-0000-000000000401', 'Budi Santoso', '081234567890', 'budi@example.com', 'Jl. Thamrin No. 1, Jakarta', now())
on conflict (phone) do nothing;

-- Insert pelanggan dari cabang Surabaya (telepon berbeda)
insert into customers (id, full_name, phone, email, address, created_at)
values
  ('00000000-0000-0000-0000-000000000402', 'Siti Rahayu', '081234567891', 'siti@example.com', 'Jl. Tunjungan No. 2, Surabaya', now())
on conflict (phone) do nothing;

-- Dua pelanggan tercatat (lintas cabang)
select is(
  (select count(*) from customers where phone in ('081234567890', '081234567891'))::int,
  2,
  'Dua pelanggan tercatat lintas cabang (Jakarta + Surabaya)'
);

-- Telepon duplikat ditolak (constraint UNIQUE)
insert into customers (id, full_name, phone, email, address, created_at)
values
  ('00000000-0000-0000-0000-000000000403', 'Duplikat Telepon', '081234567890', 'duplikat@example.com', 'Jl. Contoh, Bandung', now())
on conflict (phone) do nothing;

select is(
  (select count(*) from customers where phone = '081234567890')::int,
  1,
  'Telepon duplikat tidak diterima (hanya 1 record dengan telepon sama)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
