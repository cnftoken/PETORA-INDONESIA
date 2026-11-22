'use server';

import { createServerClient } from '@/lib/supabase/server';
import { customerSchema, patientSchema } from '@/modules/customers/schemas';
import type { CustomerInput, PatientInput } from '@/modules/customers/schemas';

export async function createCustomer(input: CustomerInput) {
  const validated = customerSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('customers')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const validated = customerSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('customers')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCustomer(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createPatient(input: PatientInput) {
  const validated = patientSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('patients')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePatient(id: string, input: Partial<PatientInput>) {
  const validated = patientSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('patients')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePatient(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
