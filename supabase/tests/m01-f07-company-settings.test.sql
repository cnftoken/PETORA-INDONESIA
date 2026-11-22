-- Tes M01-F07: Pengaturan perusahaan (PPN dan pembulatan)
-- PPN dan pembulatan (BR-020, BR-021), ambang peringatan kedaluwarsa (nilai awal 30 hari).
-- Tarif punya tanggal berlaku. Perubahan tidak mengubah tagihan lama dan tercatat di audit.
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into branches (id, company_id, code, name, time_zone, is_active)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta', true)
on conflict (id) do nothing;

insert into branch_settings (branch_id, vat_active, vat_rate_basis_points, vat_mode, rounding_mode, expiry_warning_days, effective_from)
values
  ('00000000-0000-0000-0000-000000000010', true, 1000, 'exclusive', '500', 30, '2026-01-01')
on conflict (branch_id) do update
set vat_active = excluded.vat_active,
    vat_rate_basis_points = excluded.vat_rate_basis_points,
    vat_mode = excluded.vat_mode,
    rounding_mode = excluded.rounding_mode,
    expiry_warning_days = excluded.expiry_warning_days,
    effective_from = excluded.effective_from;

-- Simulasi sesi Owner
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(6);

-- Pengaturan cabang tersimpan
select is(
  (select vat_active from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  true,
  'PPN aktif'
);
select is(
  (select vat_rate_basis_points from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  1000,
  'Tarif PPN 10% (1000 basis poin)'
);
select is(
  (select vat_mode from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  'exclusive',
  'Mode PPN exclusive'
);
select is(
  (select rounding_mode from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  '500',
  'Pembulatan ke Rp500 terdekat'
);
select is(
  (select expiry_warning_days from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  30,
  'Ambang peringatan kedaluwarsa 30 hari (default)'
);
select is(
  (select effective_from from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  '2026-01-01'::date,
  'Tarif punya tanggal berlaku'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
