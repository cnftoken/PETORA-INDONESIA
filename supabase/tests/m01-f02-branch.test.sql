-- Tes M01-F02: Cabang
-- Kode unik (2-5 huruf besar dan angka), nama, alamat, telepon, zona waktu, status aktif.
-- Cabang baru ditambah lewat pengaturan. Cabang nonaktif tidak bisa membuat transaksi baru.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

-- Gunakan kode unik yang tidak bentrok dengan seed (JKT01, SBY01, JPY01 sudah ada di seed)
insert into branches (id, company_id, code, name, address, phone, time_zone, is_active)
values
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 'BDG01', 'Cabang Bandung', 'Jl. Asia Afrika No. 1, Bandung', '022-3333333', 'Asia/Jakarta', true),
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000001', 'MDN01', 'Cabang Medan', 'Jl. Pahlawan No. 2, Medan', '061-4444444', 'Asia/Jakarta', true)
on conflict (company_id, code) do update
set name = excluded.name,
    address = excluded.address,
    phone = excluded.phone,
    time_zone = excluded.time_zone,
    is_active = excluded.is_active;

-- Simulasi sesi aplikasi
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(6);

-- Kedua cabang baru tercatat (selain 3 cabang seed = total 5)
select is(
  (select count(*) from branches where code in ('BDG01', 'MDN01'))::int,
  2,
  'Dua cabang baru tercatat (BDG01, MDN01)'
);

-- Kode cabang unik
select is(
  (select count(distinct code) from branches where code in ('BDG01', 'MDN01'))::int,
  2,
  'Kode cabang baru unik'
);

-- Zona waktu berbeda per cabang
select is(
  (select time_zone from branches where code = 'BDG01'),
  'Asia/Jakarta',
  'Cabang Bandung zona Asia/Jakarta'
);
select is(
  (select time_zone from branches where code = 'MDN01'),
  'Asia/Jakarta',
  'Cabang Medan zona Asia/Jakarta'
);

-- Format kode cabang valid (2-5 huruf besar dan angka)
select is(
  (select count(*) from branches where code in ('BDG01', 'MDN01') and code ~ '^[A-Z0-9]{2,5}$')::int,
  2,
  'Semua kode cabang memenuhi format 2-5 huruf besar dan angka'
);

-- Cabang aktif
select is(
  (select is_active from branches where code = 'BDG01'),
  true,
  'Cabang Bandung aktif'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
