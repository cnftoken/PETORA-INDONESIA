create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  supplier_id uuid references public.suppliers(id),
  branch_id uuid not null references public.branches(id),
  status text not null default 'draft' check (status in ('draft','ordered','received','cancelled')),
  created_at timestamptz not null default now()
);
create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_cost integer not null
);
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
create policy suppliers_all on public.suppliers for all using (true) with check (true);
create policy po_all on public.purchase_orders for all using (true) with check (true);
create policy poi_all on public.purchase_order_items for all using (true) with check (true);
