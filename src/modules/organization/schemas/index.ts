import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(1, 'Nama perusahaan wajib diisi'),
  address: z.string().optional(),
  phone: z.string().optional(),
  npwp: z.string().optional().or(z.literal('')),
  logo_url: z.string().optional().or(z.literal('')),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const branchSchema = z.object({
  code: z.string().min(2, 'Kode cabang minimal 2 karakter').max(5, 'Kode cabang maksimal 5 karakter').regex(/^[A-Z0-9]+$/, 'Kode cabang hanya huruf besar dan angka'),
  name: z.string().min(1, 'Nama cabang wajib diisi'),
  address: z.string().optional(),
  phone: z.string().optional(),
  time_zone: z.string().min(1, 'Zona waktu wajib diisi'),
  is_active: z.boolean().default(true),
});

export type BranchInput = z.infer<typeof branchSchema>;

export const userSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
  phone: z.string().optional(),
  is_active: z.boolean().default(true),
  role_id: z.string().uuid('Role wajib dipilih'),
});

export type UserInput = z.infer<typeof userSchema>;

export const branchAssignmentSchema = z.object({
  user_id: z.string().uuid('Pengguna wajib dipilih'),
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  is_primary: z.boolean().default(false),
});

export type BranchAssignmentInput = z.infer<typeof branchAssignmentSchema>;

export const branchSettingSchema = z.object({
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  vat_active: z.boolean().default(false),
  vat_rate_basis_points: z.number().int().min(0).max(10000, 'Tarif PPN maksimal 100%'),
  vat_mode: z.enum(['exclusive', 'inclusive']),
  rounding_mode: z.enum(['none', '100', '500', '1000']),
  expiry_warning_days: z.number().int().min(1, 'Hari peringatan minimal 1'),
});

export type BranchSettingInput = z.infer<typeof branchSettingSchema>;
