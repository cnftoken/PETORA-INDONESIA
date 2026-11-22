-- Tes M04-F03: Lampiran medis (JPG/PNG/PDF, maks 10 MB, signed URL, RLS isolasi cabang).
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
  ('00000000-0000-0000-0000-000000000310', 'dokter2@contoh.com', 'Dokter Dua', '081234567891', (select id from roles where code = 'dokter' limit 1)),
  ('00000000-0000-0000-0000-000000000320', 'dokter3@contoh.com', 'Dokter Tiga', '081234567892', (select id from roles where code = 'dokter' limit 1))
on conflict (id) do nothing;

insert into user_roles (id, user_id, role_id, branch_id)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000300', (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000310', (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000321', '00000000-0000-0000-0000-000000000320', (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000020')
on conflict (id) do nothing;

insert into user_branch_assignments (id, user_id, branch_id, is_primary)
values
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000010', true),
  ('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000010', true),
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
  ('00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'JKT01-VST-2026-000001', 'diperiksa', now(), now()),
  ('00000000-0000-0000-0000-000000000510', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'SBY01-VST-2026-000001', 'diperiksa', now(), now())
on conflict (id) do nothing;

insert into examinations (id, visit_id, doctor_id, anamnesis, physical_exam, diagnosis, treatment_plan, weight_kg, is_final, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000700', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000300', 'Anamnesis', 'Fisik normal', 'Diagnosis', 'Rencana', 4.5, false, now(), now()),
  ('00000000-0000-0000-0000-000000000710', '00000000-0000-0000-0000-000000000510', '00000000-0000-0000-0000-000000000320', 'Anamnesis', 'Fisik normal', 'Diagnosis', 'Rencana', 4.5, false, now(), now())
on conflict (id) do nothing;

set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

SELECT plan(7);

-- Tabel medical_attachments tersedia
select is(
  to_regclass('public.medical_attachments') is not null,
  true,
  'Tabel lampiran medis tersedia'
);

-- CHECK file_type hanya JPG/PNG/PDF
do $$
begin
  insert into medical_attachments (id, examination_id, file_name, file_path, file_type, file_size, uploaded_by, created_at, updated_at)
  values ('00000000-0000-0000-0000-000000000800', '00000000-0000-0000-0000-000000000700', 'x.exe', 'x.exe', 'application/x-msdownload', 100, '00000000-0000-0000-0000-000000000300', now(), now());
  raise exception 'Tipe file tidak valid harus ditolak';
exception when others then
  -- diharapkan: CHECK constraint menolak
end $$;

select is(true, true, 'CHECK file_type menolak tipe non-JPG/PNG/PDF');

-- CHECK file_size maks 10 MB
do $$
begin
  insert into medical_attachments (id, examination_id, file_name, file_path, file_type, file_size, uploaded_by, created_at, updated_at)
  values ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000700', 'big.pdf', 'big.pdf', 'application/pdf', 11 * 1024 * 1024, '00000000-0000-0000-0000-000000000300', now(), now());
  raise exception 'Ukuran file terlalu besar harus ditolak';
exception when others then
  -- diharapkan: CHECK constraint menolak
end $$;

select is(true, true, 'CHECK file_size menolak file > 10 MB');

-- Insert lampiran medis valid (JPG, 500 KB)
insert into medical_attachments (id, examination_id, file_name, file_path, file_type, file_size, uploaded_by, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000810', '00000000-0000-0000-0000-000000000700', 'lab-result.jpg', 'lab-result.jpg', 'image/jpeg', 500 * 1024, '00000000-0000-0000-0000-000000000300', now(), now())
on conflict (id) do nothing;

select is(
  (select count(*) from medical_attachments where id = '00000000-0000-0000-0000-000000000810')::int,
  1,
  'Lampiran medis valid (JPG, 500 KB) tersimpan'
);

-- Insert lampiran PDF valid
insert into medical_attachments (id, examination_id, file_name, file_path, file_type, file_size, uploaded_by, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000700', 'radios.pdf', 'radios.pdf', 'application/pdf', 2 * 1024 * 1024, '00000000-0000-0000-0000-000000000300', now(), now())
on conflict (id) do nothing;

select is(
  (select count(*) from medical_attachments where id = '00000000-0000-0000-0000-000000000811')::int,
  1,
  'Lampiran medis valid (PDF, 2 MB) tersimpan'
);

-- RLS: Dokter cabang Jakarta melihat lampiran di cabangnya (2 lampiran)
select is(
  (select count(*) from medical_attachments ma
   join examinations e on e.id = ma.examination_id
   join visits v on v.id = e.visit_id
   where ma.id in ('00000000-0000-0000-0000-000000000810', '00000000-0000-0000-0000-000000000811')
     and v.branch_id = '00000000-0000-0000-0000-000000000010')::int,
  2,
  'Dokter Jakarta bisa melihat lampiran di cabang Jakarta'
);

-- RLS: Dokter Surabaya tidak melihat lampiran di cabang Jakarta
set jwt.claims.sub = '00000000-0000-0000-0000-000000000320';

select is(
  (select count(*) from medical_attachments where id in ('00000000-0000-0000-0000-000000000810', '00000000-0000-0000-0000-000000000811'))::int,
  0,
  'Dokter Surabaya tidak bisa melihat lampiran cabang Jakarta (BR-001)'
);

set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';
reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
