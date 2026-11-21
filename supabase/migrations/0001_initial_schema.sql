-- Migrasi 0001: Skema dasar, RLS, dan audit (Fase 0)
-- Satu tujuan: fondasi organisasi dan akses

-- Ekstensi
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists pgtap;

-- ============================================================
-- Tabel dasar
-- ============================================================

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  npwp text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table branches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  code text not null,
  name text not null,
  address text,
  phone text,
  time_zone text not null default 'Asia/Jakarta',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_code_unique unique (company_id, code),
  constraint branches_code_format check (code ~ '^[A-Z0-9]{2,5}$')
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('owner', 'supervisor', 'dokter', 'staff')),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  permission_key text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint permissions_unique unique (group_name, permission_key)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  phone text,
  is_active boolean not null default true,
  role_id uuid references roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_branch_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint user_branch_assignments_unique unique (user_id, branch_id)
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_roles_unique unique (user_id, role_id, branch_id)
);

create table user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  granted boolean not null default true,
  created_at timestamptz not null default now(),
  constraint user_permissions_unique unique (user_id, permission_id, branch_id)
);

create table branch_settings (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  vat_active boolean not null default false,
  vat_rate_basis_points integer not null default 0,
  vat_mode text not null default 'exclusive' check (vat_mode in ('exclusive', 'inclusive')),
  rounding_mode text not null default 'none' check (rounding_mode in ('none', '100', '500', '1000')),
  expiry_warning_days integer not null default 30,
  effective_from date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branch_settings_unique unique (branch_id)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  branch_id uuid references branches(id) on delete set null,
  entity text not null,
  entity_id uuid,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_branches_company_id on branches(company_id);
create index idx_branches_code on branches(code);
create index idx_users_email on users(email);
create index idx_users_role_id on users(role_id);
create index idx_user_branch_assignments_user_id on user_branch_assignments(user_id);
create index idx_user_branch_assignments_branch_id on user_branch_assignments(branch_id);
create index idx_user_roles_user_id on user_roles(user_id);
create index idx_user_permissions_user_id on user_permissions(user_id);
create index idx_branch_settings_branch_id on branch_settings(branch_id);
create index idx_audit_logs_actor on audit_logs(actor_user_id);
create index idx_audit_logs_branch on audit_logs(branch_id);
create index idx_audit_logs_entity on audit_logs(entity, entity_id);
create index idx_audit_logs_created_at on audit_logs(created_at);

-- ============================================================
-- Data awal role
-- ============================================================

insert into roles (code, name, description) values
  ('owner', 'Owner', 'Pemilik perusahaan, akses penuh ke seluruh cabang'),
  ('supervisor', 'Supervisor', 'Penanggung jawab cabang'),
  ('dokter', 'Dokter', 'Dokter hewan'),
  ('staff', 'Staff', 'Resepsionis, kasir, perawat, petugas gudang')
on conflict (code) do nothing;

-- ============================================================
-- RLS: aktifkan di setiap tabel
-- ============================================================

alter table companies enable row level security;
alter table branches enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table users enable row level security;
alter table user_branch_assignments enable row level security;
alter table user_roles enable row level security;
alter table user_permissions enable row level security;
alter table branch_settings enable row level security;
alter table audit_logs enable row level security;

-- ============================================================
-- Fungsi helper
-- ============================================================

create or replace function current_app_user_id() returns uuid
language sql stable as $$
  select nullif(current_setting('jwt.claims.sub', true), '')::uuid
$$;

create or replace function get_current_user_id() returns uuid
language sql stable as $$
  select current_app_user_id()
$$;

create or replace function user_has_permission(
  p_user_id uuid,
  p_permission_key text,
  p_branch_id uuid
) returns boolean
language sql stable as $$
  select
    -- Owner selalu punya permission penuh
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = p_user_id
        and r.code = 'owner'
        and (ur.branch_id is null or ur.branch_id = p_branch_id)
    )
    or
    -- Permission langsung atau melalui role
    exists (
      select 1 from user_permissions up
      join permissions p on p.id = up.permission_id
      where up.user_id = p_user_id
        and p.permission_key = p_permission_key
        and up.granted = true
        and (up.branch_id is null or up.branch_id = p_branch_id)
    )
$$;

-- ============================================================
-- Kebijakan RLS
-- ============================================================

-- Companies: Owner boleh melihat semua; staff hanya cabangnya
create policy companies_select on companies
  for select
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

create policy companies_insert on companies
  for insert
  to public
  with check (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

create policy companies_update on companies
  for update
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

-- Branches: Owner semua; non-owner hanya cabang yang ditugaskan
create policy branches_select on branches
  for select
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
    or exists (
      select 1 from user_branch_assignments uba
      where uba.user_id = current_app_user_id()
        and uba.branch_id = branches.id
    )
  );

create policy branches_insert on branches
  for insert
  to public
  with check (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

create policy branches_update on branches
  for update
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

-- Roles dan permissions: hanya-baca untuk semua pengguna terautentikasi
create policy roles_select on roles for select to public using (true);
create policy permissions_select on permissions for select to public using (true);

-- Users: Owner semua; pengguna melihat sendiri; non-owner melihat rekan satu cabang
create policy users_select on users
  for select
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
    or users.id = current_app_user_id()
    or exists (
      select 1 from user_branch_assignments uba1
      join user_branch_assignments uba2 on uba2.branch_id = uba1.branch_id
      where uba1.user_id = current_app_user_id()
        and uba2.user_id = users.id
    )
  );

create policy users_insert on users for insert to public with check (true);
create policy users_update on users for update to public using (users.id = current_app_user_id());

-- User branch assignments: Owner semua; pengguna melihat assignment sendiri
create policy user_branch_assignments_select on user_branch_assignments
  for select
  to public
  using (user_branch_assignments.user_id = current_app_user_id());

create policy user_branch_assignments_insert on user_branch_assignments
  for insert
  to public
  with check (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

create policy user_branch_assignments_update on user_branch_assignments
  for update
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

-- User roles: Owner semua
create policy user_roles_select on user_roles
  for select
  to public
  using (user_roles.user_id = current_app_user_id());

create policy user_roles_insert on user_roles
  for insert
  to public
  with check (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

create policy user_roles_update on user_roles
  for update
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

-- User permissions: Owner semua
create policy user_permissions_select on user_permissions
  for select
  to public
  using (user_permissions.user_id = current_app_user_id());

create policy user_permissions_insert on user_permissions
  for insert
  to public
  with check (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

-- Branch settings: Owner semua; non-owner lihat cabangnya
create policy branch_settings_select on branch_settings
  for select
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
    or exists (
      select 1 from user_branch_assignments uba
      where uba.user_id = current_app_user_id()
        and uba.branch_id = branch_settings.branch_id
    )
  );

create policy branch_settings_insert on branch_settings
  for insert
  to public
  with check (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

create policy branch_settings_update on branch_settings
  for update
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
  );

-- Audit logs: Owner semua, Supervisor lihat cabangnya, tidak ada insert/update/delete lewat aplikasi
create policy audit_logs_select on audit_logs
  for select
  to public
  using (
    exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id()
        and r.code = 'owner'
    )
    or exists (
      select 1 from user_branch_assignments uba
      where uba.user_id = current_app_user_id()
        and uba.branch_id = audit_logs.branch_id
    )
  );

create policy audit_logs_insert on audit_logs
  for insert
  to public
  with check (false);

create policy audit_logs_update on audit_logs
  for update
  to public
  using (false);

create policy audit_logs_delete on audit_logs
  for delete
  to public
  using (false);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function write_audit_log(
  p_actor_user_id uuid,
  p_branch_id uuid,
  p_entity text,
  p_entity_id uuid,
  p_action text,
  p_old_values jsonb,
  p_new_values jsonb
) returns void
language sql volatile security definer as $$
  insert into audit_logs (
    actor_user_id, branch_id, entity, entity_id, action,
    old_values, new_values, created_at
  ) values (
    p_actor_user_id, p_branch_id, p_entity, p_entity_id, p_action,
    p_old_values, p_new_values, now()
  )
$$;

-- Trigger audit pada users
create or replace function trg_audit_users() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select branch_id from user_branch_assignments
    where user_id = v_actor and is_primary = true
    limit 1
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'users', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'users', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'users', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_users_audit
  after insert or update or delete on users
  for each row execute function trg_audit_users();

-- Trigger audit pada branches
create or replace function trg_audit_branches() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select branch_id from user_branch_assignments
    where user_id = v_actor and is_primary = true
    limit 1
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'branches', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'branches', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'branches', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_branches_audit
  after insert or update or delete on branches
  for each row execute function trg_audit_branches();

-- Trigger audit pada branch_settings
create or replace function trg_audit_branch_settings() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := new.branch_id;
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'branch_settings', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'branch_settings', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'branch_settings', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_branch_settings_audit
  after insert or update or delete on branch_settings
  for each row execute function trg_audit_branch_settings();

-- Role untuk simulasi sesi aplikasi (non-superuser) dalam pengujian RLS
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'app_user') then
    create role app_user nologin;
  end if;
end
$$;
grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
