import { createServerClient } from '@/lib/supabase/server';

export async function getVisits({
  page = 1,
  pageSize = 20,
  branchId,
  status,
  search,
}: {
  page?: number;
  pageSize?: number;
  branchId?: string;
  status?: string;
  search?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('visits')
    .select('*, customers(full_name, phone), patients(name, patient_number), users(full_name)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  if (branchId) query = query.eq('branch_id', branchId);
  if (status) query = query.eq('status', status);
  if (search) {
    query = query.or(
      `customers.full_name.ilike.%${search}%,patients.name.ilike.%${search}%,patients.patient_number.ilike.%${search}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getVisitById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('visits')
    .select('*, customers(*), patients(*), users(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getVisitQueue({
  page = 1,
  pageSize = 50,
  branchId,
  status,
}: {
  page?: number;
  pageSize?: number;
  branchId?: string;
  status?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('visit_queue')
    .select('*, visits(visit_number, status, customers(full_name), patients(name, patient_number))', {
      count: 'exact',
    })
    .order('queue_number', { ascending: true });

  if (branchId) query = query.eq('branch_id', branchId);
  if (status) query = query.eq('status', status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getQueueByVisit(visitId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('visit_queue')
    .select('*')
    .eq('visit_id', visitId)
    .single();
  if (error) throw error;
  return data;
}

export async function getExaminations({
  page = 1,
  pageSize = 20,
  visitId,
  doctorId,
}: {
  page?: number;
  pageSize?: number;
  visitId?: string;
  doctorId?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('examinations')
    .select('*, visits(visit_number, patients(name, patient_number))', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  if (visitId) query = query.eq('visit_id', visitId);
  if (doctorId) query = query.eq('doctor_id', doctorId);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getExaminationById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('examinations')
    .select('*, visits(*), prescriptions(*, products(*))')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPrescriptions({
  page = 1,
  pageSize = 20,
  examinationId,
}: {
  page?: number;
  pageSize?: number;
  examinationId?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('prescriptions')
    .select('*, products(sku, name)', { count: 'exact' })
    .order('created_at', { ascending: true });

  if (examinationId) query = query.eq('examination_id', examinationId);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getInvoices({
  page = 1,
  pageSize = 20,
  branchId,
  status,
  source,
}: {
  page?: number;
  pageSize?: number;
  branchId?: string;
  status?: string;
  source?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('invoices')
    .select('*, customers(full_name), patients(name, patient_number), visits(visit_number)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  if (branchId) query = query.eq('branch_id', branchId);
  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getInvoiceById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(*), patients(*), visits(*), invoice_lines(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getInvoiceLines(invoiceId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('invoice_lines')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
