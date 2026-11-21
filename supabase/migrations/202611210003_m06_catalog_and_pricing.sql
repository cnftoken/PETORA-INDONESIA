create table public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references public.catalog_categories(id),
  unit text not null,
  barcode text unique,
  sale_price integer not null check (sale_price >= 0),
  last_purchase_price integer not null default 0 check (last_purchase_price >= 0),
  tracked_by_batch boolean not null default false,
  tracked_by_expiry boolean not null default false,
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  taxable boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category_id uuid references public.catalog_categories(id),
  price integer not null check (price >= 0),
  taxable boolean not null default false,
  performer text not null check (performer in ('doctor', 'nurse')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.price_history (
  id bigint generated always as identity primary key,
  item_type text not null check (item_type in ('product', 'service')),
  item_id uuid not null,
  old_price integer,
  new_price integer not null check (new_price >= 0),
  effective_at timestamptz not null default now(),
  changed_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index products_search_idx
  on public.products using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(barcode, '')));
create index products_category_idx on public.products(category_id);
create index services_search_idx
  on public.services using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(code, '')));
create index price_history_item_idx on public.price_history(item_type, item_id, effective_at);

alter table public.catalog_categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.price_history enable row level security;

create policy catalog_categories_read on public.catalog_categories
  for select to authenticated
  using (public.has_permission('catalog'));

create policy catalog_categories_manage on public.catalog_categories
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy products_read on public.products
  for select to authenticated
  using (active and public.has_permission('catalog'));

create policy products_manage on public.products
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy services_read on public.services
  for select to authenticated
  using (active and public.has_permission('catalog'));

create policy services_manage on public.services
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy price_history_read on public.price_history
  for select to authenticated
  using (public.has_permission('catalog'));

create policy price_history_manage on public.price_history
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create or replace function public.record_catalog_price_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item_kind text;
  new_value integer;
  old_value integer;
begin
  item_kind := case when tg_table_name = 'products' then 'product' else 'service' end;
  if item_kind = 'product' then
    if tg_op = 'UPDATE' and new.sale_price = old.sale_price then
      return new;
    end if;
    new_value := new.sale_price;
    old_value := case when tg_op = 'UPDATE' then old.sale_price else null end;
  else
    if tg_op = 'UPDATE' and new.price = old.price then
      return new;
    end if;
    new_value := new.price;
    old_value := case when tg_op = 'UPDATE' then old.price else null end;
  end if;
  insert into public.price_history(item_type, item_id, old_price, new_price, changed_by)
  values (item_kind, new.id, old_value, new_value, auth.uid());
  return new;
end;
$$;

create trigger products_price_history
  after insert or update on public.products
  for each row execute function public.record_catalog_price_change();

create trigger services_price_history
  after insert or update on public.services
  for each row execute function public.record_catalog_price_change();
