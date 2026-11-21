alter table public.users
  add column active_branch_id uuid references public.branches(id);

create table public.company_setting_history (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.company(id) on delete restrict,
  setting_name text not null,
  old_value jsonb,
  new_value jsonb not null,
  effective_at timestamptz not null default now(),
  changed_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

alter table public.company_setting_history enable row level security;

create or replace function public.current_operational_user()
returns public.users
language sql
stable
security definer
set search_path = public
as $$
  select u.* from public.users u where u.id = auth.uid();
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.account_type = 'operational'
      and u.role = 'owner'
      and u.active
  );
$$;

create or replace function public.is_active_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner();
$$;

create or replace function public.has_permission(required_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_owner()
    or exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.active
        and u.account_type = 'operational'
        and (
          exists (
            select 1
            from public.role_permissions rp
            where rp.role = u.role
              and rp.permission_id = required_permission
          )
          or exists (
            select 1
            from public.user_permissions up
            where up.user_id = u.id
              and up.permission_id = required_permission
          )
        )
    );
$$;

create or replace function public.is_assigned_to_branch(branch uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner() or exists (
    select 1
    from public.branch_assignments ba
    where ba.user_id = auth.uid()
      and ba.branch_id = branch
  );
$$;

create policy company_owner_select on public.company
  for select to authenticated
  using (public.is_owner());

create policy company_owner_update on public.company
  for update to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy branches_owner_manage on public.branches
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy branches_assigned_read on public.branches
  for select to authenticated
  using (public.is_assigned_to_branch(id));

create policy users_owner_manage on public.users
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy users_self_read on public.users
  for select to authenticated
  using (id = auth.uid());

create policy branch_assignments_owner_manage on public.branch_assignments
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy branch_assignments_self_read on public.branch_assignments
  for select to authenticated
  using (user_id = auth.uid());

create policy permissions_authenticated_read on public.permissions
  for select to authenticated
  using (true);

create policy role_permissions_owner_manage on public.role_permissions
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy role_permissions_authenticated_read on public.role_permissions
  for select to authenticated
  using (true);

create policy user_permissions_owner_manage on public.user_permissions
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy audit_owner_read on public.audit_log
  for select to authenticated
  using (
    public.is_owner()
    or (
      public.has_permission('audit')
      and public.is_assigned_to_branch(branch_id)
    )
  );

create policy audit_no_mutation on public.audit_log
  for insert to authenticated
  with check (public.is_owner() or public.has_permission('organization'));

create policy settings_owner_manage on public.company_setting_history
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

insert into public.role_permissions (role, permission_id, access_level) values
  ('owner', 'organization', 'full'),
  ('owner', 'customers', 'full'),
  ('owner', 'visits', 'read'),
  ('owner', 'medical_read', 'read'),
  ('owner', 'inpatient_admin', 'read'),
  ('owner', 'inpatient_notes', 'read'),
  ('owner', 'catalog', 'full'),
  ('owner', 'stock', 'full'),
  ('owner', 'stock_approval', 'full'),
  ('owner', 'procurement', 'full'),
  ('owner', 'billing', 'read'),
  ('owner', 'discount_approval', 'full'),
  ('owner', 'reports', 'full'),
  ('owner', 'audit', 'full'),
  ('supervisor', 'organization', 'read'),
  ('supervisor', 'customers', 'full'),
  ('supervisor', 'visits', 'full'),
  ('supervisor', 'medical_read', 'read'),
  ('supervisor', 'inpatient_admin', 'full'),
  ('supervisor', 'inpatient_notes', 'read'),
  ('supervisor', 'catalog', 'read'),
  ('supervisor', 'stock', 'full'),
  ('supervisor', 'stock_approval', 'full'),
  ('supervisor', 'procurement', 'full'),
  ('supervisor', 'billing', 'full'),
  ('supervisor', 'discount_approval', 'full'),
  ('supervisor', 'reports', 'full'),
  ('supervisor', 'audit', 'read'),
  ('doctor', 'customers', 'full'),
  ('doctor', 'visits', 'full'),
  ('doctor', 'medical_read', 'full'),
  ('doctor', 'medical_write', 'full'),
  ('doctor', 'inpatient_admin', 'full'),
  ('doctor', 'inpatient_notes', 'full'),
  ('doctor', 'catalog', 'read'),
  ('doctor', 'stock', 'read'),
  ('doctor', 'billing', 'read');

create or replace function public.record_phase1_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_id text;
begin
  record_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id');
  insert into public.audit_log (
    actor_id,
    entity_type,
    entity_id,
    action,
    old_value,
    new_value
  ) values (
    auth.uid(),
    tg_table_name,
    record_id,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger company_audit
  after insert or update or delete on public.company
  for each row execute function public.record_phase1_audit();

create trigger branches_audit
  after insert or update or delete on public.branches
  for each row execute function public.record_phase1_audit();

create trigger users_audit
  after insert or update or delete on public.users
  for each row execute function public.record_phase1_audit();

create trigger branch_assignments_audit
  after insert or update or delete on public.branch_assignments
  for each row execute function public.record_phase1_audit();

create trigger role_permissions_audit
  after insert or update or delete on public.role_permissions
  for each row execute function public.record_phase1_audit();

create trigger user_permissions_audit
  after insert or update or delete on public.user_permissions
  for each row execute function public.record_phase1_audit();
