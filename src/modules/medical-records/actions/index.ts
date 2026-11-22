'use server';

import { createServerClient } from '@/lib/supabase/server';
import {
  medicalEntrySchema,
  medicalEntryUpdateSchema,
  medicalFinalizeSchema,
  medicalAddendumSchema,
} from '@/modules/medical-records/schemas';
import type {
  MedicalEntryInput,
  MedicalEntryUpdateInput,
  MedicalFinalizeInput,
  MedicalAddendumInput,
} from '@/modules/medical-records/schemas';

export async function createMedicalEntry(input: MedicalEntryInput) {
  const validated = medicalEntrySchema.parse(input);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('examinations')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMedicalEntry(id: string, input: MedicalEntryUpdateInput) {
  const validated = medicalEntryUpdateSchema.parse(input);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('examinations')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function finalizeMedicalEntry(input: MedicalFinalizeInput) {
  const validated = medicalFinalizeSchema.parse(input);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('examinations')
    .update({ is_final: true })
    .eq('id', validated.examination_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function addMedicalAddendum(input: MedicalAddendumInput) {
  const validated = medicalAddendumSchema.parse(input);
  const supabase = await createServerClient();

  // Cek entri ada dan belum final (addendum hanya untuk entri non-final atau sebagai catatan tambahan)
  const { data: entry, error: entryError } = await supabase
    .from('examinations')
    .select('is_final, anamnesis, physical_exam, diagnosis, treatment_plan, weight_kg')
    .eq('id', validated.examination_id)
    .single();
  if (entryError) throw new Error(entryError.message);

  const { data, error } = await supabase
    .from('examinations')
    .update({
      anamnesis: validated.anamnesis ?? entry.anamnesis,
      physical_exam: validated.physical_exam ?? entry.physical_exam,
      diagnosis: validated.diagnosis ?? entry.diagnosis,
      treatment_plan: validated.treatment_plan ?? entry.treatment_plan,
      weight_kg: validated.weight_kg ?? entry.weight_kg,
    })
    .eq('id', validated.examination_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
