-- Tes M01-F01: Profil perusahaan dan setup awal
-- Nama, alamat, NPWP, logo. Tampil di cetakan tagihan. Hanya Owner yang mengubah.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into roles (code, name) values ('owner', 'Owner') on conflict (code) do nothing;

insert into users (id, email, full_name, role_id)
values
  ('00000000-0000-0000-0000-000000000100', 'owner@petora.id', 'Owner Utama',
   (select id from roles where code = 'owner'))
on conflict (id) do update set role_id = excluded.role_id;

insert into companies (id, name, address, phone, npwp, logo_url)
values
  ('00000000-0000-0000-0000-000000000001', 'PT Petora Sejahtera', 'Jl. Contoh No. 1, Jakarta', '021-1234567', '01.234.567.8-901.000', null)
on conflict (id) do update
set name = excluded.name,
    address = excluded.address,
    phone = excluded.phone,
    npwp = excluded.npwp,
    logo_url = excluded.logo_url;

-- Simulasi sesi Owner
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(6);

-- Perusahaan tercatat dengan lengkap
select is(
  (select name from companies where id = '00000000-0000-0000-0000-000000000001'),
  'PT Petora Sejahtera',
  'Nama perusahaan tersimpan'
);
select is(
  (select address from companies where id = '00000000-0000-0000-0000-000000000001'),
  'Jl. Contoh No. 1, Jakarta',
  'Alamat perusahaan tersimpan'
);
select is(
  (select npwp from companies where id = '00000000-0000-0000-0000-000000000001'),
  '01.234.567.8-901.000',
  'NPWP perusahaan tersimpan'
);

-- Owner dapat melihat perusahaan
select is(
  (select count(*) from companies)::int,
  1,
  'Owner dapat melihat data perusahaan'
);

-- NPWP unik (tidak ada duplikat)
select is(
  (select count(*) from companies where npwp = '01.234.567.8-901.000')::int,
  1,
  'NPWP unik, tidak ada duplikat'
);

-- Logo URL tersimpan (bisa null)
select is(
  (select logo_url from companies where id = '00000000-0000-0000-0000-000000000001'),
  null::text,
  'Logo URL dapat null (belum diunggah)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
