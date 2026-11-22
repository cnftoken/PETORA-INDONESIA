-- Migrasi 0003: Pelanggan dan Hewan (Fase 3, M02)
-- Tabel: customers, patients. RLS dan audit.
-- Data pelanggan dan hewan terpusat lintas cabang (BR-003): tidak diisolasi per cabang.

-- ============================================================
-- Tabel pelanggan
-- ============================================================

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Tabel hewan / pasien
-- ============================================================

create table patients (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  patient_number text not null unique,
  name text not null,
  species text not null,
  breed text,
  gender text check (gender in ('jantan', 'betina')),
  is_neutered boolean not null default false,
  birth_date date,
  age_years integer,
  color_marks text,
  microchip text,
  photo_url text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif', 'meninggal')),
  owner_id uuid references customers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_customers_phone on customers(phone);
create index idx_customers_full_name on customers(full_name);
create index idx_customers_email on customers(email);
create index idx_patients_customer_id on patients(customer_id);
create index idx_patients_patient_number on patients(patient_number);
create index idx_patients_name on patients(name);
create index idx_patients_species on patients(species);
create index idx_patients_status on patients(status);
create index idx_patients_owner_id on patients(owner_id);

-- Indeks pencarian lintas cabang (BR-003): nama, telepon, nama hewan, nomor pasien
create index idx_customers_search on customers(full_name, phone, email);
create index idx_patients_search on patients(name, patient_number, species);

-- ============================================================
-- RLS: aktifkan di setiap tabel (tidak diisolasi per cabang per BR-003)
-- ============================================================

alter table customers enable row level security;
alter table patients enable row level security;

-- Pelanggan: semua pengguna terautentikasi boleh baca dan tulis (terpusat lintas cabang)
create policy customers_select on customers for select to public using (true);
create policy customers_insert on customers for insert to public with check (true);
create policy customers_update on customers for update to public using (true);
create policy customers_delete on customers for delete to public using (true);

-- Hewan: semua pengguna terautentikasi boleh baca dan tulis (terpusat lintas cabang)
create policy patients_select on patients for select to public using (true);
create policy patients_insert on patients for insert to public with check (true);
create policy patients_update on patients for update to public using (true);
create policy patients_delete on patients for delete to public using (true);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_customers() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, null, 'customers', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, null, 'customers', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, null, 'customers', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_customers_audit
  after insert or update or delete on customers
  for each row execute function trg_audit_customers();

create or replace function trg_audit_patients() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, null, 'patients', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, null, 'patients', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, null, 'patients', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_patients_audit
  after insert or update or delete on patients
  for each row execute function trg_audit_patients();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
