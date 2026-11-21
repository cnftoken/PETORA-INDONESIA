-- Tes BR-002: Akses berbasis role dan permission
-- Pengguna tanpa permission ditolak di database; dengan permission diizinkan
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser (postgres)
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into roles (code, name) values ('staff', 'Staff') on conflict (code) do nothing;

insert into permissions (group_name, permission_key) values
  ('Stok dan batch', 'stok.lihat')
on conflict (group_name, permission_key) do nothing;

insert into users (id, email, full_name, role_id)
values ('00000000-0000-0000-0000-000000000050', 'staff@example.com', 'Staff Tanpa Permission',
   (select id from roles where code = 'staff'))
on conflict (id) do update set role_id = excluded.role_id;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000010', true)
on conflict (user_id, branch_id) do update set is_primary = excluded.is_primary;

-- Simulasi sesi aplikasi (non-superuser) agar RLS berlaku pada tes
set role app_user;
set row_security = on;

SELECT plan(3);

set jwt.claims.sub = '00000000-0000-0000-0000-000000000050';

-- Tanpa permission stok.lihat -> false
select is(
  user_has_permission('00000000-0000-0000-0000-000000000050', 'stok.lihat', '00000000-0000-0000-0000-000000000010'),
  false,
  'Staff tanpa permission stok.lihat mengembalikan false'
);

-- Kembali superuser untuk memberi permission (aksi Owner)
reset role;
insert into user_permissions (user_id, permission_id, branch_id, granted)
select
  '00000000-0000-0000-0000-000000000050',
  p.id,
  '00000000-0000-0000-0000-000000000010',
  true
from permissions p where p.permission_key = 'stok.lihat'
on conflict (user_id, permission_id, branch_id) do update set granted = excluded.granted;

-- Kembali ke sesi staff untuk verifikasi
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000050';

-- Dengan permission stok.lihat -> true
select is(
  user_has_permission('00000000-0000-0000-0000-000000000050', 'stok.lihat', '00000000-0000-0000-0000-000000000010'),
  true,
  'Staff dengan permission stok.lihat mengembalikan true'
);

-- Permission di cabang lain -> false
select is(
  user_has_permission('00000000-0000-0000-0000-000000000050', 'stok.lihat', '00000000-0000-0000-0000-000000000020'),
  false,
  'Permission tidak berlaku di cabang lain'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
