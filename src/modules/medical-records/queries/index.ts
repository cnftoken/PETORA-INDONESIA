import { createServerClient } from '@/lib/supabase/server';

export async function getMedicalEntries({
  page = 1,
  pageSize = 50,
  visitId,
  doctorId,
  isFinal,
}: {
  page?: number;
  pageSize?: number;
  visitId?: string;
  doctorId?: string;
  isFinal?: boolean;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('examinations')
    .select(
      '*, visits(visit_number, status, patients(name, patient_number), customers(full_name)), users(full_name)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (visitId) query = query.eq('visit_id', visitId);
  if (doctorId) query = query.eq('doctor_id', doctorId);
  if (isFinal !== undefined) query = query.eq('is_final', isFinal);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getMedicalEntryById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('examinations')
    .select('*, visits(*), users(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getDiagnosisSuggestions({
  search,
  limit = 10,
}: {
  search?: string;
  limit?: number;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('examinations')
    .select('diagnosis')
    .not('diagnosis', 'is', null)
    .neq('diagnosis', '')
    .order('diagnosis', { ascending: true });

  if (search) query = query.ilike('diagnosis', `%${search}%`);

  const { data, error } = await query.limit(limit);
  if (error) throw error;

  // Ambil diagnosis unik
  const uniqueDiagnoses = Array.from(new Set((data ?? []).map((row) => row.diagnosis)));
  return uniqueDiagnoses;
}
