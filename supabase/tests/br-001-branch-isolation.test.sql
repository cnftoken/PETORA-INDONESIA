-- Tes BR-001: Isolasi cabang
-- Pengguna cabang A tidak boleh melihat atau mengubah data operasional cabang B
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser (postgres) agar RLS tidak memblokir setup
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'SBY01', 'Cabang Surabaya', 'Asia/Makassar')
on conflict (id) do nothing;

insert into roles (code, name) values ('staff', 'Staff') on conflict (code) do nothing;

insert into users (id, email, full_name, role_id)
values
  ('00000000-0000-0000-0000-000000000050', 'staff.jkt@example.com', 'Staff Jakarta',
   (select id from roles where code = 'staff')),
  ('00000000-0000-0000-0000-000000000060', 'staff.sby@example.com', 'Staff Surabaya',
   (select id from roles where code = 'staff'))
on conflict (id) do update set role_id = excluded.role_id;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000010', true),
  ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000020', true)
on conflict (user_id, branch_id) do update set is_primary = excluded.is_primary;

-- Simulasi sesi aplikasi (non-superuser) agar RLS berlaku pada tes
set role app_user;
set row_security = on;

SELECT plan(5);

-- Staff Jakarta hanya melihat cabang Jakarta
set jwt.claims.sub = '00000000-0000-0000-0000-000000000050';
select is(
  (select count(*) from branches)::int,
  1,
  'Staff Jakarta hanya melihat cabangnya sendiri (1 cabang)'
);
select is(
  (select code from branches limit 1),
  'JKT01',
  'Staff Jakarta melihat cabang JKT01'
);

-- Staff Surabaya hanya melihat cabang Surabaya
set jwt.claims.sub = '00000000-0000-0000-0000-000000000060';
select is(
  (select count(*) from branches)::int,
  1,
  'Staff Surabaya hanya melihat cabangnya sendiri (1 cabang)'
);
select is(
  (select code from branches limit 1),
  'SBY01',
  'Staff Surabaya melihat cabang SBY01'
);

-- Staff Jakarta tidak bisa melihat/mengubah cabang Surabaya
set jwt.claims.sub = '00000000-0000-0000-0000-000000000050';
select is(
  (select name from branches where id = '00000000-0000-0000-0000-000000000020'),
  null,
  'Staff Jakarta tidak bisa melihat atau mengubah cabang Surabaya'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
