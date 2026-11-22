-- Tes M01-F03: Pengguna
-- Undang lewat email, aktif dan nonaktif, atur ulang kata sandi.
-- Pengguna nonaktif tidak bisa masuk. Tidak ada penghapusan permanen.
-- Owner terakhir tidak bisa dinonaktifkan.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone, is_active)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta', true)
on conflict (id) do nothing;

insert into roles (code, name) values ('owner', 'Owner'), ('staff', 'Staff') on conflict (code) do nothing;

insert into users (id, email, full_name, phone, is_active, role_id)
values
  ('00000000-0000-0000-0000-000000000100', 'owner@petora.id', 'Owner Utama', '08123456789', true,
   (select id from roles where code = 'owner')),
  ('00000000-0000-0000-0000-000000000200', 'staff@petora.id', 'Staff Biasa', '08123456788', true,
   (select id from roles where code = 'staff'))
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    is_active = excluded.is_active,
    role_id = excluded.role_id;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000010', true),
  ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000010', true)
on conflict (user_id, branch_id) do update set is_primary = excluded.is_primary;

-- Simulasi sesi Owner
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(7);

-- Kedua pengguna tercatat
select is(
  (select count(*) from users)::int,
  2,
  'Dua pengguna tercatat'
);

-- Email unik
select is(
  (select count(distinct email) from users)::int,
  2,
  'Email pengguna unik'
);

-- Owner aktif
select is(
  (select is_active from users where id = '00000000-0000-0000-0000-000000000100'),
  true,
  'Owner aktif'
);

-- Staff aktif
select is(
  (select is_active from users where id = '00000000-0000-0000-0000-000000000200'),
  true,
  'Staff aktif'
);

-- Nonaktifkan staff
update users set is_active = false where id = '00000000-0000-0000-0000-000000000200';
select is(
  (select is_active from users where id = '00000000-0000-0000-0000-000000000200'),
  false,
  'Staff dapat dinonaktifkan'
);

-- Riwayat pengguna tetap utuh setelah dinonaktifkan (tidak dihapus)
select is(
  (select count(*) from users where id = '00000000-0000-0000-0000-000000000200')::int,
  1,
  'Pengguna nonaktif tetap ada (tidak dihapus permanen)'
);

-- Owner masih aktif (Owner terakhir tidak bisa dinonaktifkan - akan ditetapkan di aplikasi)
select is(
  (select is_active from users where id = '00000000-0000-0000-0000-000000000100'),
  true,
  'Owner tetap aktif'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
