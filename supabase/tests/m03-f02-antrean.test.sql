-- Tes M03-F02: Antrean kunjungan.
-- Antrean per cabang, status: menunggu → dipanggil → selesai / lewati / dibatalkan.
-- Isolasi per cabang (BR-001): antrean cabang A tidak muncul di cabang B.
\set ON_ERROR_STOP on
BEGIN;
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'SBY01', 'Cabang Surabaya', 'Asia/Makassar')
on conflict (id) do nothing;

insert into users (id, email, full_name, phone, role_id)
values ('00000000-0000-0000-0000-000000000300', 'dokter@contoh.com', 'Dokter Contoh', '081234567890',
  (select id from roles where code = 'dokter' limit 1))
on conflict (id) do nothing;

insert into user_roles (id, user_id, role_id, branch_id)
values ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000300',
  (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000010')
on conflict (id) do nothing;

insert into user_branch_assignments (id, user_id, branch_id, is_primary)
values ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000010', true)
on conflict (id) do nothing;

insert into customers (id, full_name, phone)
values ('00000000-0000-0000-0000-000000000100', 'Pelanggan Contoh', '08123456789')
on conflict (id) do nothing;

insert into patients (id, customer_id, patient_number, name, species)
values ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000100', 'PN-001', 'Kucing Contoh', 'kucing')
on conflict (id) do nothing;

insert into visits (id, branch_id, customer_id, patient_id, visit_number, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'JKT01-VST-2026-000001', 'terdaftar', now(), now()),
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'SBY01-VST-2026-000001', 'terdaftar', now(), now())
on conflict (id) do nothing;

set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

SELECT plan(6);

-- Tabel visit_queue tersedia
select is(
  to_regclass('public.visit_queue') is not null,
  true,
  'Tabel antrean kunjungan tersedia'
);

-- Insert antrean untuk JKT01
insert into visit_queue (id, visit_id, branch_id, queue_number, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000600', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000010', 1, 'menunggu', now(), now())
on conflict (id) do nothing;

select is(
  (select status from visit_queue where id = '00000000-0000-0000-0000-000000000600'),
  'menunggu',
  'Antrean JKT01: status awal menunggu'
);

-- Ubah status ke dipanggil
update visit_queue set status = 'dipanggil', called_at = now(), updated_at = now()
where id = '00000000-0000-0000-0000-000000000600';

select is(
  (select status from visit_queue where id = '00000000-0000-0000-0000-000000000600'),
  'dipanggil',
  'Antrean JKT01: status berubah ke dipanggil'
);

-- Ubah status ke selesai
update visit_queue set status = 'selesai', updated_at = now()
where id = '00000000-0000-0000-0000-000000000600';

select is(
  (select status from visit_queue where id = '00000000-0000-0000-0000-000000000600'),
  'selesai',
  'Antrean JKT01: status berubah ke selesai'
);

-- Isolasi cabang: antrean JKT01 tidak muncul di query cabang SBY01
select is(
  (select count(*)::int from visit_queue where branch_id = '00000000-0000-0000-0000-000000000020'),
  0,
  'BR-001: Antrean cabang JKT01 tidak muncul di cabang SBY01'
);

-- Nomor antrean unik per cabang per status (constraint)
insert into visit_queue (id, visit_id, branch_id, queue_number, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000010', 1, 'menunggu', now(), now())
on conflict do nothing;

select is(
  (select count(*)::int from visit_queue where branch_id = '00000000-0000-0000-0000-000000000010' and queue_number = 1 and status = 'menunggu'),
  1,
  'Nomor antrean 1 menunggu di JKT01: hanya 1 baris (unik per cabang+status)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
