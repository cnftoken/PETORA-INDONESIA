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

export const stockTransferSchema = z.object({
  branch_id: z.string().uuid('Cabang asal wajib dipilih'),
  destination_branch_id: z.string().uuid('Cabang tujuan wajib dipilih'),
  reference: z.string().min(1, 'Referensi transfer wajib diisi'),
  notes: z.string().optional(),
  details: z.array(
    z.object({
      product_id: z.string().uuid('Produk wajib dipilih'),
      quantity: z.number().int().min(1, 'Kuantitas minimal 1'),
      batch_no: z.string().optional(),
      expiry_date: z.string().optional().or(z.literal('')),
    })
  ).min(1, 'Minimal satu item transfer'),
});

export type StockTransferInput = z.infer<typeof stockTransferSchema>;

export const stockTransferSendSchema = z.object({
  transfer_id: z.string().uuid('Transfer wajib dipilih'),
});

export type StockTransferSendInput = z.infer<typeof stockTransferSendSchema>;

export const stockTransferReceiveSchema = z.object({
  transfer_id: z.string().uuid('Transfer wajib dipilih'),
  checked_by: z.string().uuid().optional().nullish(),
});

export type StockTransferReceiveInput = z.infer<typeof stockTransferReceiveSchema>;

export const stockAdjustmentApproveSchema = z.object({
  adjustment_id: z.string().uuid('Penyesuaian wajib dipilih'),
  approved_by: z.string().uuid().optional().nullish(),
});

export type StockAdjustmentApproveInput = z.infer<typeof stockAdjustmentApproveSchema>;

export const stockAdjustmentRejectSchema = z.object({
  adjustment_id: z.string().uuid('Penyesuaian wajib dipilih'),
});

export type StockAdjustmentRejectInput = z.infer<typeof stockAdjustmentRejectSchema>;
