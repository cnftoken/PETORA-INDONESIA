create table public.stock_batches (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id),
  product_id uuid not null references public.products(id),
  batch_number text not null,
  expiry_date date,
  quantity integer not null default 0 check (quantity >= 0),
  purchase_price integer not null default 0 check (purchase_price >= 0),
  received_at timestamptz not null default now(),
  unique (branch_id, product_id, batch_number)
);

create table public.stock_movements (
  id bigint generated always as identity primary key,
  branch_id uuid not null references public.branches(id),
  product_id uuid not null references public.products(id),
  batch_id uuid references public.stock_batches(id),
  movement_type text not null,
  quantity_delta integer not null,
  running_balance integer not null,
  source_type text not null,
  source_id text not null,
  reason text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id),
  product_id uuid not null references public.products(id),
  batch_id uuid references public.stock_batches(id),
  quantity_delta integer not null,
  reason text not null,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected')),
  requested_by uuid references public.users(id),
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  number text,
  source_branch_id uuid not null references public.branches(id),
  destination_branch_id uuid not null references public.branches(id),
  status text not null default 'draft' check (status in ('draft', 'sent', 'received', 'cancelled')),
  sent_at timestamptz,
  received_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  constraint stock_transfer_different_branches check (source_branch_id <> destination_branch_id)
);

create table public.stock_transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.stock_transfers(id) on delete cascade,
  product_id uuid not null references public.products(id),
  batch_id uuid not null references public.stock_batches(id),
  quantity_sent integer not null check (quantity_sent > 0),
  quantity_received integer,
  variance_reason text,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz
);

create table public.stock_count_sessions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id),
  status text not null default 'opened' check (status in ('opened', 'counted', 'approved', 'cancelled')),
  opened_by uuid references public.users(id),
  approved_by uuid references public.users(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.stock_count_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.stock_count_sessions(id) on delete cascade,
  product_id uuid not null references public.products(id),
  system_quantity integer not null check (system_quantity >= 0),
  physical_quantity integer check (physical_quantity >= 0),
  unique (session_id, product_id)
);

create index stock_batches_fefo_idx
  on public.stock_batches(branch_id, product_id, expiry_date nulls last);
create index stock_movements_card_idx
  on public.stock_movements(branch_id, product_id, created_at desc);

alter table public.stock_batches enable row level security;
alter table public.stock_movements enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.stock_transfers enable row level security;
alter table public.stock_transfer_items enable row level security;
alter table public.stock_count_sessions enable row level security;
alter table public.stock_count_items enable row level security;

create policy inventory_assigned_read on public.stock_batches
  for select to authenticated
  using (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'));
create policy inventory_assigned_manage on public.stock_batches
  for all to authenticated
  using (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'))
  with check (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'));

create policy inventory_movements_read on public.stock_movements
  for select to authenticated
  using (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'));

create policy inventory_adjustments_access on public.stock_adjustments
  for all to authenticated
  using (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'))
  with check (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'));

create policy inventory_transfers_access on public.stock_transfers
  for all to authenticated
  using (
    public.is_assigned_to_branch(source_branch_id)
    or public.is_assigned_to_branch(destination_branch_id)
  )
  with check (
    public.is_assigned_to_branch(source_branch_id)
    or public.is_assigned_to_branch(destination_branch_id)
  );

create policy inventory_transfer_items_access on public.stock_transfer_items
  for all to authenticated
  using (exists (
    select 1 from public.stock_transfers t
    where t.id = transfer_id
      and (public.is_assigned_to_branch(t.source_branch_id) or public.is_assigned_to_branch(t.destination_branch_id))
  ))
  with check (true);

create policy inventory_count_access on public.stock_count_sessions
  for all to authenticated
  using (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'))
  with check (public.is_assigned_to_branch(branch_id) and public.has_permission('stock'));

create policy inventory_count_items_access on public.stock_count_items
  for all to authenticated
  using (exists (
    select 1 from public.stock_count_sessions s
    where s.id = session_id and public.is_assigned_to_branch(s.branch_id)
  ))
  with check (true);

create or replace function public.inventory_balance(p_branch_id uuid, p_product_id uuid)
returns integer
language sql
stable
as $$
  select coalesce(sum(quantity_delta), 0)::integer
  from public.stock_movements
  where branch_id = p_branch_id and product_id = p_product_id;
$$;

create or replace function public.reduce_stock_fefo(
  p_branch_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_source_type text,
  p_source_id text,
  p_reason text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  remaining integer := p_quantity;
  batch record;
  taken integer;
  balance integer;
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;
  if public.inventory_balance(p_branch_id, p_product_id) < p_quantity then
    raise exception 'BR-006: Stok tidak cukup. Tersisa % unit', public.inventory_balance(p_branch_id, p_product_id);
  end if;

  for batch in
    select * from public.stock_batches
    where branch_id = p_branch_id
      and product_id = p_product_id
      and quantity > 0
      and (expiry_date is null or expiry_date > current_date)
    order by (expiry_date is null), expiry_date asc, received_at asc
    for update
  loop
    exit when remaining = 0;
    taken := least(batch.quantity, remaining);
    update public.stock_batches set quantity = quantity - taken where id = batch.id;
    remaining := remaining - taken;
    balance := public.inventory_balance(p_branch_id, p_product_id) - (p_quantity - remaining);
    insert into public.stock_movements(
      branch_id, product_id, batch_id, movement_type, quantity_delta,
      running_balance, source_type, source_id, reason, created_by
    )
    values (
      p_branch_id, p_product_id, batch.id, 'out', -taken,
      balance, p_source_type, p_source_id, p_reason, auth.uid()
    );
  end loop;
  if remaining <> 0 then
    raise exception 'BR-006: Stok batch tidak cukup';
  end if;
end;
$$;

create or replace function public.receive_stock(
  p_branch_id uuid,
  p_product_id uuid,
  p_batch_number text,
  p_expiry_date date,
  p_quantity integer,
  p_purchase_price integer,
  p_source_type text,
  p_source_id text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  batch_id uuid;
  balance integer;
begin
  if p_quantity <= 0 then
    raise exception 'Jumlah penerimaan harus positif';
  end if;
  insert into public.stock_batches(
    branch_id, product_id, batch_number, expiry_date, quantity, purchase_price
  )
  values (
    p_branch_id, p_product_id, p_batch_number, p_expiry_date, p_quantity, p_purchase_price
  )
  on conflict (branch_id, product_id, batch_number)
  do update set
    quantity = public.stock_batches.quantity + excluded.quantity,
    expiry_date = coalesce(excluded.expiry_date, public.stock_batches.expiry_date),
    purchase_price = excluded.purchase_price
  returning id into batch_id;

  balance := public.inventory_balance(p_branch_id, p_product_id) + p_quantity;
  insert into public.stock_movements(
    branch_id, product_id, batch_id, movement_type, quantity_delta,
    running_balance, source_type, source_id, created_by
  )
  values (
    p_branch_id, p_product_id, batch_id, 'in', p_quantity,
    balance, p_source_type, p_source_id, auth.uid()
  );

  update public.products
  set last_purchase_price = p_purchase_price
  where id = p_product_id;

  return batch_id;
end;
$$;

create or replace function public.send_stock_transfer(p_transfer_id uuid)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  transfer record;
  item record;
  batch record;
  source_balance integer;
  transfer_number text;
begin
  select * into transfer from public.stock_transfers where id = p_transfer_id for update;
  if not found then raise exception 'Transfer tidak ditemukan'; end if;
  if transfer.status <> 'draft' then raise exception 'Transfer hanya dapat dikirim dari draft'; end if;
  for item in select * from public.stock_transfer_items where transfer_id = p_transfer_id for update loop
    select * into batch from public.stock_batches where id = item.batch_id for update;
    if batch.quantity < item.quantity_sent then
      raise exception 'BR-006: Stok tidak cukup untuk transfer batch';
    end if;
    update public.stock_batches set quantity = quantity - item.quantity_sent where id = batch.id;
    source_balance := public.inventory_balance(transfer.source_branch_id, item.product_id) - item.quantity_sent;
    insert into public.stock_movements(
      branch_id, product_id, batch_id, movement_type, quantity_delta,
      running_balance, source_type, source_id, created_by
    ) values (
      transfer.source_branch_id, item.product_id, batch.id, 'transfer_out',
      -item.quantity_sent, source_balance, 'transfer', transfer.id::text, auth.uid()
    );
  end loop;
  transfer_number := 'TRF-' || to_char(now(), 'YYYY') || '-' || substr(p_transfer_id::text, 1, 8);
  update public.stock_transfers
  set status = 'sent', number = transfer_number, sent_at = now()
  where id = p_transfer_id;
  return transfer_number;
end;
$$;

create or replace function public.receive_stock_transfer(p_transfer_id uuid, p_quantities jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  transfer record;
  item record;
  quantity_received integer;
  destination_batch_id uuid;
  balance integer;
begin
  select * into transfer from public.stock_transfers where id = p_transfer_id for update;
  if not found then raise exception 'Transfer tidak ditemukan'; end if;
  if transfer.status <> 'sent' then raise exception 'Transfer hanya dapat diterima setelah dikirim'; end if;

  for item in select * from public.stock_transfer_items where transfer_id = p_transfer_id for update loop
    quantity_received := coalesce((p_quantities -> item.id::text)::integer, item.quantity_sent);
    if quantity_received < 0 or quantity_received > item.quantity_sent then
      raise exception 'Jumlah diterima tidak valid';
    end if;
    update public.stock_transfer_items
    set quantity_received = quantity_received
    where id = item.id;

    insert into public.stock_batches(
      branch_id, product_id, batch_number, expiry_date, quantity, purchase_price
    )
    select
      transfer.destination_branch_id,
      source.product_id,
      source.batch_number,
      source.expiry_date,
      quantity_received,
      source.purchase_price
    from public.stock_batches source
    where source.id = item.batch_id
    on conflict (branch_id, product_id, batch_number)
    do update set quantity = public.stock_batches.quantity + excluded.quantity
    returning id into destination_batch_id;

    balance := public.inventory_balance(transfer.destination_branch_id, item.product_id) + quantity_received;
    insert into public.stock_movements(
      branch_id, product_id, batch_id, movement_type, quantity_delta,
      running_balance, source_type, source_id, created_by
    ) values (
      transfer.destination_branch_id, item.product_id, destination_batch_id,
      'transfer_in', quantity_received, balance, 'transfer', transfer.id::text, auth.uid()
    );
  end loop;
  update public.stock_transfers set status = 'received', received_at = now() where id = p_transfer_id;
end;
$$;
