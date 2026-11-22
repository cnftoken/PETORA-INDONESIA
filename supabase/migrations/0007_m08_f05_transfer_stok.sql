-- Migrasi 0007: Transfer Stok Antar Cabang (M08-F05, BR-017)
-- Tabel: stock_transfers, stock_transfer_details.
-- Alur: draft → dikirim → diterima. Stok asal berkurang saat dikirim,
-- tujuan bertambah saat diterima. Batch dan kedaluwarsa terbawa.

-- ============================================================
-- Tabel transfer stok (header)
-- ============================================================

create table stock_transfers (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  destination_branch_id uuid not null references branches(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'dikirim', 'diterima', 'dibatalkan')),
  reference text not null,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  checked_by uuid references users(id),
  checked_at timestamptz,
  constraint stock_transfers_ref_unique unique (reference)
);

-- ============================================================
-- Tabel detail transfer stok
-- ============================================================

create table stock_transfer_details (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references stock_transfers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 0 check (quantity > 0),
  batch_no text,
  expiry_date date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_stock_transfers_branch_id on stock_transfers(branch_id);
create index idx_stock_transfers_destination on stock_transfers(destination_branch_id);
create index idx_stock_transfers_status on stock_transfers(status);
create index idx_stock_transfers_created_at on stock_transfers(created_at);
create index idx_stock_transfer_details_transfer_id on stock_transfer_details(transfer_id);
create index idx_stock_transfer_details_product_id on stock_transfer_details(product_id);

-- ============================================================
-- RLS: aktifkan di setiap tabel (isolasi per cabang BR-001)
-- ============================================================

alter table stock_transfers enable row level security;
alter table stock_transfer_details enable row level security;

-- Stock transfers: Owner semua; non-owner hanya cabang asal atau tujuan
create policy stock_transfers_select on stock_transfers for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id()
      and (uba.branch_id = stock_transfers.branch_id or uba.branch_id = stock_transfers.destination_branch_id)
  )
);
create policy stock_transfers_insert on stock_transfers for insert to public with check (
  exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_transfers.branch_id
  )
);
create policy stock_transfers_update on stock_transfers for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = stock_transfers.branch_id
  )
);

create policy stock_transfer_details_select on stock_transfer_details for select to public using (
  exists (
    select 1 from stock_transfers st
    where st.id = stock_transfer_details.transfer_id
    and (
      exists (
        select 1 from user_roles ur join roles r on r.id = ur.role_id
        where ur.user_id = current_app_user_id() and r.code = 'owner'
      )
      or exists (
        select 1 from user_branch_assignments uba
        where uba.user_id = current_app_user_id()
          and (uba.branch_id = st.branch_id or uba.branch_id = st.destination_branch_id)
      )
    )
  )
);
create policy stock_transfer_details_insert on stock_transfer_details for insert to public with check (
  exists (
    select 1 from stock_transfers st
    where st.id = stock_transfer_details.transfer_id
    and exists (
      select 1 from user_branch_assignments uba
      where uba.user_id = current_app_user_id() and uba.branch_id = st.branch_id
    )
  )
);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_stock_transfers() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_transfers', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_transfers', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'stock_transfers', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_transfers_audit
  after insert or update or delete on stock_transfers
  for each row execute function trg_audit_stock_transfers();

create or replace function trg_audit_stock_transfer_details() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select branch_id from stock_transfers where id = new.transfer_id
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'stock_transfer_details', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'stock_transfer_details', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'stock_transfer_details', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_stock_transfer_details_audit
  after insert or update or delete on stock_transfer_details
  for each row execute function trg_audit_stock_transfer_details();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
