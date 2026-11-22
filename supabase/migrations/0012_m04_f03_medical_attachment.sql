-- Migrasi 0012: Lampiran Medis (M04-F03)
-- Tabel: medical_attachments. File disimpan di Supabase Storage bucket 'medical-attachments' (private).
-- Akses file hanya lewat signed URL berumur pendek.

-- ============================================================
-- Tabel lampiran medis
-- ============================================================

create table medical_attachments (
  id uuid primary key default gen_random_uuid(),
  examination_id uuid not null references examinations(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null check (file_type in ('image/jpeg', 'image/png', 'application/pdf')),
  file_size integer not null check (file_size > 0 and file_size <= 10 * 1024 * 1024),
  uploaded_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_medical_attachments_examination_id on medical_attachments(examination_id);
create index idx_medical_attachments_uploaded_by on medical_attachments(uploaded_by);

-- ============================================================
-- RLS: aktifkan
-- ============================================================

alter table medical_attachments enable row level security;

-- Owner semua; non-owner hanya cabang kunjungan (melalui examination -> visits)
create policy medical_attachments_select on medical_attachments for select to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = medical_attachments.examination_id and uba.user_id = current_app_user_id()
  )
);
create policy medical_attachments_insert on medical_attachments for insert to public with check (true);
create policy medical_attachments_update on medical_attachments for update to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = medical_attachments.examination_id and uba.user_id = current_app_user_id()
  )
);
create policy medical_attachments_delete on medical_attachments for delete to public using (
  exists (
    select 1 from user_roles ur join roles r on r.id = ur.role_id
    where ur.user_id = current_app_user_id() and r.code = 'owner'
  )
  or exists (
    select 1 from examinations e
    join visits v on v.id = e.visit_id
    join user_branch_assignments uba on uba.branch_id = v.branch_id
    where e.id = medical_attachments.examination_id and uba.user_id = current_app_user_id()
  )
);

-- ============================================================
-- Storage bucket untuk lampiran medis (private)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('medical-attachments', 'medical-attachments', false)
on conflict (id) do nothing;

-- Storage RLS: owner semua; non-owner hanya cabang kunjungan
create policy storage_medical_select on storage.objects for select to public using (
  bucket_id = 'medical-attachments'
  and (
    exists (
      select 1 from user_roles ur join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id() and r.code = 'owner'
    )
    or exists (
      select 1 from medical_attachments ma
      join examinations e on e.id = ma.examination_id
      join visits v on v.id = e.visit_id
      join user_branch_assignments uba on uba.branch_id = v.branch_id
      where ma.file_path = storage.objects.name and uba.user_id = current_app_user_id()
    )
  )
);
create policy storage_medical_insert on storage.objects for insert to public with check (
  bucket_id = 'medical-attachments'
);
create policy storage_medical_update on storage.objects for update to public using (
  bucket_id = 'medical-attachments'
  and (
    exists (
      select 1 from user_roles ur join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id() and r.code = 'owner'
    )
    or exists (
      select 1 from medical_attachments ma
      join examinations e on e.id = ma.examination_id
      join visits v on v.id = e.visit_id
      join user_branch_assignments uba on uba.branch_id = v.branch_id
      where ma.file_path = storage.objects.name and uba.user_id = current_app_user_id()
    )
  )
);
create policy storage_medical_delete on storage.objects for delete to public using (
  bucket_id = 'medical-attachments'
  and (
    exists (
      select 1 from user_roles ur join roles r on r.id = ur.role_id
      where ur.user_id = current_app_user_id() and r.code = 'owner'
    )
    or exists (
      select 1 from medical_attachments ma
      join examinations e on e.id = ma.examination_id
      join visits v on v.id = e.visit_id
      join user_branch_assignments uba on uba.branch_id = v.branch_id
      where ma.file_path = storage.objects.name and uba.user_id = current_app_user_id()
    )
  )
);

-- ============================================================
-- Fungsi audit
-- ============================================================

create or replace function trg_audit_medical_attachments() returns trigger
language plpgsql security definer as $$
declare
  v_actor uuid := get_current_user_id();
  v_branch uuid := (
    select v.branch_id
    from medical_attachments ma
    join examinations e on e.id = ma.examination_id
    join visits v on v.id = e.visit_id
    where ma.id = new.id
  );
begin
  if tg_op = 'INSERT' then
    perform write_audit_log(v_actor, v_branch, 'medical_attachments', new.id, 'INSERT', null, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    perform write_audit_log(v_actor, v_branch, 'medical_attachments', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
  elsif tg_op = 'DELETE' then
    perform write_audit_log(v_actor, v_branch, 'medical_attachments', old.id, 'DELETE', to_jsonb(old), null);
  end if;
  return null;
end;
$$;

create trigger trg_medical_attachments_audit
  after insert or update or delete on medical_attachments
  for each row execute function trg_audit_medical_attachments();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant select, insert, update, delete on medical_attachments to app_user;
