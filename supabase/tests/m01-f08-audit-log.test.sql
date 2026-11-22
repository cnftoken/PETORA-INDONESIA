-- Tes M01-F08: Log audit
-- Penampil hanya-baca dengan filter pengguna, cabang, entitas, dan rentang waktu.
-- Mencakup semua perubahan. Tidak bisa diubah atau dihapus lewat aplikasi.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone, is_active)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta', true)
on conflict (id) do nothing;

insert into roles (code, name) values ('owner', 'Owner') on conflict (code) do nothing;

insert into users (id, email, full_name, role_id)
values
  ('00000000-0000-0000-0000-000000000100', 'owner@petora.id', 'Owner Utama',
   (select id from roles where code = 'owner'))
on conflict (id) do update set role_id = excluded.role_id;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000010', true)
on conflict (user_id, branch_id) do update set is_primary = excluded.is_primary;

-- Simulasi sesi Owner
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(4);

-- Update cabang (trigger audit akan menulis audit_logs)
update branches set name = 'Cabang Jakarta Baru' where id = '00000000-0000-0000-0000-000000000010';

-- Audit log tertulis untuk perubahan cabang
select is(
  (select count(*) from audit_logs where entity = 'branches' and action = 'UPDATE')::int,
  1,
  'Audit log tertulis saat update cabang'
);

-- Audit log mencatat actor, entity, dan nilai baru
select is(
  (select actor_user_id from audit_logs where entity = 'branches' and action = 'UPDATE'),
  '00000000-0000-0000-0000-000000000100',
  'Audit log mencatat actor_user_id'
);
select is(
  (select new_values->>'name' from audit_logs where entity = 'branches' and action = 'UPDATE'),
  'Cabang Jakarta Baru',
  'Audit log mencatat new_values'
);

-- Audit log tidak bisa diubah lewat aplikasi (policy UPDATE = false)
select is(
  (select count(*) from pg_policies where tablename = 'audit_logs' and policyname = 'audit_logs_update')::int,
  1,
  'Policy audit_logs_update ada (membatasi perubahan lewat aplikasi)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
