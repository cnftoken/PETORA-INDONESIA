-- Migrasi 0002: Katalog dan Harga (Fase 2, M06)
-- Tabel: kategori, produk, layanan, riwayat harga. RLS dan audit.
-- Harga seragam semua cabang (tanpa branch_id).

-- ============================================================
-- Tabel katalog
-- ============================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references categories(id),
  unit text not null default 'pcs',
  barcode text,
  sale_price integer not null default 0,
  last_purchase_price integer not null default 0,
  is_batch boolean not null default false,
  is_taxable boolean not null default true,
  min_stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id),
  price integer not null default 0,
  is_taxable boolean not null default true,
  executor text not null default 'dokter' check (executor in ('dokter', 'perawat', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table price_history (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('product', 'service')),
  item_id uuid not null,
  price integer not null,
  effective_from date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_categories_name on categories(name);
create index idx_products_sku on products(sku);
create index idx_products_category_id on products(category_id);
create index idx_products_is_active on products(is_active);
create index idx_products_is_batch on products(is_batch);
create index idx_products_is_taxable on products(is_taxable);
create index idx_services_category_id on services(category_id);
create index idx_services_is_active on services(is_active);
create index idx_services_is_taxable on services(is_taxable);
create index idx_price_history_item on price_history(item_type, item_id);
create index idx_price_history_effective_from on price_history(effective_from);

-- ============================================================
-- Data awal kategori
-- ============================================================

insert into categories (id, name) values
  ('00000000-0000-0000-0000-000000000301', 'Obat-obatan'),
  ('00000000-0000-0000-0000-000000000302', 'Alat Kesehatan'),
  ('00000000-0000-0000-0000-000000000303', 'Perawatan Hewan'),
  ('00000000-0000-0000-0000-000000000304', 'Makanan Hewan'),
  ('00000000-0000-0000-0000-000000000305', 'Konsultasi'),
  ('00000000-0000-0000-0000-000000000306', 'Vaksinasi'),
  ('00000000-0000-0000-0000-000000000307', 'Operasi')
on conflict (id) do nothing;

-- ============================================================
-- RLS: aktifkan di setiap tabel
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table services enable row level security;
alter table price_history enable row level security;

-- Kategori: semua pengguna terautentikasi boleh baca; Owner tulis
create policy categories_select on categories for select to public using (true);
create policy categories_insert on categories for insert to public
  with check (exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  ));
create policy categories_update on categories for update to public using (exists (
  select 1 from user_roles ur join roles r on r.id = ur.role_id
  where ur.user_id = current_app_user_id() and r.code = 'owner'
));
create policy categories_delete on categories for delete to public using (exists (
  select 1 from user_roles ur join roles r on r.id = ur.role_id
  where ur.user_id = current_app_user_id() and r.code = 'owner'
));

-- Produk: semua pengguna terautentikasi boleh baca; Owner tulis
create policy products_select on products for select to public using (true);
create policy products_insert on products for insert to public
  with check (exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  ));
create policy products_update on products for update to public using (exists (
  select 1 from user_roles ur join roles r on r.id = ur.role_id
  where ur.user_id = current_app_user_id() and r.code = 'owner'
));
create policy products_delete on products for delete to public using (exists (
  select 1 from user_roles ur join roles r on r.id = ur.role_id
  where ur.user_id = current_app_user_id() and r.code = 'owner'
));

-- Layanan: semua pengguna terautentikasi boleh baca; Owner tulis
create policy services_select on services for select to public using (true);
create policy services_insert on services for insert to public
  with check (exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  ));
create policy services_update on services for update to public using (exists (
  select 1 from user_roles ur join roles r on r.id = ur.role_id
  where ur.user_id = current_app_user_id() and r.code = 'owner'
));
create policy services_delete on services for delete to public using (exists (
  select 1 from user_roles ur join roles r on r.id = ur.role_id
  where ur.user_id = current_app_user_id() and r.code = 'owner'
));

-- Riwayat harga: hanya-baca, tidak bisa ditulis langsung lewat aplikasi
create policy price_history_select on price_history for select to public using (true);
create policy price_history_insert on price_history for insert to public with check (false);
create policy price_history_update on price_history for update to public using (false);
create policy price_history_delete on price_history for delete to public using (false);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_categories() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, null, 'categories', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, null, 'categories', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, null, 'categories', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_categories_audit
  after insert or update or delete on categories
  for each row execute function trg_audit_categories();

create or replace function trg_audit_products() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, null, 'products', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, null, 'products', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, null, 'products', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_products_audit
  after insert or update or delete on products
  for each row execute function trg_audit_products();

create or replace function trg_audit_services() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, null, 'services', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, null, 'services', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, null, 'services', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_services_audit
  after insert or update or delete on services
  for each row execute function trg_audit_services();

-- Trigger riwayat harga saat harga produk berubah
create or replace function trg_price_history_products() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'UPDATE' and old.sale_price is distinct from new.sale_price then
    insert into price_history (item_type, item_id, price, effective_from)
    values ('product', new.id, new.sale_price, current_date);
  end if;
  return null;
end;
$$;

create trigger trg_price_history_products
  after update on products
  for each row execute function trg_price_history_products();

-- Trigger riwayat harga saat harga layanan berubah
create or replace function trg_price_history_services() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'UPDATE' and old.price is distinct from new.price then
    insert into price_history (item_type, item_id, price, effective_from)
    values ('service', new.id, new.price, current_date);
  end if;
  return null;
end;
$$;

create trigger trg_price_history_services
  after update on services
  for each row execute function trg_price_history_services();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
