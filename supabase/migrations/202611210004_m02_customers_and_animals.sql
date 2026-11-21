create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_normalized text not null unique,
  email text,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_phone_format
    check (phone_normalized ~ '^[+][0-9]{8,15}$')
);

create table public.animals (
  id uuid primary key default gen_random_uuid(),
  patient_number text not null unique,
  owner_id uuid not null references public.customers(id) on delete restrict,
  name text not null,
  species text not null,
  breed text,
  sex text not null check (sex in ('male', 'female', 'unknown')),
  sterilized boolean not null default false,
  birth_date date,
  estimated_age_months integer check (estimated_age_months >= 0),
  color text,
  markings text,
  microchip text,
  photo_path text,
  status text not null default 'active' check (status in ('active', 'deceased')),
  last_weight_grams integer check (last_weight_grams >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint animals_age_or_birth check (birth_date is not null or estimated_age_months is not null)
);

create table public.animal_owner_history (
  id bigint generated always as identity primary key,
  animal_id uuid not null references public.animals(id) on delete cascade,
  old_owner_id uuid references public.customers(id),
  new_owner_id uuid not null references public.customers(id),
  reason text,
  changed_by uuid references public.users(id),
  changed_at timestamptz not null default now()
);

create table public.animal_timeline (
  id bigint generated always as identity primary key,
  animal_id uuid not null references public.animals(id) on delete cascade,
  branch_id uuid references public.branches(id),
  event_type text not null,
  title text not null,
  description text,
  occurred_at timestamptz not null default now(),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.animal_attachments (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete restrict,
  object_path text not null,
  file_name text not null,
  media_type text not null check (media_type in ('image/jpeg', 'image/png', 'application/pdf')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 10485760),
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.portal_accounts (
  id uuid primary key references auth.users(id) on delete restrict,
  customer_id uuid not null unique references public.customers(id) on delete restrict,
  invited_email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index customers_search_idx
  on public.customers using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(phone_normalized, '') || ' ' || coalesce(email, '')));
create index animals_search_idx
  on public.animals using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(patient_number, '') || ' ' || coalesce(microchip, '')));
create index animals_owner_idx on public.animals(owner_id);
create index animal_timeline_animal_idx on public.animal_timeline(animal_id, occurred_at desc);
create index animal_attachments_animal_idx on public.animal_attachments(animal_id, created_at desc);

create or replace function public.normalize_phone(input_phone text)
returns text
language plpgsql
immutable
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(input_phone, ''), '[^0-9]', '', 'g');
  if left(digits, 1) = '0' then
    digits := '62' || substr(digits, 2);
  elsif left(digits, 2) = '62' then
    digits := digits;
  else
    digits := '62' || digits;
  end if;
  return '+' || digits;
end;
$$;

create or replace function public.set_customer_normalized_phone()
returns trigger
language plpgsql
as $$
begin
  new.phone_normalized := public.normalize_phone(new.phone_normalized);
  return new;
end;
$$;

create trigger customers_normalize_phone
  before insert or update of phone_normalized on public.customers
  for each row execute function public.set_customer_normalized_phone();

create or replace function public.record_animal_owner_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.owner_id is distinct from old.owner_id then
    insert into public.animal_owner_history(animal_id, old_owner_id, new_owner_id, changed_by)
    values (new.id, old.owner_id, new.owner_id, auth.uid());
  end if;
  return new;
end;
$$;

create trigger animals_owner_history
  after update of owner_id on public.animals
  for each row execute function public.record_animal_owner_change();

alter table public.customers enable row level security;
alter table public.animals enable row level security;
alter table public.animal_owner_history enable row level security;
alter table public.animal_timeline enable row level security;
alter table public.animal_attachments enable row level security;
alter table public.portal_accounts enable row level security;

create policy customers_central_read on public.customers
  for select to authenticated
  using (public.has_permission('customers'));

create policy customers_manage on public.customers
  for all to authenticated
  using (public.has_permission('customers'))
  with check (public.has_permission('customers'));

create policy animals_central_read on public.animals
  for select to authenticated
  using (public.has_permission('customers'));

create policy animals_manage on public.animals
  for all to authenticated
  using (public.has_permission('customers'))
  with check (public.has_permission('customers'));

create policy animal_owner_history_read on public.animal_owner_history
  for select to authenticated
  using (public.has_permission('customers'));

create policy animal_owner_history_manage on public.animal_owner_history
  for insert to authenticated
  with check (public.has_permission('customers'));

create policy animal_timeline_read on public.animal_timeline
  for select to authenticated
  using (
    public.has_permission('medical_read')
    or public.has_permission('customers')
  );

create policy animal_timeline_manage on public.animal_timeline
  for all to authenticated
  using (
    public.has_permission('medical_write')
    or public.has_permission('customers')
  )
  with check (
    public.has_permission('medical_write')
    or public.has_permission('customers')
  );

create policy animal_attachments_read on public.animal_attachments
  for select to authenticated
  using (public.has_permission('medical_read') or public.has_permission('customers'));

create policy animal_attachments_manage on public.animal_attachments
  for all to authenticated
  using (public.has_permission('customers') or public.has_permission('medical_write'))
  with check (public.has_permission('customers') or public.has_permission('medical_write'));

create policy portal_accounts_owner_manage on public.portal_accounts
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('animal-files', 'animal-files', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
