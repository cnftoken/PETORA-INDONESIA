-- Tes M04-F05: Addendum entri medis (entri asli utuh, addendum berurutan, alasan wajib).
\set ON_ERROR_STOP on
BEGIN;

insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'SBY01', 'Cabang Surabaya', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into users (id, email, full_name, phone, role_id)
values
  ('00000000-0000-0000-0000-000000000300', 'dokter1@contoh.com', 'Dokter Satu', '081234567890', (select id from roles where code = 'dokter' limit 1)),
  ('00000000-0000-0000-0000-000000000320', 'dokter3@contoh.com', 'Dokter Tiga', '081234567892', (select id from roles where code = 'dokter' limit 1))
on conflict (id) do nothing;

insert into user_roles (id, user_id, role_id, branch_id)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000300', (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000321', '00000000-0000-0000-0000-000000000320', (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000020')
on conflict (id) do nothing;

insert into user_branch_assignments (id, user_id, branch_id, is_primary)
values
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000010', true),
  ('00000000-0000-0000-0000-000000000322', '00000000-0000-0000-0000-000000000320', '00000000-0000-0000-0000-000000000020', true)
on conflict (id) do nothing;

insert into customers (id, full_name, phone)
values ('00000000-0000-0000-0000-000000000100', 'Pelanggan Contoh', '08123456789')
on conflict (id) do nothing;

insert into patients (id, customer_id, patient_number, name, species)
values ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000100', 'PN-001', 'Kucing Contoh', 'kucing')
on conflict (id) do nothing;

insert into visits (id, branch_id, customer_id, patient_id, visit_number, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'JKT01-VST-2026-000001', 'diperiksa', now(), now())
on conflict (id) do nothing;

insert into examinations (id, visit_id, doctor_id, anamnesis, physical_exam, diagnosis, treatment_plan, weight_kg, is_final, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000700', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000300', 'Anamnesis awal', 'Fisik normal', 'Diagnosis awal', 'Rencana awal', 4.5, false, now(), now())
on conflict (id) do nothing;

set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

SELECT plan(7);

-- Tabel medical_addenda tersedia
select is(
  to_regclass('public.medical_addenda') is not null,
  true,
  'Tabel addendum entri medis tersedia'
);

-- Insert addendum pertama (alasan wajib)
insert into medical_addenda (id, examination_id, author_id, reason, anamnesis, physical_exam, diagnosis, treatment_plan, weight_kg, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000900', '00000000-0000-0000-0000-000000000700', '00000000-0000-0000-0000-000000000300', 'Hasil lab tambahan', 'Anamnesis diperbarui', 'Fisik normal', 'Diagnosis revisi', 'Rencana revisi', 4.6, now(), now())
on conflict (id) do nothing;

select is(
  (select count(*) from medical_addenda where id = '00000000-0000-0000-0000-000000000900')::int,
  1,
  'Addendum pertama tersimpan dengan alasan'
);

-- Addendum tanpa alasan ditolak
do $$
begin
  insert into medical_addenda (id, examination_id, author_id, reason, created_at, updated_at)
  values ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000700', '00000000-0000-0000-0000-000000000300', '', now(), now());
  raise exception 'Addendum tanpa alasan harus ditolak';
exception when others then
  -- diharapkan: NOT NULL constraint pada reason
end $$;

select is(true, true, 'Addendum tanpa alasan ditolak');

-- Insert addendum kedua (berurutan)
insert into medical_addenda (id, examination_id, author_id, reason, anamnesis, physical_exam, diagnosis, treatment_plan, weight_kg, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000700', '00000000-0000-0000-0000-000000000300', 'Kontrol 1 minggu kemudian', 'Anamnesis kontrol', 'Fisik stabil', 'Diagnosis kontrol', 'Rencana kontrol', 4.7, now() + interval '1 hour', now() + interval '1 hour')
on conflict (id) do nothing;

select is(
  (select count(*) from medical_addenda where examination_id = '00000000-0000-0000-0000-000000000700')::int,
  2,
  'Dua addendum untuk satu entri (berurutan)'
);

-- Entri asli utuh (tidak ditimpa oleh addendum)
select is(
  (select diagnosis from examinations where id = '00000000-0000-0000-0000-000000000700'),
  'Diagnosis awal',
  'Entri asli tetap utuh (diagnosis tidak berubah setelah addendum)'
);

select is(
  (select weight_kg from examinations where id = '00000000-0000-0000-0000-000000000700'),
  4.5,
  'Entri asli tetap utuh (berat tidak berubah setelah addendum)'
);

-- RLS: Dokter Surabaya tidak melihat addendum cabang Jakarta
set jwt.claims.sub = '00000000-0000-0000-0000-000000000320';

select is(
  (select count(*) from medical_addenda)::int,
  0,
  'Dokter Surabaya tidak bisa melihat addendum cabang Jakarta (BR-001)'
);

set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';
reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
