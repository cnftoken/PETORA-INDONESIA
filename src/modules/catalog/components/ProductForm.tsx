'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { productSchema, type ProductInput } from '@/modules/catalog/schemas';

export function ProductForm({
  initialData,
  categories,
  onSubmit,
}: {
  initialData?: Partial<ProductInput>;
  categories: { id: string; name: string }[];
  onSubmit: (data: ProductInput) => void;
}) {
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: initialData?.sku ?? '',
      name: initialData?.name ?? '',
      category_id: initialData?.category_id ?? '',
      unit: initialData?.unit ?? 'pcs',
      barcode: initialData?.barcode ?? '',
      sale_price: initialData?.sale_price ?? 0,
      last_purchase_price: initialData?.last_purchase_price ?? 0,
      is_batch: initialData?.is_batch ?? false,
      is_taxable: initialData?.is_taxable ?? true,
      min_stock: initialData?.min_stock ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" placeholder="OBT001" {...form.register('sku')} />
          {form.formState.errors.sku && (
            <span className="text-sm text-red-600">{form.formState.errors.sku.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input id="name" {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category_id">Kategori</Label>
          <select id="category_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('category_id')}>
            <option value="">Pilih kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {form.formState.errors.category_id && (
            <span className="text-sm text-red-600">{form.formState.errors.category_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Satuan</Label>
          <Input id="unit" placeholder="pcs" {...form.register('unit')} />
          {form.formState.errors.unit && (
            <span className="text-sm text-red-600">{form.formState.errors.unit.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input id="barcode" placeholder="0899999999999" {...form.register('barcode')} />
          {form.formState.errors.barcode && (
            <span className="text-sm text-red-600">{form.formState.errors.barcode.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale_price">Harga Jual (Rupiah)</Label>
          <Input id="sale_price" type="number" {...form.register('sale_price')} />
          {form.formState.errors.sale_price && (
            <span className="text-sm text-red-600">{form.formState.errors.sale_price.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="last_purchase_price">Harga Beli Terakhir (Rupiah)</Label>
          <Input id="last_purchase_price" type="number" {...form.register('last_purchase_price')} />
          {form.formState.errors.last_purchase_price && (
            <span className="text-sm text-red-600">{form.formState.errors.last_purchase_price.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Stok Minimum</Label>
          <Input id="min_stock" type="number" {...form.register('min_stock')} />
          {form.formState.errors.min_stock && (
            <span className="text-sm text-red-600">{form.formState.errors.min_stock.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_batch')} />
          Produk berbatch / memiliki kedaluwarsa
        </Label>
        {form.formState.errors.is_batch && (
          <span className="text-sm text-red-600">{form.formState.errors.is_batch.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_taxable')} />
          Kena PPN
        </Label>
        {form.formState.errors.is_taxable && (
          <span className="text-sm text-red-600">{form.formState.errors.is_taxable.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_active')} />
          Aktif
        </Label>
        {form.formState.errors.is_active && (
          <span className="text-sm text-red-600">{form.formState.errors.is_active.message}</span>
        )}
      </div>
      <Button type="submit">Simpan Produk</Button>
    </form>
  );
}
