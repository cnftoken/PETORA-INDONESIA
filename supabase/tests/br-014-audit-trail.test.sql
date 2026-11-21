-- Tes BR-014: Jejak audit
-- Perubahan pada users dicatat di audit_logs dengan nilai lama dan baru
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into roles (code, name) values ('owner', 'Owner') on conflict (code) do nothing;

insert into users (id, email, full_name, role_id)
values
  ('00000000-0000-0000-0000-000000000050', 'owner@example.com', 'Owner Awal',
   (select id from roles where code = 'owner'))
on conflict (id) do update set full_name = excluded.full_name, role_id = excluded.role_id;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000010', true)
on conflict (user_id, branch_id) do update set is_primary = excluded.is_primary;

-- Simulasi sesi aplikasi (non-superuser) agar RLS berlaku pada tes
set role app_user;
set row_security = on;

SELECT plan(5);

set jwt.claims.sub = '00000000-0000-0000-0000-000000000050';

-- Update user (trigger audit berjalan sebagai security definer = postgres)
update users set full_name = 'Owner Akhir' where id = '00000000-0000-0000-0000-000000000050';

-- Audit log tertulis
select is(
  (select count(*) from audit_logs where entity = 'users' and action = 'UPDATE')::int,
  1,
  'Audit log tertulis saat update users'
);

-- Nilai lama dan baru tertarik
select is(
  (select old_values->>'full_name' from audit_logs where entity = 'users' and action = 'UPDATE'),
  'Owner Awal',
  'Audit log mencatat old_values.full_name'
);
select is(
  (select new_values->>'full_name' from audit_logs where entity = 'users' and action = 'UPDATE'),
  'Owner Akhir',
  'Audit log mencatat new_values.full_name'
);

-- Actor dan branch tertangkap
select is(
  (select actor_user_id from audit_logs where entity = 'users' and action = 'UPDATE'),
  '00000000-0000-0000-0000-000000000050',
  'Audit log mencatat actor_user_id'
);
select is(
  (select branch_id from audit_logs where entity = 'users' and action = 'UPDATE'),
  '00000000-0000-0000-0000-000000000010',
  'Audit log mencatat branch_id'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
