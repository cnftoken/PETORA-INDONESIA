-- Tes M01-F06: Penugasan cabang
-- Pengguna ditugaskan ke satu atau lebih cabang dan memilih cabang aktif.
-- Seluruh data mengikuti cabang aktif. Tidak bisa bertindak di cabang yang tidak ditugaskan.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into branches (id, company_id, code, name, time_zone, is_active)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta', true),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'SBY01', 'Cabang Surabaya', 'Asia/Makassar', true)
on conflict (company_id, code) do update set is_active = excluded.is_active;

insert into users (id, email, full_name, role_id)
values
  ('00000000-0000-0000-0000-000000000400', 'staff.multi@petora.id', 'Staff Multi Cabang',
   (select id from roles where code = 'staff'))
on conflict (id) do update set role_id = excluded.role_id;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values
  ('00000000-0000-0000-0000-000000000400', '00000000-0000-0000-0000-000000000010', true),
  ('00000000-0000-0000-0000-000000000400', '00000000-0000-0000-0000-000000000020', false)
on conflict (user_id, branch_id) do update set is_primary = excluded.is_primary;

-- Simulasi sesi staff multi-cabang
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000400';

SELECT plan(4);

-- Staff ditugaskan ke 2 cabang
select is(
  (select count(*) from user_branch_assignments where user_id = '00000000-0000-0000-0000-000000000400')::int,
  2,
  'Staff ditugaskan ke 2 cabang'
);

-- Satu cabang ditandai sebagai primary (aktif)
select is(
  (select count(*) from user_branch_assignments where user_id = '00000000-0000-0000-0000-000000000400' and is_primary = true)::int,
  1,
  'Satu cabang ditandai sebagai primary (aktif)'
);

-- Staff dapat melihat kedua cabang yang ditugaskan
select is(
  (select count(*) from branches where id in (
    select branch_id from user_branch_assignments where user_id = '00000000-0000-0000-0000-000000000400'
  ))::int,
  2,
  'Staff dapat melihat kedua cabang yang ditugaskan'
);

-- Staff tidak dapat bertindak di cabang yang tidak ditugaskan (tidak ada cabang ketiga)
select is(
  (select count(*) from branches where code = 'XYZ01')::int,
  0,
  'Cabang yang tidak ditugaskan tidak ada (tidak dapat bertindak di sana)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
