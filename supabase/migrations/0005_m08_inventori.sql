-- Migrasi 0005: Inventori (Fase 5, M08)
-- Tabel: stock_balances, stock_batches, stock_mutations.
-- RLS dan audit. BR-006 (stok tidak minus), BR-007 (FEFO), BR-024 (decrement stok).

-- ============================================================
-- Tabel saldo stok per cabang per produk
-- ============================================================

create table stock_balances (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stock_balances_unique unique (branch_id, product_id)
);

-- ============================================================
-- Tabel batch stok (kedaluwarsa, FEFO)
-- ============================================================

create table stock_batches (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  batch_no text not null,
  expiry_date date not null,
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stock_batches_unique unique (branch_id, product_id, batch_no)
);

-- ============================================================
-- Tabel kartu stok / mutasi
-- ============================================================

create table stock_mutations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  batch_id uuid references stock_batches(id) on delete set null,
  mutation_type text not null check (mutation_type in ('in', 'out', 'adjustment', 'return')),
  quantity integer not null,
  reference text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_stock_balances_branch_id on stock_balances(branch_id);
create index idx_stock_balances_product_id on stock_balances(product_id);
create index idx_stock_balances_branch_product on stock_balances(branch_id, product_id);

create index idx_stock_batches_branch_id on stock_batches(branch_id);
create index idx_stock_batches_product_id on stock_batches(product_id);
create index idx_stock_batches_expiry_date on stock_batches(expiry_date);
create index idx_stock_batches_branch_product on stock_batches(branch_id, product_id);

create index idx_stock_mutations_branch_id on stock_mutations(branch_id);
create index idx_stock_mutations_product_id on stock_mutations(product_id);
create index idx_stock_mutations_batch_id on stock_mutations(batch_id);
create index idx_stock_mutations_created_at on stock_mutations(created_at);

-- ============================================================
-- RLS: aktifkan di setiap tabel (isolasi per cabang BR-001)
-- ============================================================

alter table stock_balances enable row level security;
alter table stock_batches enable row level security;
alter table stock_mutations enable row level security;

-- Stok: Owner semua; non-owner hanya cabang yang ditugaskan
create policy stock_balances_select on stock_balances for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_balances.branch_id
  )
);
create policy stock_balances_insert on stock_balances for insert to public with check (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_balances.branch_id
  )
);
create policy stock_balances_update on stock_balances for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_balances.branch_id
  )
);

create policy stock_batches_select on stock_batches for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_batches.branch_id
  )
);
create policy stock_batches_insert on stock_batches for insert to public with check (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_batches.branch_id
  )
);
create policy stock_batches_update on stock_batches for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_batches.branch_id
  )
);

create policy stock_mutations_select on stock_mutations for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_mutations.branch_id
  )
);
create policy stock_mutations_insert on stock_mutations for insert to public with check (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_mutations.branch_id
  )
);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_stock_balances() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_balances', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_balances', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_balances', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_balances_audit
  after insert or update or delete on stock_balances
  for each row execute function trg_audit_stock_balances();

create or replace function trg_audit_stock_batches() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_batches', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_batches', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_batches', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_batches_audit
  after insert or update or delete on stock_batches
  for each row execute function trg_audit_stock_batches();

create or replace function trg_audit_stock_mutations() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_mutations', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_mutations', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_mutations', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_mutations_audit
  after insert or update or delete on stock_mutations
  for each row execute function trg_audit_stock_mutations();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
