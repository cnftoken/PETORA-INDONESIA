-- Tes M01-F05: Permission dan templat Staff
-- Permission per kelompok sesuai matriks BRIEF bagian 3.
-- Templat Resepsionis, Kasir, Perawat, Gudang.
-- Pengguna tanpa permission tidak melihat menunya dan ditolak di database.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into permissions (group_name, permission_key, description)
values
  ('Pengaturan organisasi, pajak, pengguna, permission', 'org.kelola', 'Mengelola organisasi, pajak, pengguna, dan permission'),
  ('Pelanggan dan hewan', 'customer.lihat', 'Melihat data pelanggan dan hewan'),
  ('Stok dan batch', 'stok.kelola', 'Mengelola stok dan batch')
on conflict (group_name, permission_key) do update set description = excluded.description;

insert into users (id, email, full_name, role_id)
values
  ('00000000-0000-0000-0000-000000000300', 'staff.no-perm@petora.id', 'Staff Tanpa Permission',
   (select id from roles where code = 'staff'))
on conflict (id) do update set role_id = excluded.role_id;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values ('00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000010', true)
on conflict (user_id, branch_id) do update set is_primary = excluded.is_primary;

-- Simulasi sesi staff tanpa permission
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

SELECT plan(3);

-- Staff tanpa permission org.kelola → false
select is(
  user_has_permission('00000000-0000-0000-0000-000000000300', 'org.kelola', '00000000-0000-0000-0000-000000000010'),
  false,
  'Staff tanpa permission org.kelola ditolak (false)'
);

-- Kembali ke superuser untuk beri permission
reset role;
insert into user_permissions (user_id, permission_id, branch_id, granted)
select
  '00000000-0000-0000-0000-000000000300',
  p.id,
  '00000000-0000-0000-0000-000000000010',
  true
from permissions p where p.permission_key = 'org.kelola'
on conflict (user_id, permission_id, branch_id) do update set granted = excluded.granted;

-- Simulasi sesi staff dengan permission
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

-- Staff dengan permission org.kelola → true
select is(
  user_has_permission('00000000-0000-0000-0000-000000000300', 'org.kelola', '00000000-0000-0000-0000-000000000010'),
  true,
  'Staff dengan permission org.kelola diizinkan (true)'
);

-- Permission di cabang lain → false
select is(
  user_has_permission('00000000-0000-0000-0000-000000000300', 'org.kelola', '00000000-0000-0000-0000-000000000020'),
  false,
  'Permission tidak berlaku di cabang lain (false)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
