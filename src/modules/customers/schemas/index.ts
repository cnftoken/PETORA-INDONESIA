import { z } from 'zod';

export const customerSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi').max(20, 'Nomor telepon maksimal 20 karakter'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const patientSchema = z.object({
  customer_id: z.string().uuid('Pemilik wajib dipilih'),
  patient_number: z.string().min(1, 'Nomor pasien wajib diisi').max(20, 'Nomor pasien maksimal 20 karakter'),
  name: z.string().min(1, 'Nama hewan wajib diisi'),
  species: z.string().min(1, 'Jenis hewan wajib diisi'),
  breed: z.string().optional(),
  gender: z.enum(['jantan', 'betina']).optional(),
  is_neutered: z.boolean().default(false),
  birth_date: z.string().optional().or(z.literal('')),
  age_years: z.number().int().min(0).optional().nullish(),
  color_marks: z.string().optional(),
  microchip: z.string().optional(),
  photo_url: z.string().optional().or(z.literal('')),
  status: z.enum(['aktif', 'nonaktif', 'meninggal']).default('aktif'),
  owner_id: z.string().uuid().optional().nullish(),
});

export type PatientInput = z.infer<typeof patientSchema>;
