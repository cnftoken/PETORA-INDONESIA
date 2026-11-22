'use server';

import { createServerClient } from '@/lib/supabase/server';
import { companySchema, branchSchema, userSchema, branchAssignmentSchema, branchSettingSchema } from '@/modules/organization/schemas';
import type { CompanyInput, BranchInput, UserInput, BranchAssignmentInput, BranchSettingInput } from '@/modules/organization/schemas';

export async function createCompany(input: CompanyInput) {
  const validated = companySchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('companies')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCompany(id: string, input: Partial<CompanyInput>) {
  const validated = companySchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('companies')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createBranch(input: BranchInput) {
  const validated = branchSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('branches')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBranch(id: string, input: Partial<BranchInput>) {
  const validated = branchSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('branches')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createUser(input: UserInput) {
  const validated = userSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('users')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(id: string, input: Partial<UserInput>) {
  const validated = userSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('users')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function assignUserToBranch(input: BranchAssignmentInput) {
  const validated = branchAssignmentSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('user_branch_assignments')
    .upsert(validated as any, { onConflict: ['user_id', 'branch_id'] as any })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function removeUserFromBranch(userId: string, branchId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('user_branch_assignments')
    .delete()
    .eq('user_id', userId)
    .eq('branch_id', branchId);
  if (error) throw new Error(error.message);
}

export async function updateBranchSetting(input: BranchSettingInput) {
  const validated = branchSettingSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('branch_settings')
    .upsert(validated as any, { onConflict: ['branch_id'] as any })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function grantUserPermission(userId: string, permissionId: string, branchId: string | null = null) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('user_permissions')
    .upsert(
      { user_id: userId, permission_id: permissionId, branch_id: branchId, granted: true } as any,
      { onConflict: ['user_id', 'permission_id', 'branch_id'] as any }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function revokeUserPermission(userId: string, permissionId: string, branchId: string | null = null) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission_id', permissionId)
    .eq('branch_id', branchId as any);
  if (error) throw new Error(error.message);
}
