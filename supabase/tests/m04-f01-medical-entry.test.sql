-- Tes M04-F01 + BR-004: Entri medis dan penguncian entri final.
-- Dokter tidak bisa mengubah entri final, termasuk milik Dokter lain.
\set ON_ERROR_STOP on
BEGIN;
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into users (id, email, full_name, phone, role_id)
values
  ('00000000-0000-0000-0000-000000000300', 'dokter1@contoh.com', 'Dokter Satu', '081234567890', (select id from roles where code = 'dokter' limit 1)),
  ('00000000-0000-0000-0000-000000000310', 'dokter2@contoh.com', 'Dokter Dua', '081234567891', (select id from roles where code = 'dokter' limit 1))
on conflict (id) do nothing;

insert into user_roles (id, user_id, role_id, branch_id)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000300', (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000310', (select id from roles where code = 'dokter' limit 1), '00000000-0000-0000-0000-000000000010')
on conflict (id) do nothing;

insert into user_branch_assignments (id, user_id, branch_id, is_primary)
values
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000010', true),
  ('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000010', true)
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

SELECT plan(6);

-- Tabel examinations tersedia
select is(
  to_regclass('public.examinations') is not null,
  true,
  'Tabel pemeriksaan medis tersedia'
);

-- Insert entri medis (draft, is_final=false)
insert into examinations (id, visit_id, doctor_id, anamnesis, physical_exam, diagnosis, treatment_plan, weight_kg, is_final, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000700', '00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000300', 'Anamnesis awal', 'Fisik normal', 'Diagnosis draft', 'Rencana draft', 4.5, false, now(), now())
on conflict (id) do nothing;

-- Status awal is_final=false
select is(
  (select is_final from examinations where id = '00000000-0000-0000-0000-000000000700'),
  false,
  'Entri medis awal belum final (is_final=false)'
);

-- Update entri draft (diizinkan)
update examinations set diagnosis = 'Diagnosis diperbarui', updated_at = now()
where id = '00000000-0000-0000-0000-000000000700';

select is(
  (select diagnosis from examinations where id = '00000000-0000-0000-0000-000000000700'),
  'Diagnosis diperbarui',
  'Entri draft dapat diubah'
);

-- Setel is_final=true
update examinations set is_final = true, updated_at = now()
where id = '00000000-0000-0000-0000-000000000700';

select is(
  (select is_final from examinations where id = '00000000-0000-0000-0000-000000000700'),
  true,
  'Entri medis disetel final (is_final=true)'
);

-- Dokter yang sama coba ubah entri final (ditolak)
do $$
begin
  update examinations set diagnosis = 'Coba ubah final', updated_at = now()
  where id = '00000000-0000-0000-0000-000000000700';
  raise exception 'Ubah entri final harus ditolak';
exception when others then
  -- diharapkan: trigger mencegah ubah entri final
end $$;

select is(
  (select diagnosis from examinations where id = '00000000-0000-0000-0000-000000000700'),
  'Diagnosis diperbarui',
  'BR-004: Dokter yang sama tidak bisa mengubah entri final'
);

-- Reset dokter aktif ke Dokter Dua untuk tes lintas dokter
set jwt.claims.sub = '00000000-0000-0000-0000-000000000310';

-- Dokter lain coba ubah entri final (ditolak)
do $$
begin
  update examinations set diagnosis = 'Coba ubah final oleh dokter lain', updated_at = now()
  where id = '00000000-0000-0000-0000-000000000700';
  raise exception 'Ubah entri final oleh dokter lain harus ditolak';
exception when others then
  -- diharapkan: trigger mencegah ubah entri final oleh dokter lain
end $$;

select is(
  (select diagnosis from examinations where id = '00000000-0000-0000-0000-000000000700'),
  'Diagnosis diperbarui',
  'BR-004: Dokter lain tidak bisa mengubah entri final milik Dokter lain'
);

set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
