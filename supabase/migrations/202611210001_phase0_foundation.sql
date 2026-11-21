create extension if not exists pgcrypto;

create type public.operational_role as enum ('owner', 'supervisor', 'doctor', 'staff');
create type public.account_type as enum ('operational', 'portal');

create table public.company (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  tax_id text,
  logo_path text,
  vat_enabled boolean not null default false,
  vat_basis_points integer not null default 0,
  vat_included boolean not null default false,
  rounding_increment integer not null default 0,
  expiry_warning_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  address text,
  phone text,
  timezone text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint branches_code_format check (code ~ '^[A-Z0-9]{2,5}$')
);

create table public.users (
  id uuid primary key references auth.users(id) on delete restrict,
  account_type public.account_type not null default 'operational',
  display_name text not null,
  role public.operational_role,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.branch_assignments (
  user_id uuid not null references public.users(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  primary key (user_id, branch_id)
);

create table public.permissions (
  id text primary key,
  description text not null
);

create table public.role_permissions (
  role public.operational_role not null,
  permission_id text not null references public.permissions(id) on delete cascade,
  access_level text not null check (access_level in ('full', 'read')),
  primary key (role, permission_id)
);

create table public.user_permissions (
  user_id uuid not null references public.users(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  access_level text not null check (access_level in ('full', 'read')),
  primary key (user_id, permission_id)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.users(id),
  branch_id uuid references public.branches(id),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_filters_idx
  on public.audit_log (actor_id, branch_id, entity_type, created_at);

alter table public.company enable row level security;
alter table public.branches enable row level security;
alter table public.users enable row level security;
alter table public.branch_assignments enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permissions enable row level security;
alter table public.audit_log enable row level security;

insert into public.permissions (id, description) values
  ('organization', 'Pengaturan organisasi, pengguna, dan permission'),
  ('customers', 'Pelanggan dan hewan'),
  ('visits', 'Kunjungan dan antrean'),
  ('medical_read', 'Pembacaan rekam medis'),
  ('medical_write', 'Penulisan dan penguncian rekam medis'),
  ('inpatient_admin', 'Administrasi rawat inap'),
  ('inpatient_notes', 'Catatan dan pemberian rawat inap'),
  ('catalog', 'Katalog produk dan layanan'),
  ('stock', 'Stok dan batch'),
  ('stock_approval', 'Persetujuan penyesuaian dan transfer'),
  ('procurement', 'Pengadaan'),
  ('billing', 'Tagihan dan pembayaran'),
  ('discount_approval', 'Diskon, void, dan retur'),
  ('reports', 'Laporan'),
  ('audit', 'Log audit');
