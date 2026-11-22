-- Migrasi 0008: Penyesuaian Stok dengan Approval Flow (M08-F03, BR-006)
-- Tabel: stock_adjustments.
-- Alur: draft → approval → approved (stok berubah) / rejected (stok tidak berubah).
-- BR-006: Stok tidak boleh minus (ditangani oleh check constraint stock_balances.quantity >= 0
-- dan validasi di aplikasi saat approve).

-- ============================================================
-- Tabel penyesuaian stok
-- ============================================================

create table stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  type text not null default 'add' check (type in ('add', 'subtract', 'set')),
  quantity integer not null default 0 check (quantity >= 0),
  reason text,
  status text not null default 'draft' check (status in ('draft', 'approval', 'approved', 'rejected')),
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_by uuid references users(id),
  approved_at timestamptz
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_stock_adjustments_branch_id on stock_adjustments(branch_id);
create index idx_stock_adjustments_product_id on stock_adjustments(product_id);
create index idx_stock_adjustments_status on stock_adjustments(status);
create index idx_stock_adjustments_created_at on stock_adjustments(created_at);

-- ============================================================
-- RLS: isolasi per cabang (BR-001)
-- ============================================================

alter table stock_adjustments enable row level security;

create policy stock_adjustments_select on stock_adjustments for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_adjustments.branch_id
  )
);
create policy stock_adjustments_insert on stock_adjustments for insert to public with check (
  exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_adjustments.branch_id
  )
);
create policy stock_adjustments_update on stock_adjustments for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_adjustments.branch_id
  )
);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_stock_adjustments() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_adjustments', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_adjustments', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_adjustments', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_adjustments_audit
  after insert or update or delete on stock_adjustments
  for each row execute function trg_audit_stock_adjustments();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
