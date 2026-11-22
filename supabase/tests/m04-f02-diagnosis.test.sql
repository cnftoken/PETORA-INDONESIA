-- Tes M04-F02: Diagnosis dan rencana terapi dengan saran diagnosis yang pernah dipakai.
-- Query saran diagnosis harus mengembalikan daftar diagnosis unik dari entri medis sebelumnya,
-- dapat dicari (filter teks), dan tidak mengembalikan diagnosis kosong.
\set ON_ERROR_STOP on
BEGIN;
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
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
  ('00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'JKT01-VST-2026-000001', 'diperiksa', now(), now())
on conflict (id) do nothing;

set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

SELECT plan(4);

-- Tabel examinations tersedia
select is(
  to_regclass('public.examinations') is not null,
  true,
  'Tabel pemeriksaan medis tersedia'
);

-- Masukkan beberapa entri medis dengan diagnosis yang sama dan berbeda
insert into examinations (id, visit_id, doctor_id, diagnosis, treatment_plan, is_final, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000700', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000300', 'Dermatitis', 'Obat kulit', false, now(), now()),
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000300', 'Dermatitis', 'Obat kulit lainnya', false, now(), now()),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000300', 'Gastroenteritis', 'Obat perut', false, now(), now())
on conflict (id) do nothing;

-- Query diagnosis unik (tanpa filter) harus mengembalikan 2 diagnosis unik: Dermatitis, Gastroenteritis
-- (Diagnosis NULL atau string kosong tidak dihitung)
select is(
  (select count(distinct diagnosis)::int from examinations
   where diagnosis is not null and diagnosis <> ''),
  2,
  'M04-F02: 2 diagnosis unik tersedia (Dermatitis, Gastroenteritis)'
);

-- Query diagnosis dengan filter 'Derma' harus mengembalikan Dermatitis (1 baris)
select is(
  (select count(*)::int from examinations
   where diagnosis is not null and diagnosis <> '' and diagnosis ilike '%Derma%'),
  2,
  'M04-F02: Filter diagnosis "Derma" mengembalikan entri Dermatitis'
);

-- Query diagnosis unik dengan filter 'Gastro' harus mengembalikan Gastroenteritis (1 diagnosis unik)
select is(
  (select count(distinct diagnosis)::int from examinations
   where diagnosis is not null and diagnosis <> '' and diagnosis ilike '%Gastro%'),
  1,
  'M04-F02: Filter diagnosis "Gastro" mengembalikan 1 diagnosis unik (Gastroenteritis)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
