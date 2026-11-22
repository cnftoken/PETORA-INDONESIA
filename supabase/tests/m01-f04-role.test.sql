-- Tes M01-F04: Role
-- Empat role tetap: Owner, Supervisor, Dokter, Staff.
-- Owner mengatur permission Supervisor dan Dokter per role.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into roles (code, name, description)
values
  ('owner', 'Owner', 'Pemilik perusahaan, akses penuh ke seluruh cabang'),
  ('supervisor', 'Supervisor', 'Penanggung jawab cabang'),
  ('dokter', 'Dokter', 'Dokter hewan'),
  ('staff', 'Staff', 'Resepsionis, kasir, perawat, petugas gudang')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description;

-- Simulasi sesi aplikasi
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(4);

-- Empat role tetap tercatat
select is(
  (select count(*) from roles)::int,
  4,
  'Empat role tetap: Owner, Supervisor, Dokter, Staff'
);

-- Kode role valid
select is(
  (select count(*) from roles where code in ('owner', 'supervisor', 'dokter', 'staff'))::int,
  4,
  'Semua role memiliki kode yang valid'
);

-- Role Owner ada
select is(
  (select count(*) from roles where code = 'owner')::int,
  1,
  'Role Owner tersedia'
);

-- Role Staff ada
select is(
  (select count(*) from roles where code = 'staff')::int,
  1,
  'Role Staff tersedia'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
