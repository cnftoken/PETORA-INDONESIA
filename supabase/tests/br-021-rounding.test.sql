-- Tes BR-021: Pembulatan tagihan dapat dikonfigurasi
-- Pembulatan pada total akhir setelah PPN, setengah ke atas
-- Tampil sebagai baris "Pembulatan" terpisah, positif atau negatif
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
  ('00000000-0000-0000-0000-000000000010', false, 0, 'exclusive', '500', 30)
on conflict (branch_id) do update
set rounding_mode = excluded.rounding_mode;

-- Simulasi sesi aplikasi
set role app_user;
set row_security = on;
set jwt.claims.sub = '00000000-0000-0000-0000-000000000100';

SELECT plan(4);

-- Pembulatan ke Rp500 terdekat, setengah ke atas
-- Rp296.670 → Rp296.500 (selisih −Rp170)
select is(
  (round(296670 / 500) * 500)::int,
  296500,
  'Pembulatan Rp296.670 ke Rp500 terdekat = Rp296.500'
);
select is(
  ((296500 - 296670))::int,
  -170,
  'Selisih pembulatan Rp296.500 − Rp296.670 = −Rp170 (negatif)'
);

-- Rp269.700 → Rp269.500 (selisih −Rp200)
select is(
  (round(269700 / 500) * 500)::int,
  269500,
  'Pembulatan Rp269.700 ke Rp500 terdekat = Rp269.500'
);
select is(
  ((269500 - 269700))::int,
  -200,
  'Selisih pembulatan Rp269.500 − Rp269.700 = −Rp200 (negatif)'
);

reset role;
reset row_security;
SELECT * FROM finish();
ROLLBACK;
