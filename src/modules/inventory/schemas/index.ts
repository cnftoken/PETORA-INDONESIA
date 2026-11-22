import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  product_id: z.string().uuid('Produk wajib dipilih'),
  quantity: z.number().int().min(1, 'Kuantitas penyesuaian minimal 1'),
  reason: z.string().min(1, 'Alasan penyesuaian wajib diisi'),
  type: z.enum(['add', 'subtract', 'set']),
  batch_no: z.string().optional(),
  expiry_date: z.string().optional().or(z.literal('')),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

export const stockDecrementSchema = z.object({
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  product_id: z.string().uuid('Produk wajib dipilih'),
  quantity: z.number().int().min(1, 'Kuantitas pengurangan minimal 1'),
  reference: z.string().min(1, 'Referensi dokumen wajib diisi'),
  reference_type: z.enum(['invoice', 'prescription', 'return', 'adjustment']),
});

export type StockDecrementInput = z.infer<typeof stockDecrementSchema>;

export const stockReturnSchema = z.object({
  branch_id: z.string().uuid('Cabang wajib dipilih'),
  product_id: z.string().uuid('Produk wajib dipilih'),
  quantity: z.number().int().min(1, 'Kuantitas pengembalian minimal 1'),
  reference: z.string().min(1, 'Referensi dokumen wajib diisi'),
  reason: z.string().min(1, 'Alasan pengembalian wajib diisi'),
  condition: z.enum(['good', 'damaged']).default('good'),
});

export type StockReturnInput = z.infer<typeof stockReturnSchema>;
