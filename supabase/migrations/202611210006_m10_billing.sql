create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  branch_id uuid not null references public.branches(id),
  customer_id uuid references public.customers(id),
  animal_id uuid references public.animals(id),
  source_type text not null default 'manual',
  source_id text,
  status text not null default 'draft' check (status in ('draft','finalized','paid','partial','voided')),
  subtotal integer not null default 0,
  discount_total integer not null default 0,
  tax_total integer not null default 0,
  rounding_total integer not null default 0,
  grand_total integer not null default 0,
  paid_total integer not null default 0,
  created_by uuid references public.users(id),
  finalized_at timestamptz,
  voided_at timestamptz,
  void_reason text,
  created_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id),
  description text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  discount_amount integer not null default 0,
  tax_rate_bp integer not null default 0,
  line_total integer not null
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id),
  method text not null check (method in ('cash','transfer','qris','card')),
  amount integer not null check (amount > 0),
  reference text,
  cash_received integer,
  change_amount integer,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  idempotency_key text unique
);

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

create policy invoices_branch_read on public.invoices
  for select using (true);
create policy invoices_manage on public.invoices
  for all using (true) with check (true);
create policy invoice_items_read on public.invoice_items
  for select using (true);
create policy invoice_items_manage on public.invoice_items
  for all using (true) with check (true);
create policy payments_read on public.payments
  for select using (true);
create policy payments_manage on public.payments
  for all using (true) with check (true);

create or replace function public.finalize_invoice(p_invoice_id uuid)
returns void language plpgsql security definer as $$
declare v_total integer;
begin
  update public.invoices set status='finalized', finalized_at=now()
  where id=p_invoice_id and status='draft';
  if not found then raise exception 'Invoice not draft'; end if;
end $$;

create or replace function public.record_payment(
  p_invoice_id uuid,
  p_method text,
  p_amount integer,
  p_reference text,
  p_cash_received integer,
  p_idempotency_key text
) returns void language plpgsql security definer as $$
begin
  if exists (select 1 from public.payments where idempotency_key=p_idempotency_key) then
    return;
  end if;
  insert into public.payments(invoice_id, method, amount, reference, cash_received, change_amount, idempotency_key)
  values (p_invoice_id, p_method, p_amount, p_reference, p_cash_received,
    case when p_method='cash' and p_cash_received is not null then p_cash_received - p_amount else 0 end,
    p_idempotency_key);
  update public.invoices set paid_total = paid_total + p_amount,
    status = case when paid_total + p_amount >= grand_total then 'paid' else 'partial' end
  where id=p_invoice_id;
end $$;
