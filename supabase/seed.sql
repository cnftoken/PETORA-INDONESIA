-- Seed data untuk pengembangan lokal dan staging.
-- Tidak pernah dijalankan di produksi.

insert into companies (id, name, address, phone, npwp)
values
  ('00000000-0000-0000-0000-000000000001', 'PT Petora Sejahtera', 'Jl. Contoh No. 1, Jakarta', '021-1234567', '01.234.567.8-901.000')
on conflict (id) do nothing;

insert into branches (id, company_id, code, name, address, phone, time_zone, is_active)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'JKT01', 'Cabang Jakarta', 'Jl. Thamrin No. 1, Jakarta', '021-1111111', 'Asia/Jakarta', true),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'SBY01', 'Cabang Surabaya', 'Jl. Tunjungan No. 2, Surabaya', '031-2222222', 'Asia/Makassar', true),
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'JPY01', 'Cabang Jayapura', 'Jl. Raya Abepura No. 3, Jayapura', '091-3333333', 'Asia/Jayapura', true)
on conflict (company_id, code) do nothing;

insert into branch_settings (branch_id, vat_active, vat_rate_basis_points, vat_mode, rounding_mode, expiry_warning_days)
values
  ('00000000-0000-0000-0000-000000000010', false, 0, 'exclusive', 'none', 30),
  ('00000000-0000-0000-0000-000000000020', false, 0, 'exclusive', 'none', 30),
  ('00000000-0000-0000-0000-000000000030', false, 0, 'exclusive', 'none', 30)
on conflict (branch_id) do nothing;

-- Default permissions (grup dan kunci sesuai matriks BRIEF bagian 3)
insert into permissions (group_name, permission_key, description) values
  ('Pengaturan organisasi, pajak, pengguna, permission', 'org.kelola', 'Mengelola organisasi, pajak, pengguna, dan permission'),
  ('Pelanggan dan hewan', 'customer.lihat', 'Melihat data pelanggan dan hewan'),
  ('Kunjungan dan antrean', 'kunjungan.kelola', 'Mengelola kunjungan dan antrean'),
  ('Rekam medis (baca)', 'medical.lihat', 'Membaca rekam medis'),
  ('Rekam medis (tulis, kunci, bagikan)', 'medical.kelola', 'Menulis, mengunci, dan berbagi rekam medis'),
  ('Rawat inap: administrasi', 'inpatient.kelola', 'Administrasi rawat inap (check-in, check-out, kandang)'),
  ('Rawat inap: catatan harian dan pemberian obat', 'inpatient.catatan', 'Catatan harian dan pemberian obat rawat inap'),
  ('Katalog: produk dan layanan', 'catalog.lihat', 'Melihat katalog produk dan layanan'),
  ('Harga dan status pajak', 'harga.lihat', 'Melihat harga dan status pajak'),
  ('Stok dan batch', 'stok.kelola', 'Mengelola stok dan batch termasuk penyesuaian'),
  ('Persetujuan penyesuaian stok', 'stok.setuju', 'Menyetujui penyesuaian stok, selisih transfer, selisih opname'),
  ('Transfer stok antar cabang', 'transfer.kelola', 'Transfer stok antar cabang'),
  ('Pengadaan', 'procurement.kelola', 'Pengadaan barang'),
  ('Tagihan dan pembayaran', 'billing.kelola', 'Tagihan dan pembayaran'),
  ('Pemberian diskon, persetujuan void dan retur', 'diskon.kelola', 'Memberikan diskon, menyetujui void dan retur'),
  ('Laporan', 'laporan.lihat', 'Melihat laporan'),
  ('Log audit', 'audit.lihat', 'Melihat log audit')
on conflict (group_name, permission_key) do nothing;

-- User Owner pertama (akun harus dibuat melalui Supabase Auth, profil ditambahkan di sini)
insert into users (id, email, full_name, is_active, role_id)
values
  ('00000000-0000-0000-0000-000000000100', 'owner@petora.id', 'Owner Utama', true,
   (select id from roles where code = 'owner'))
on conflict (id) do nothing;

insert into user_branch_assignments (user_id, branch_id, is_primary)
values
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000010', true)
on conflict (user_id, branch_id) do nothing;

insert into user_roles (user_id, role_id, branch_id)
select
  '00000000-0000-0000-0000-000000000100',
  r.id,
  null
from roles r where r.code = 'owner'
on conflict (user_id, role_id, branch_id) do nothing;

-- Owner mendapat semua permission di semua cabang (branch_id null = global)
insert into user_permissions (user_id, permission_id, branch_id, granted)
select
  '00000000-0000-0000-0000-000000000100',
  p.id,
  null,
  true
from permissions p
on conflict (user_id, permission_id, branch_id) do nothing;
