-- Tes BR-016: Zona waktu mengikuti lokasi cabang
-- Cabang menyimpan time_zone IANA; pembacaan mengikuti zona cabang
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'SBY01', 'Cabang Surabaya', 'Asia/Makassar'),
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'JPY01', 'Cabang Jayapura', 'Asia/Jayapura')
on conflict (id) do nothing;

-- Simulasi sesi aplikasi (non-superuser) agar RLS berlaku pada tes
set role app_user;
set row_security = on;

SELECT plan(3);

set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

-- Setiap cabang punya zona waktu yang valid
select is(
  (select time_zone from branches where code = 'JKT01'),
  'Asia/Jakarta',
  'Cabang Jakarta menggunakan zona Asia/Jakarta'
);
select is(
  (select time_zone from branches where code = 'SBY01'),
  'Asia/Makassar',
  'Cabang Surabaya menggunakan zona Asia/Makassar'
);
select is(
  (select time_zone from branches where code = 'JPY01'),
  'Asia/Jayapura',
  'Cabang Jayapura menggunakan zona Asia/Jayapura'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
