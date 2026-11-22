-- Tes M03-F05: Validasi transisi status kunjungan.
-- Alur: terdaftar → menunggu → diperiksa → selesai.
-- Pembatalan hanya sebelum diperiksa. Tidak boleh lompat status.
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

set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000300';

SELECT plan(7);

-- Tabel visits tersedia
select is(
  to_regclass('public.visits') is not null,
  true,
  'Tabel kunjungan tersedia'
);

-- Insert kunjungan dengan status terdaftar
insert into visits (id, branch_id, customer_id, patient_id, visit_number, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000500', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'JKT01-VST-2026-000001', 'terdaftar', now(), now())
on conflict (id) do nothing;

-- Status awal terdaftar
select is(
  (select status from visits where id = '00000000-0000-0000-0000-000000000500'),
  'terdaftar',
  'Status kunjungan awal terdaftar'
);

-- Transisi terdaftar → menunggu (valid)
update visits set status = 'menunggu', updated_at = now()
where id = '00000000-0000-0000-0000-000000000500';

select is(
  (select status from visits where id = '00000000-0000-0000-0000-000000000500'),
  'menunggu',
  'Transisi terdaftar → menunggu diperbolehkan'
);

-- Transisi menunggu → diperiksa (valid)
update visits set status = 'diperiksa', updated_at = now()
where id = '00000000-0000-0000-0000-000000000500';

select is(
  (select status from visits where id = '00000000-0000-0000-0000-000000000500'),
  'diperiksa',
  'Transisi menunggu → diperiksa diperbolehkan'
);

-- Transisi diperiksa → selesai (valid)
update visits set status = 'selesai', updated_at = now()
where id = '00000000-0000-0000-0000-000000000500';

select is(
  (select status from visits where id = '00000000-0000-0000-0000-000000000500'),
  'selesai',
  'Transisi diperiksa → selesai diperbolehkan'
);

-- Reset kunjungan baru untuk tes transisi tidak valid (lompat status)
insert into visits (id, branch_id, customer_id, patient_id, visit_number, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'JKT01-VST-2026-000002', 'terdaftar', now(), now())
on conflict (id) do nothing;

-- Transisi terdaftar → selesai (tidak valid: lompat status, harus ditolak)
do $$
begin
  update visits set status = 'selesai', updated_at = now()
  where id = '00000000-0000-0000-0000-000000000501';
exception when others then
  -- Diharapkan: trigger mencegah transisi tidak valid
end $$;

select is(
  (select status from visits where id = '00000000-0000-0000-0000-000000000501'),
  'terdaftar',
  'Transisi terdaftar → selesai ditolak (masih terdaftar)'
);

-- Reset kunjungan baru untuk tes pembatalan
insert into visits (id, branch_id, customer_id, patient_id, visit_number, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200', 'JKT01-VST-2026-000003', 'terdaftar', now(), now())
on conflict (id) do nothing;

-- Pembatalan dari terdaftar (valid: sebelum diperiksa)
update visits set status = 'dibatalkan', updated_at = now()
where id = '00000000-0000-0000-0000-000000000502';

select is(
  (select status from visits where id = '00000000-0000-0000-0000-000000000502'),
  'dibatalkan',
  'Pembatalan dari terdaftar diperbolehkan (sebelum diperiksa)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
