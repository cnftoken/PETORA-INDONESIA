'use server';

import { createServerClient } from '@/lib/supabase/server';
import {
  medicalEntrySchema,
  medicalEntryUpdateSchema,
  medicalFinalizeSchema,
  medicalAddendumSchema,
  medicalAttachmentSchema,
} from '@/modules/medical-records/schemas';
import type {
  MedicalEntryInput,
  MedicalEntryUpdateInput,
  MedicalFinalizeInput,
  MedicalAddendumInput,
  MedicalAttachmentInput,
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

export async function getDiagnosisSuggestions(input: {
  search?: string;
  limit?: number;
}) {
  const { getDiagnosisSuggestions: getSuggestions } = await import(
    '@/modules/medical-records/queries'
  );
  return getSuggestions(input);
}

export async function uploadMedicalAttachment(formData: FormData) {
  const examination_id = formData.get('examination_id') as string;
  const file = formData.get('file') as File;

  if (!examination_id || !file) {
    throw new Error('Entri medis dan file wajib diisi.');
  }

  const validated = medicalAttachmentSchema.parse({
    examination_id,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
  });

  const supabase = await createServerClient();

  // Upload ke storage
  const filePath = `${validated.examination_id}/${crypto.randomUUID()}-${validated.file_name}`;
  const { error: uploadError } = await supabase.storage
    .from('medical-attachments')
    .upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  // Simpan catatan ke database
  const { data, error } = await supabase
    .from('medical_attachments')
    .insert({
      examination_id: validated.examination_id,
      file_name: validated.file_name,
      file_path: filePath,
      file_type: validated.file_type,
      file_size: validated.file_size,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMedicalAttachmentSignedUrl(id: string) {
  const supabase = await createServerClient();

  const { data: attachment, error: attachmentError } = await supabase
    .from('medical_attachments')
    .select('*')
    .eq('id', id)
    .single();
  if (attachmentError) throw new Error(attachmentError.message);

  const { data, error } = await supabase.storage
    .from('medical-attachments')
    .createSignedUrl(attachment.file_path, 3600); // berlaku 1 jam
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deleteMedicalAttachment(id: string) {
  const supabase = await createServerClient();

  const { data: attachment, error: attachmentError } = await supabase
    .from('medical_attachments')
    .select('file_path')
    .eq('id', id)
    .single();
  if (attachmentError) throw new Error(attachmentError.message);

  const { error: storageError } = await supabase.storage
    .from('medical-attachments')
    .remove([attachment.file_path]);
  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase.from('medical_attachments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getMedicalAttachmentsAction(examinationId: string) {
  const { getMedicalAttachments: getAttachments } = await import(
    '@/modules/medical-records/queries'
  );
  return getAttachments(examinationId);
}
