import { z } from 'zod';

export const medicalEntrySchema = z.object({
  visit_id: z.string().uuid('Kunjungan wajib dipilih'),
  doctor_id: z.string().uuid('Dokter wajib dipilih'),
  anamnesis: z.string().optional(),
  physical_exam: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  weight_kg: z.number().min(0, 'Berat tidak boleh negatif').optional().nullish(),
  is_final: z.boolean().default(false),
});

export type MedicalEntryInput = z.infer<typeof medicalEntrySchema>;

export const medicalEntryUpdateSchema = z.object({
  visit_id: z.string().uuid().optional(),
  doctor_id: z.string().uuid().optional(),
  anamnesis: z.string().optional(),
  physical_exam: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  weight_kg: z.number().min(0, 'Berat tidak boleh negatif').optional().nullish(),
  is_final: z.boolean().optional(),
});

export type MedicalEntryUpdateInput = z.infer<typeof medicalEntryUpdateSchema>;

export const medicalFinalizeSchema = z.object({
  examination_id: z.string().uuid('Entri medis wajib dipilih'),
});

export type MedicalFinalizeInput = z.infer<typeof medicalFinalizeSchema>;

export const medicalAddendumSchema = z.object({
  examination_id: z.string().uuid('Entri medis wajib dipilih'),
  anamnesis: z.string().optional(),
  physical_exam: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  weight_kg: z.number().min(0, 'Berat tidak boleh negatif').optional().nullish(),
});

export type MedicalAddendumInput = z.infer<typeof medicalAddendumSchema>;

export const medicalAttachmentSchema = z.object({
  examination_id: z.string().uuid('Entri medis wajib dipilih'),
  file_name: z.string().min(1, 'Nama file wajib diisi'),
  file_type: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  file_size: z
    .number()
    .min(1, 'File tidak boleh kosong')
    .max(10 * 1024 * 1024, 'Maksimal 10 MB'),
});

export type MedicalAttachmentInput = z.infer<typeof medicalAttachmentSchema>;
