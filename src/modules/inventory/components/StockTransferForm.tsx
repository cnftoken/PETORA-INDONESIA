'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { stockTransferSchema, type StockTransferInput } from '@/modules/inventory/schemas';

export function StockTransferForm({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<StockTransferInput>;
  onSubmit: (data: StockTransferInput) => void;
}) {
  const form = useForm<StockTransferInput>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      branch_id: initialData?.branch_id ?? '',
      destination_branch_id: initialData?.destination_branch_id ?? '',
      reference: initialData?.reference ?? '',
      notes: initialData?.notes ?? '',
      details: initialData?.details ?? [
        { product_id: '', quantity: 1, batch_no: '', expiry_date: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'details',
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="branch_id">Cabang Asal</Label>
          <select
            id="branch_id"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('branch_id')}
          >
            <option value="">Pilih cabang asal</option>
          </select>
          {form.formState.errors.branch_id && (
            <span className="text-sm text-red-600">{form.formState.errors.branch_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination_branch_id">Cabang Tujuan</Label>
          <select
            id="destination_branch_id"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('destination_branch_id')}
          >
            <option value="">Pilih cabang tujuan</option>
          </select>
          {form.formState.errors.destination_branch_id && (
            <span className="text-sm text-red-600">{form.formState.errors.destination_branch_id.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reference">Referensi Transfer</Label>
        <Input id="reference" placeholder="TRF-2026-000001" {...form.register('reference')} />
        {form.formState.errors.reference && (
          <span className="text-sm text-red-600">{form.formState.errors.reference.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Input id="notes" placeholder="Catatan tambahan transfer" {...form.register('notes')} />
        {form.formState.errors.notes && (
          <span className="text-sm text-red-600">{form.formState.errors.notes.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Detail Transfer</Label>
        <div className="space-y-2">
          {fields.map((field, index) => {
            const productError = form.formState.errors.details?.[index]?.product_id;
            const quantityError = form.formState.errors.details?.[index]?.quantity;
            return (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor={`details_${index}_product_id`}>Produk</Label>
                  <select
                    id={`details_${index}_product_id`}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register(`details.${index}.product_id`)}
                  >
                    <option value="">Pilih produk</option>
                  </select>
                  {productError && (
                    <span className="text-sm text-red-600">{productError.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`details_${index}_quantity`}>Kuantitas</Label>
                  <Input
                    id={`details_${index}_quantity`}
                    type="number"
                    {...form.register(`details.${index}.quantity`)}
                  />
                  {quantityError && (
                    <span className="text-sm text-red-600">{quantityError.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`details_${index}_batch_no`}>Batch</Label>
                  <Input
                    id={`details_${index}_batch_no`}
                    placeholder="BATCH-202611"
                    {...form.register(`details.${index}.batch_no`)}
                  />
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="h-10 w-10 rounded-md border border-input bg-background text-red-600"
                    disabled={fields.length === 1}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => append({ product_id: '', quantity: 1, batch_no: '', expiry_date: '' })}
            className="h-10 rounded-md border border-input bg-background px-4 text-sm"
          >
            + Tambah Item
          </button>
        </div>
        {form.formState.errors.details && (
          <span className="text-sm text-red-600">{form.formState.errors.details.message}</span>
        )}
      </div>

      <Button type="submit">Buat Transfer Stok</Button>
    </form>
  );
}
