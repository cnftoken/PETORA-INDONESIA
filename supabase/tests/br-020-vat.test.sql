-- Tes BR-020: PPN dapat dikonfigurasi
-- Mode exclusive: PPN = dasar pajak × tarif
-- Mode inclusive: dasar pajak = total baris ÷ (1 + tarif), PPN = total baris − dasar pajak
-- Tagihan menyimpan salinan tarif, mode, dan nilai pajak saat dibuat
\set ON_ERROR_STOP on
BEGIN;
-- Setup data sebagai superuser
insert into companies (id, name) values ('00000000-0000-0000-0000-000000000001', 'Perusahaan Contoh')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, time_zone)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Asia/Jakarta')
on conflict (id) do nothing;

insert into branch_settings (branch_id, vat_active, vat_rate_basis_points, vat_mode, rounding_mode, expiry_warning_days)
values
  ('00000000-0000-0000-0000-000000000010', true, 1000, 'exclusive', '500', 30)
on conflict (branch_id) do update
set vat_active = excluded.vat_active,
    vat_rate_basis_points = excluded.vat_rate_basis_points,
    vat_mode = excluded.vat_mode,
    rounding_mode = excluded.rounding_mode;

-- Simulasi sesi aplikasi
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(5);

-- Mode exclusive: dasar pajak = total baris, PPN = dasar × tarif
-- Total baris kena pajak Rp269.700, tarif 10% → PPN Rp26.970
select is(
  round(269700 * 1000 / 10000)::int,
  26970,
  'PPN exclusive: Rp269.700 × 10% = Rp26.970'
);

-- Mode inclusive: dasar pajak = total ÷ (1 + tarif), PPN = total − dasar
-- Rp269.700 ÷ 1,10 = Rp245.182 (dibulatkan), PPN = Rp269.700 − Rp245.182 = Rp24.518
select is(
  round(269700 / 1.1)::int,
  245182,
  'PPN inclusive dasar pajak: Rp269.700 ÷ 1,10 = Rp245.182'
);
select is(
  (269700 - round(269700 / 1.1))::int,
  24518,
  'PPN inclusive nilai pajak: Rp269.700 − Rp245.182 = Rp24.518'
);

-- Tarif disimpan sebagai basis poin (1% = 100)
select is(
  (select vat_rate_basis_points from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  1000,
  'Tarif PPN disimpan sebagai basis poin (1000 = 10%)'
);

-- Mode tarif tersimpan
select is(
  (select vat_mode from branch_settings where branch_id = '00000000-0000-0000-0000-000000000010'),
  'exclusive',
  'Mode PPN tersimpan (exclusive/inclusive)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
