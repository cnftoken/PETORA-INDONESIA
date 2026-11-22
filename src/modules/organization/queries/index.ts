import { createServerClient } from '@/lib/supabase/server';

export async function getCompanies() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCompanyById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getBranches() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('branches')
    .select('*, company_id')
    .order('code', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getBranchById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getUsers() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('*, role_id, user_branch_assignments(*), user_roles(*)')
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRoles() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('code', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPermissions() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('group_name, permission_key', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getBranchSettings() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('branch_settings')
    .select('*, branches(code, name)')
    .order('branches(code)', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAuditLogs({
  page = 1,
  pageSize = 20,
  actorUserId,
  branchId,
  entity,
  startDate,
  endDate,
}: {
  page?: number;
  pageSize?: number;
  actorUserId?: string;
  branchId?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('audit_logs')
    .select('*, users(full_name), branches(code, name)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (actorUserId) query = query.eq('actor_user_id', actorUserId);
  if (branchId) query = query.eq('branch_id', branchId);
  if (entity) query = query.eq('entity', entity);
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}
