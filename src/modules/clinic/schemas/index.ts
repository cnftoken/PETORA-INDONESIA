import { z } from 'zod';

export const visitSchema = z.object({
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  customer_id: z.string().uuid('Pelanggan wajib dipilih'),
  patient_id: z.string().uuid('Hewan wajib dipilih'),
  complaint: z.string().optional(),
  doctor_id: z.string().uuid().optional().nullish(),
  service_type: z.enum(['konsultasi', 'vaksinasi', 'operasi', 'grooming']).default('konsultasi'),
  status: z.enum(['terdaftar', 'menunggu', 'diperiksa', 'selesai', 'dibatalkan']).default('terdaftar'),
});

export type VisitInput = z.infer<typeof visitSchema>;

export const visitQueueSchema = z.object({
  visit_id: z.string().uuid('Kunjungan wajib dipilih'),
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  queue_number: z.number().int().min(1, 'Nomor antrean minimal 1'),
  status: z.enum(['menunggu', 'dipanggil', 'lewati', 'selesai', 'dibatalkan']).default('menunggu'),
});

export type VisitQueueInput = z.infer<typeof visitQueueSchema>;

export const examinationSchema = z.object({
  visit_id: z.string().uuid('Kunjungan wajib dipilih'),
  doctor_id: z.string().uuid('Dokter wajib dipilih'),
  anamnesis: z.string().optional(),
  physical_exam: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  weight_kg: z.number().min(0, 'Berat tidak boleh negatif').optional().nullish(),
  is_final: z.boolean().default(false),
});

export type ExaminationInput = z.infer<typeof examinationSchema>;

export const prescriptionSchema = z.object({
  examination_id: z.string().uuid('Pemeriksaan wajib dipilih'),
  product_id: z.string().uuid().optional().nullish(),
  medicine_name: z.string().min(1, 'Nama obat wajib diisi'),
  dosage: z.string().min(1, 'Dosis wajib diisi'),
  usage_instruction: z.string().min(1, 'Aturan pakai wajib diisi'),
  quantity: z.number().int().min(1, 'Kuantitas minimal 1').default(1),
  unit_price: z.number().int().min(0, 'Harga satuan tidak boleh negatif').default(0),
  total_price: z.number().int().min(0, 'Total harga tidak boleh negatif').default(0),
  is_taxable: z.boolean().default(true),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;

export const invoiceSchema = z.object({
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  customer_id: z.string().uuid('Pelanggan wajib dipilih'),
  patient_id: z.string().uuid().optional().nullish(),
  visit_id: z.string().uuid().optional().nullish(),
  source: z.enum(['kunjungan', 'rawat_inap', 'retail']),
  subtotal: z.number().int().min(0).default(0),
  vat_amount: z.number().int().min(0).default(0),
  rounding_amount: z.number().int().default(0),
  grand_total: z.number().int().min(0),
  status: z.enum(['belum_lunas', 'sebagian_lunas', 'lunas', 'void']).default('belum_lunas'),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const invoiceLineSchema = z.object({
  invoice_id: z.string().uuid('Tagihan wajib dipilih'),
  line_type: z.enum(['service', 'action', 'medicine', 'product', 'kennel']),
  item_id: z.string().uuid().optional().nullish(),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  quantity: z.number().int().min(1, 'Kuantitas minimal 1').default(1),
  unit_price: z.number().int().min(0, 'Harga satuan tidak boleh negatif').default(0),
  discount_percent: z.number().min(0).max(100).default(0),
  discount_amount: z.number().int().min(0).default(0),
  taxable: z.boolean().default(true),
  tax_amount: z.number().int().min(0).default(0),
  total_price: z.number().int().min(0).default(0),
});

export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;
