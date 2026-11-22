import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU wajib diisi').max(50, 'SKU maksimal 50 karakter'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  category_id: z.string().uuid('Kategori wajib dipilih').optional().or(z.literal('')),
  unit: z.string().min(1, 'Satuan wajib diisi').default('pcs'),
  barcode: z.string().optional().or(z.literal('')),
  sale_price: z.number().int().min(0, 'Harga jual tidak boleh negatif'),
  last_purchase_price: z.number().int().min(0, 'Harga beli tidak boleh negatif').optional().default(0),
  is_batch: z.boolean().default(false),
  is_taxable: z.boolean().default(true),
  min_stock: z.number().int().min(0, 'Stok minimum tidak boleh negatif').optional().default(0),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nama layanan wajib diisi'),
  category_id: z.string().uuid('Kategori wajib dipilih').optional().or(z.literal('')),
  price: z.number().int().min(0, 'Harga layanan tidak boleh negatif'),
  is_taxable: z.boolean().default(true),
  executor: z.enum(['dokter', 'perawat', 'staff']).default('dokter'),
  is_active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
