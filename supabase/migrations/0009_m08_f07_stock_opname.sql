-- Migrasi 0009: Stock Opname Sesi (M08-F07, BR-023)
-- Tabel: stock_opname_sessions, stock_opname_details.
-- Alur: open → counting → closed. Produk terkunci selama sesi dibuka.
-- Selisih dihitung setelah sesi ditutup, menjadi penyesuaian stok.

-- ============================================================
-- Tabel sesi stock opname
-- ============================================================

create table stock_opname_sessions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'counting', 'closed')),
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text
);

-- ============================================================
-- Tabel detail stock opname (per produk per sesi)
-- ============================================================

create table stock_opname_details (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references stock_opname_sessions(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  system_quantity integer not null default 0,
  counted_quantity integer not null default 0,
  difference integer generated always as (counted_quantity - system_quantity) stored,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_stock_opname_sessions_branch_id on stock_opname_sessions(branch_id);
create index idx_stock_opname_sessions_status on stock_opname_sessions(status);
create index idx_stock_opname_sessions_created_at on stock_opname_sessions(created_at);
create index idx_stock_opname_details_session_id on stock_opname_details(session_id);
create index idx_stock_opname_details_product_id on stock_opname_details(product_id);

-- ============================================================
-- RLS: isolasi per cabang (BR-001)
-- ============================================================

alter table stock_opname_sessions enable row level security;
alter table stock_opname_details enable row level security;

create policy stock_opname_sessions_select on stock_opname_sessions for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_opname_sessions.branch_id
  )
);
create policy stock_opname_sessions_insert on stock_opname_sessions for insert to public with check (
  exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_opname_sessions.branch_id
  )
);
create policy stock_opname_sessions_update on stock_opname_sessions for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_opname_sessions.branch_id
  )
);

create policy stock_opname_details_select on stock_opname_details for select to public using (
  exists (
    select 1 from stock_opname_sessions sos
    where sos.id = stock_opname_details.session_id
    and (
      exists (
        select 1 from user_roles ur join roles r on r.id = ur.role_id
        where ur.user_id = current_app_user_id() and r.code = 'owner'
      )
      or exists (
        select 1 from user_branch_assignments uba
        where uba.user_id = current_app_user_id() and uba.branch_id = sos.branch_id
      )
    )
  )
);
create policy stock_opname_details_insert on stock_opname_details for insert to public with check (
  exists (
    select 1 from stock_opname_sessions sos
    where sos.id = stock_opname_details.session_id
    and exists (
      select 1 from user_branch_assignments uba
      where uba.user_id = current_app_user_id() and uba.branch_id = sos.branch_id
    )
  )
);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_stock_opname_sessions() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_opname_sessions', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_opname_sessions', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_opname_sessions', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_opname_sessions_audit
  after insert or update or delete on stock_opname_sessions
  for each row execute function trg_audit_stock_opname_sessions();

create or replace function trg_audit_stock_opname_details() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select branch_id from stock_opname_sessions where id = new.session_id
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'stock_opname_details', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'stock_opname_details', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'stock_opname_details', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_opname_details_audit
  after insert or update or delete on stock_opname_details
  for each row execute function trg_audit_stock_opname_details();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
