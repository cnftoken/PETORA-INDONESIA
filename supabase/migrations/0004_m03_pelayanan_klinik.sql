-- Migrasi 0004: Pelayanan Klinik (Fase 4, M03)
-- Tabel: visits, visit_queue, examinations, prescriptions, invoices, invoice_lines.
-- RLS dan audit. Nomor dokumen per BR-022, tagihan terpadu per BR-009.

-- ============================================================
-- Tabel kunjungan
-- ============================================================

create table visits (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  visit_number text not null,
  complaint text,
  doctor_id uuid references users(id),
  service_type text not null default 'konsultasi' check (service_type in ('konsultasi', 'vaksinasi', 'operasi', 'grooming')),
  status text not null default 'terdaftar' check (status in ('terdaftar', 'menunggu', 'diperiksa', 'selesai', 'dibatalkan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visits_visit_number_unique unique (branch_id, visit_number)
);

-- ============================================================
-- Tabel antrean kunjungan (Realtime untuk antrean)
-- ============================================================

create table visit_queue (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  queue_number integer not null,
  status text not null default 'menunggu' check (status in ('menunggu', 'dipanggil', 'lewati', 'selesai', 'dibatalkan')),
  called_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visit_queue_unique unique (branch_id, queue_number, status)
);

-- ============================================================
-- Tabel pemeriksaan dan tindakan
-- ============================================================

create table examinations (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  doctor_id uuid not null references users(id),
  anamnesis text,
  physical_exam text,
  diagnosis text,
  treatment_plan text,
  weight_kg numeric(5,2),
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Tabel resep dan obat
-- ============================================================

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  examination_id uuid not null references examinations(id) on delete cascade,
  product_id uuid references products(id),
  medicine_name text not null,
  dosage text not null,
  usage_instruction text not null,
  quantity integer not null default 1,
  unit_price integer not null default 0,
  total_price integer not null default 0,
  is_taxable boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Tabel tagihan terpadu (BR-009)
-- ============================================================

create table invoices (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  patient_id uuid references patients(id),
  visit_id uuid references visits(id),
  source text not null check (source in ('kunjungan', 'rawat_inap', 'retail')),
  invoice_number text not null,
  subtotal integer not null default 0,
  vat_amount integer not null default 0,
  rounding_amount integer not null default 0,
  grand_total integer not null default 0,
  status text not null default 'belum_lunas' check (status in ('belum_lunas', 'sebagian_lunas', 'lunas', 'void')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_invoice_number_unique unique (branch_id, invoice_number)
);

-- ============================================================
-- Tabel baris tagihan
-- ============================================================

create table invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  line_type text not null check (line_type in ('service', 'action', 'medicine', 'product', 'kennel')),
  item_id uuid,
  description text not null,
  quantity integer not null default 1,
  unit_price integer not null default 0,
  discount_percent numeric(5,2) not null default 0,
  discount_amount integer not null default 0,
  taxable boolean not null default true,
  tax_amount integer not null default 0,
  total_price integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indeks
-- ============================================================

create index idx_visits_branch_id on visits(branch_id);
create index idx_visits_customer_id on visits(customer_id);
create index idx_visits_patient_id on visits(patient_id);
create index idx_visits_status on visits(status);
create index idx_visits_visit_number on visits(visit_number);
create index idx_visits_created_at on visits(created_at);

create index idx_visit_queue_visit_id on visit_queue(visit_id);
create index idx_visit_queue_branch_id on visit_queue(branch_id);
create index idx_visit_queue_status on visit_queue(status);
create index idx_visit_queue_queue_number on visit_queue(queue_number);

create index idx_examinations_visit_id on examinations(visit_id);
create index idx_examinations_doctor_id on examinations(doctor_id);
create index idx_examinations_is_final on examinations(is_final);

create index idx_prescriptions_examination_id on prescriptions(examination_id);
create index idx_prescriptions_product_id on prescriptions(product_id);

create index idx_invoices_branch_id on invoices(branch_id);
create index idx_invoices_customer_id on invoices(customer_id);
create index idx_invoices_patient_id on invoices(patient_id);
create index idx_invoices_visit_id on invoices(visit_id);
create index idx_invoices_status on invoices(status);
create index idx_invoices_invoice_number on invoices(invoice_number);
create index idx_invoices_created_at on invoices(created_at);

create index idx_invoice_lines_invoice_id on invoice_lines(invoice_id);

-- ============================================================
-- RLS: aktifkan di setiap tabel
-- ============================================================

alter table visits enable row level security;
alter table visit_queue enable row level security;
alter table examinations enable row level security;
alter table prescriptions enable row level security;
alter table invoices enable row level security;
alter table invoice_lines enable row level security;

-- Visits: Owner semua; non-owner hanya cabang yang ditugaskan (BR-001)
create policy visits_select on visits for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = visits.branch_id
  )
);
create policy visits_insert on visits for insert to public with check (true);
create policy visits_update on visits for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = visits.branch_id
  )
);
create policy visits_delete on visits for delete to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
);

-- Visit queue: Owner semua; non-owner hanya cabang yang ditugaskan
create policy visit_queue_select on visit_queue for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = visit_queue.branch_id
  )
);
create policy visit_queue_insert on visit_queue for insert to public with check (true);
create policy visit_queue_update on visit_queue for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = visit_queue.branch_id
  )
);

-- Examinations: Owner semua; non-owner hanya cabang kunjungan
create policy examinations_select on examinations for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from visits v
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where v.id = examinations.visit_id and uba.user_id = current_app_user_id()
  )
);
create policy examinations_insert on examinations for insert to public with check (true);
create policy examinations_update on examinations for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from visits v
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where v.id = examinations.visit_id and uba.user_id = current_app_user_id()
  )
);

-- Prescriptions: Owner semua; non-owner hanya cabang kunjungan
create policy prescriptions_select on prescriptions for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = prescriptions.examination_id and uba.user_id = current_app_user_id()
  )
);
create policy prescriptions_insert on prescriptions for insert to public with check (true);
create policy prescriptions_update on prescriptions for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = prescriptions.examination_id and uba.user_id = current_app_user_id()
  )
);

-- Invoices: Owner semua; non-owner hanya cabang tagihan (BR-001)
create policy invoices_select on invoices for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = invoices.branch_id
  )
);
create policy invoices_insert on invoices for insert to public with check (true);
create policy invoices_update on invoices for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from user_branch_assignments uba
    where uba.user_id = current_app_user_id() and uba.branch_id = invoices.branch_id
  )
);

-- Invoice lines: ikuti invoice
create policy invoice_lines_select on invoice_lines for select to public using (
  exists (
    select 1 from invoices i
    where i.id = invoice_lines.invoice_id
    and (
      exists (
        select 1 from user_roles ur join roles r on r.id = ur.role_id
        where ur.user_id = current_app_user_id() and r.code = 'owner'
      )
      or exists (
        select 1 from user_branch_assignments uba
        where uba.user_id = current_app_user_id() and uba.branch_id = i.branch_id
      )
    )
  )
);
create policy invoice_lines_insert on invoice_lines for insert to public with check (true);
create policy invoice_lines_update on invoice_lines for update to public using (
  exists (
    select 1 from invoices i
    where i.id = invoice_lines.invoice_id
    and (
      exists (
        select 1 from user_roles ur join roles r on r.id = ur.role_id
        where ur.user_id = current_app_user_id() and r.code = 'owner'
      )
      or exists (
        select 1 from user_branch_assignments uba
        where uba.user_id = current_app_user_id() and uba.branch_id = i.branch_id
      )
    )
  )
);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_visits() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := new.branch_id;
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'visits', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'visits', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'visits', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_visits_audit
  after insert or update or delete on visits
  for each row execute function trg_audit_visits();

create or replace function trg_audit_visit_queue() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'visit_queue', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'visit_queue', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'visit_queue', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_visit_queue_audit
  after insert or update or delete on visit_queue
  for each row execute function trg_audit_visit_queue();

create or replace function trg_audit_examinations() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select branch_id from visits where id = new.visit_id
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'examinations', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'examinations', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'examinations', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_examinations_audit
  after insert or update or delete on examinations
  for each row execute function trg_audit_examinations();

create or replace function trg_audit_prescriptions() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select v.branch_id
    from prescriptions p
    join examinations e on e.id = p.examination_id
    join visits v on v.id = e.visit_id
    where p.id = new.id
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'prescriptions', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'prescriptions', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'prescriptions', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_prescriptions_audit
  after insert or update or delete on prescriptions
  for each row execute function trg_audit_prescriptions();

create or replace function trg_audit_invoices() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, new.branch_id, 'invoices', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, new.branch_id, 'invoices', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, new.branch_id, 'invoices', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_invoices_audit
  after insert or update or delete on invoices
  for each row execute function trg_audit_invoices();

create or replace function trg_audit_invoice_lines() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select branch_id from invoices where id = new.invoice_id
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'invoice_lines', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'invoice_lines', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'invoice_lines', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_invoice_lines_audit
  after insert or update or delete on invoice_lines
  for each row execute function trg_audit_invoice_lines();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant app_user to postgres;
