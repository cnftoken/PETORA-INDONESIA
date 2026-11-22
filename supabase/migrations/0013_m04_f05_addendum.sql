-- Migrasi 0013: Addendum Entri Medis (M04-F05)
-- Tabel: medical_addenda. Addendum disimpan terpisah agar entri asli utuh (BR-004).
-- Setiap addenda memiliki penulis, waktu, dan alasan.

-- ============================================================
-- Tabel addendum entri medis
-- ============================================================

create table medical_addenda (
  id uuid primary key default gen_random_uuid(),
  examination_id uuid not null references examinations(id) on delete cascade,
  author_id uuid not null references users(id),
  reason text not null,
  anamnesis text,
  physical_exam text,
  diagnosis text,
  treatment_plan text,
  weight_kg numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_medical_addenda_examination_id on medical_addenda(examination_id);
create index idx_medical_addenda_created_at on medical_addenda(created_at);

-- ============================================================
-- RLS: aktifkan
-- ============================================================

alter table medical_addenda enable row level security;

-- Owner semua; non-owner hanya cabang kunjungan (melalui examination -> visits)
create policy medical_addenda_select on medical_addenda for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = medical_addenda.examination_id and uba.user_id = current_app_user_id()
  )
);
create policy medical_addenda_insert on medical_addenda for insert to public with check (true);
create policy medical_addenda_update on medical_addenda for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = medical_addenda.examination_id and uba.user_id = current_app_user_id()
  )
);
create policy medical_addenda_delete on medical_addenda for delete to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = medical_addenda.examination_id and uba.user_id = current_app_user_id()
  )
);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_medical_addenda() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select v.branch_id
    from medical_addenda ma
    join examinations e on e.id = ma.examination_id
    join visits v on v.id = e.visit_id
    where ma.id = new.id
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'medical_addenda', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'medical_addenda', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'medical_addenda', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_medical_addenda_audit
  after insert or update or delete on medical_addenda
  for each row execute function trg_audit_medical_addenda();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant select, insert, update, delete on medical_addenda to app_user;
