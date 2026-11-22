import { createServerClient } from '@/lib/supabase/server';

export async function getCustomers({
  page = 1,
  pageSize = 20,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('full_name', { ascending: true });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getCustomerById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getCustomerByPhone(phone: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error) throw error;
  return data;
}

export async function getPatients({
  page = 1,
  pageSize = 20,
  customerId,
  search,
}: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  search?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('patients')
    .select('*, customers(full_name, phone)')
    .order('name', { ascending: true });

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,patient_number.ilike.%${search}%,species.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getPatientById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*, customers(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPatientByNumber(patientNumber: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*, customers(*)')
    .eq('patient_number', patientNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function getPatientsByCustomer(customerId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('customer_id', customerId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}
