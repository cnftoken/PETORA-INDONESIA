'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { stockAdjustmentSchema, type StockAdjustmentInput } from '@/modules/inventory/schemas';

export function StockAdjustmentForm({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<StockAdjustmentInput>;
  onSubmit: (data: StockAdjustmentInput) => void;
}) {
  const form = useForm<StockAdjustmentInput>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      branch_id: initialData?.branch_id ?? '',
      product_id: initialData?.product_id ?? '',
      quantity: initialData?.quantity ?? 1,
      reason: initialData?.reason ?? '',
      type: initialData?.type ?? 'add',
      batch_no: initialData?.batch_no ?? '',
      expiry_date: initialData?.expiry_date ?? '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="branch_id">Cabang</Label>
          <select id="branch_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('branch_id')}>
            <option value="">Pilih cabang</option>
          </select>
          {form.formState.errors.branch_id && (
            <span className="text-sm text-red-600">{form.formState.errors.branch_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_id">Produk</Label>
          <select id="product_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('product_id')}>
            <option value="">Pilih produk</option>
          </select>
          {form.formState.errors.product_id && (
            <span className="text-sm text-red-600">{form.formState.errors.product_id.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Jenis Penyesuaian</Label>
          <select id="type" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('type')}>
            <option value="add">Tambah Stok</option>
            <option value="subtract">Kurangi Stok</option>
            <option value="set">Setel Stok</option>
          </select>
          {form.formState.errors.type && (
            <span className="text-sm text-red-600">{form.formState.errors.type.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Kuantitas</Label>
          <Input id="quantity" type="number" {...form.register('quantity')} />
          {form.formState.errors.quantity && (
            <span className="text-sm text-red-600">{form.formState.errors.quantity.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Alasan</Label>
        <Input id="reason" placeholder="Misal: stock opname, rusak, kadaluwarsa" {...form.register('reason')} />
        {form.formState.errors.reason && (
          <span className="text-sm text-red-600">{form.formState.errors.reason.message}</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batch_no">Nomor Batch</Label>
          <Input id="batch_no" placeholder="BATCH-202611" {...form.register('batch_no')} />
          {form.formState.errors.batch_no && (
            <span className="text-sm text-red-600">{form.formState.errors.batch_no.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry_date">Tanggal Kedaluwarsa</Label>
          <Input id="expiry_date" type="date" {...form.register('expiry_date')} />
          {form.formState.errors.expiry_date && (
            <span className="text-sm text-red-600">{form.formState.errors.expiry_date.message}</span>
          )}
        </div>
      </div>
      <Button type="submit">Simpan Penyesuaian Stok</Button>
    </form>
  );
}
